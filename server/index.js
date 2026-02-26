import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenAI, Type } from '@google/genai';
import Database from 'better-sqlite3';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';
const PORT = Number(process.env.PORT || process.env.API_PORT || 3001);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-change-this-jwt-secret';
const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET || `${JWT_SECRET}-reset`;
const SESSION_COOKIE_NAME = 'cg_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const PASSWORD_RESET_OTP_TTL_MS = 1000 * 60 * 5;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'crisisguardian.db');
const DIST_PATH = path.resolve(process.cwd(), 'dist');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  password_hash TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS institutions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('school','college')),
  name TEXT NOT NULL,
  UNIQUE(type, name)
);

CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  email TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(email) REFERENCES users(email)
);

CREATE TABLE IF NOT EXISTS password_reset_codes (
  email TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(email) REFERENCES users(email)
);
`);

const userColumns = db.prepare('PRAGMA table_info(users)').all();
if (!userColumns.some((column) => column.name === 'password_hash')) {
  db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT');
}

if (!IS_PROD && process.env.JWT_SECRET == null) {
  console.warn('[CrisisGuardian API] JWT_SECRET is not set. Using a development fallback secret.');
}
if (!IS_PROD && !GEMINI_API_KEY) {
  console.warn('[CrisisGuardian API] GEMINI_API_KEY is not configured. AI endpoints will be unavailable.');
}

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const INDIAN_SCHOOLS = [
  'Delhi Public School, R.K. Puram',
  'The Doon School, Dehradun',
  'La Martiniere for Boys, Kolkata',
  'The Scindia School, Gwalior',
  'Mayo College, Ajmer',
  'Shree Swaminarayan Gurukul International School, Hyderabad',
  "St. Xavier's Collegiate School, Kolkata",
  "The Mother's International School, Delhi",
  'Bombay Scottish School, Mahim',
  'Kendriya Vidyalaya'
];

const NIRF_COLLEGES = [
  'Indian Institute of Technology Madras',
  'Indian Institute of Technology Delhi',
  'Indian Institute of Technology Bombay',
  'Indian Institute of Technology Kanpur',
  'Indian Institute of Technology Kharagpur',
  'Jawaharlal Nehru University, New Delhi',
  'All India Institute of Medical Sciences, Delhi',
  'Vellore Institute of Technology',
  'University of Hyderabad',
  'Banaras Hindu University'
];

const defaultAnalytics = () => ({
  totalDrillsCompleted: 0,
  overallScoreSum: 0,
  overallQuestionSum: 0,
  drillsByType: {},
  scoresByType: {}
});

const VALID_ROLES = new Set(['Student', 'Teacher', 'Admin']);
const VALID_INSTITUTION_TYPES = new Set(['school', 'college']);
const VALID_DISASTER_TYPES = new Set(['Earthquake', 'Flood', 'Fire', 'Cyclone']);
const VALID_DRILL_MODES = new Set(['Standard', 'Survival']);
const VALID_VIDEO_STYLES = new Set(['cartoon', 'realistic']);

const nowIso = () => new Date().toISOString();
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const hashPassword = (password) => bcrypt.hashSync(password, 12);
const verifyPassword = (password, hash) => bcrypt.compareSync(password, hash);
const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

const parseRowPayload = (row) => {
  if (!row) return null;
  try {
    return JSON.parse(row.payload);
  } catch {
    return null;
  }
};
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const levelFromXp = (xp) => Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);

const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') return null;

  const email = normalizeEmail(user.email);
  if (!email) return null;

  const normalizedXp = isFiniteNumber(user.xp) ? Math.max(0, Math.round(user.xp)) : 0;
  const normalizedLevel = isFiniteNumber(user.level) ? Math.max(1, Math.round(user.level)) : levelFromXp(normalizedXp);
  const role = VALID_ROLES.has(user.role) ? user.role : 'Student';

  return {
    name: typeof user.name === 'string' ? user.name.trim() : '',
    email,
    phone: typeof user.phone === 'string' && user.phone.trim() ? user.phone.trim() : undefined,
    role,
    institution: typeof user.institution === 'string' ? user.institution.trim() : '',
    score: isFiniteNumber(user.score) ? Math.round(user.score) : 0,
    avatar: typeof user.avatar === 'string' && user.avatar.trim() ? user.avatar : 'avatar1',
    drillHistory: Array.isArray(user.drillHistory) ? user.drillHistory : [],
    xp: normalizedXp,
    level: normalizedLevel,
    trophies: isFiniteNumber(user.trophies) ? Math.max(0, Math.round(user.trophies)) : 0,
    streak: {
      count: isFiniteNumber(user?.streak?.count) ? Math.max(0, Math.round(user.streak.count)) : 0,
      lastActivityDate: user?.streak?.lastActivityDate ?? null,
    },
    unlockedAchievements: Array.isArray(user.unlockedAchievements) ? user.unlockedAchievements : [],
  };
};

const getUserRecord = (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;
  const row = db
    .prepare('SELECT email, payload, password_hash, created_at, updated_at FROM users WHERE email = ?')
    .get(normalizedEmail);
  if (!row) return null;
  const parsed = parseRowPayload(row);
  const normalized = normalizeUser({ ...parsed, email: normalizedEmail });
  if (!normalized) return null;
  return {
    email: normalizedEmail,
    user: normalized,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
};

const upsertUser = ({ email, user, passwordHash, createdAt }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedUser = normalizeUser({ ...user, email: normalizedEmail });
  if (!normalizedUser) throw new Error('Invalid user payload.');
  if (!passwordHash) throw new Error('Password hash is required.');

  const stamp = nowIso();
  db.prepare(`
    INSERT INTO users(email, payload, password_hash, created_at, updated_at)
    VALUES(@email, @payload, @passwordHash, @createdAt, @updatedAt)
    ON CONFLICT(email) DO UPDATE SET
      payload = excluded.payload,
      password_hash = excluded.password_hash,
      updated_at = excluded.updated_at
  `).run({
    email: normalizedEmail,
    payload: JSON.stringify(normalizedUser),
    passwordHash,
    createdAt: createdAt || stamp,
    updatedAt: stamp
  });
  return normalizedUser;
};

const signSessionToken = (user) =>
  jwt.sign({ sub: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

const readSessionTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length);
  }
  return req.cookies?.[SESSION_COOKIE_NAME] || null;
};

const setSessionCookie = (res, token) => {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS
  });
};

const clearSessionCookie = (res) => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/'
  });
};

const getAuthFromRequest = (req) => {
  const token = readSessionTokenFromRequest(req);
  if (!token) return null;

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }

  const email = normalizeEmail(decoded?.sub);
  if (!email) return null;

  return getUserRecord(email);
};

const requireAuth = (req, res, next) => {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  req.auth = auth;
  return next();
};

const requireAdmin = (req, res, next) => {
  if (!req.auth || req.auth.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  return next();
};

const seedInstitutions = () => {
  const insert = db.prepare('INSERT OR IGNORE INTO institutions(type, name) VALUES (?, ?)');
  const tx = db.transaction(() => {
    INDIAN_SCHOOLS.forEach((name) => insert.run('school', name));
    NIRF_COLLEGES.forEach((name) => insert.run('college', name));
  });
  tx();
};

const makeSeedUser = ({ name, email, role, institution, score, avatar, xp, level, trophies, streak }) => ({
  name,
  email: normalizeEmail(email),
  role,
  institution,
  score,
  avatar,
  drillHistory: [],
  xp,
  level,
  trophies,
  streak,
  unlockedAchievements: []
});

const seedUsers = () => {
  const users = [
    makeSeedUser({
      name: 'Test Student',
      email: 'student@test.com',
      role: 'Student',
      institution: 'Indian Institute of Technology Madras',
      score: 78,
      avatar: 'avatar2',
      xp: 1250,
      level: 4,
      trophies: 25,
      streak: { count: 3, lastActivityDate: new Date(Date.now() - 86400000).toISOString() }
    }),
    makeSeedUser({
      name: 'Test Admin',
      email: 'admin@test.com',
      role: 'Admin',
      institution: 'CrisisGuardian HQ',
      score: 0,
      avatar: 'avatar3',
      xp: 0,
      level: 1,
      trophies: 0,
      streak: { count: 0, lastActivityDate: null }
    })
  ];

  const tx = db.transaction(() => {
    users.forEach((user) => {
      const existing = getUserRecord(user.email);
      upsertUser({
        email: user.email,
        user,
        passwordHash: existing?.passwordHash || hashPassword('password'),
        createdAt: existing?.createdAt
      });
    });
  });

  tx();
};

const ensureAnalytics = () => {
  const row = db.prepare('SELECT id FROM analytics WHERE id = 1').get();
  if (!row) {
    db.prepare('INSERT INTO analytics(id, payload, updated_at) VALUES (1, ?, ?)').run(JSON.stringify(defaultAnalytics()), nowIso());
  }
};

const ensureSeedData = () => {
  seedInstitutions();
  ensureAnalytics();

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    seedUsers();
  }
};

const migrateUsers = () => {
  const rows = db.prepare('SELECT email, payload, password_hash FROM users').all();
  if (!rows.length) return;

  const updateStmt = db.prepare('UPDATE users SET payload = ?, password_hash = ?, updated_at = ? WHERE email = ?');
  const tx = db.transaction(() => {
    rows.forEach((row) => {
      const user = parseRowPayload(row);
      if (!user) return;
      const legacyPassword =
        typeof user.password === 'string' && user.password.length >= 6 ? user.password : null;
      const { password, ...strippedUser } = user;
      const normalized = normalizeUser({ ...strippedUser, email: row.email });
      if (!normalized) return;
      const nextPasswordHash = row.password_hash || hashPassword(legacyPassword || 'password');
      updateStmt.run(JSON.stringify(normalized), nextPasswordHash, nowIso(), normalizeEmail(row.email));
    });
  });
  tx();
};

ensureSeedData();
migrateUsers();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

const allowedOrigins = new Set(
  [FRONTEND_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'].filter(Boolean)
);

app.set('trust proxy', 1);
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS.'));
    },
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, dbPath: DB_PATH, env: NODE_ENV });
});

app.post('/api/seed', (_req, res) => {
  if (IS_PROD) {
    return res.status(403).json({ error: 'Seeding is disabled in production.' });
  }
  ensureSeedData();
  return res.json({ ok: true });
});

app.get('/api/institutions', (_req, res) => {
  const schools = db.prepare("SELECT name FROM institutions WHERE type = 'school' ORDER BY name").all().map((r) => r.name);
  const colleges = db.prepare("SELECT name FROM institutions WHERE type = 'college' ORDER BY name").all().map((r) => r.name);
  res.json({ schools, colleges });
});

app.post('/api/institutions', requireAuth, requireAdmin, (req, res) => {
  const { name, type } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (!VALID_INSTITUTION_TYPES.has(type)) {
    return res.status(400).json({ error: 'Type must be school or college.' });
  }

  try {
    db.prepare('INSERT INTO institutions(type, name) VALUES (?, ?)').run(type, name.trim());
    return res.status(201).json({ ok: true });
  } catch (error) {
    if (String(error.message || '').includes('UNIQUE')) {
      return res.status(409).json({ error: 'Institution already exists.' });
    }
    return res.status(500).json({ error: 'Failed to add institution.' });
  }
});

app.post('/api/auth/check-email', authLimiter, (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }
  const exists = Boolean(db.prepare('SELECT 1 FROM users WHERE email = ?').get(email));
  return res.json({ exists });
});

app.post('/api/auth/signup', authLimiter, (req, res) => {
  const { name, email, password, role, institution, phone, avatar } = req.body || {};
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  if (typeof name !== 'string' || name.trim().length < 3) {
    return res.status(400).json({ error: 'Name must be at least 3 characters.' });
  }
  if (!VALID_ROLES.has(role)) {
    return res.status(400).json({ error: 'Role is invalid.' });
  }
  if (typeof institution !== 'string' || !institution.trim()) {
    return res.status(400).json({ error: 'Institution is required.' });
  }

  if (getUserRecord(normalizedEmail)) {
    return res.status(409).json({ error: 'User already exists.' });
  }

  const user = normalizeUser({
    name: name.trim(),
    email: normalizedEmail,
    phone: typeof phone === 'string' ? phone.trim() : undefined,
    role,
    institution: institution.trim(),
    avatar: typeof avatar === 'string' && avatar.trim() ? avatar : 'avatar1',
    score: 0,
    drillHistory: [],
    xp: 0,
    level: 1,
    trophies: 0,
    streak: { count: 0, lastActivityDate: null },
    unlockedAchievements: []
  });

  const savedUser = upsertUser({
    email: normalizedEmail,
    user,
    passwordHash: hashPassword(password)
  });
  setSessionCookie(res, signSessionToken(savedUser));
  return res.status(201).json({ user: savedUser });
});

app.post('/api/auth/login', authLimiter, (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;

  if (!email || !isValidEmail(email) || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const record = getUserRecord(email);
  if (!record || !record.passwordHash || !verifyPassword(password, record.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  setSessionCookie(res, signSessionToken(record.user));
  return res.json({ user: record.user });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  return res.json({ user: req.auth.user });
});

app.post('/api/auth/logout', (_req, res) => {
  clearSessionCookie(res);
  return res.json({ ok: true });
});

app.post('/api/auth/request-password-reset', authLimiter, (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }

  const userRecord = getUserRecord(email);
  if (userRecord) {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const stamp = nowIso();
    db.prepare(`
      INSERT INTO password_reset_codes(email, code_hash, expires_at, attempts, created_at, updated_at)
      VALUES(@email, @codeHash, @expiresAt, 0, @createdAt, @updatedAt)
      ON CONFLICT(email) DO UPDATE SET
        code_hash = excluded.code_hash,
        expires_at = excluded.expires_at,
        attempts = 0,
        updated_at = excluded.updated_at
    `).run({
      email,
      codeHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_OTP_TTL_MS).toISOString(),
      createdAt: stamp,
      updatedAt: stamp
    });

    if (!IS_PROD) {
      return res.json({ ok: true, otpHint: otp });
    }
  }

  return res.json({ ok: true });
});

app.post('/api/auth/verify-password-reset', authLimiter, (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const otp = String(req.body?.otp || '').trim();
  if (!email || !isValidEmail(email) || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: 'Invalid email or OTP format.' });
  }

  const row = db
    .prepare('SELECT email, code_hash, expires_at, attempts FROM password_reset_codes WHERE email = ?')
    .get(email);
  if (!row) {
    return res.status(400).json({ error: 'Invalid or expired verification code.' });
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM password_reset_codes WHERE email = ?').run(email);
    return res.status(400).json({ error: 'Invalid or expired verification code.' });
  }

  if (row.code_hash !== hashOtp(otp)) {
    const attempts = Number(row.attempts || 0) + 1;
    if (attempts >= 5) {
      db.prepare('DELETE FROM password_reset_codes WHERE email = ?').run(email);
    } else {
      db.prepare('UPDATE password_reset_codes SET attempts = ?, updated_at = ? WHERE email = ?').run(
        attempts,
        nowIso(),
        email
      );
    }
    return res.status(400).json({ error: 'Invalid or expired verification code.' });
  }

  db.prepare('DELETE FROM password_reset_codes WHERE email = ?').run(email);
  const resetToken = jwt.sign({ sub: email, purpose: 'password-reset' }, RESET_TOKEN_SECRET, {
    expiresIn: '10m'
  });
  return res.json({ ok: true, resetToken });
});

app.post('/api/auth/reset-password', authLimiter, (req, res) => {
  const resetToken = String(req.body?.resetToken || '');
  const newPassword = String(req.body?.newPassword || '');
  if (!resetToken) {
    return res.status(400).json({ error: 'Reset token is required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(resetToken, RESET_TOKEN_SECRET);
  } catch {
    return res.status(400).json({ error: 'Invalid or expired reset token.' });
  }

  const email = normalizeEmail(decoded?.sub);
  if (!email || decoded?.purpose !== 'password-reset') {
    return res.status(400).json({ error: 'Invalid or expired reset token.' });
  }

  const record = getUserRecord(email);
  if (!record) {
    return res.status(404).json({ error: 'User not found.' });
  }

  upsertUser({
    email,
    user: record.user,
    passwordHash: hashPassword(newPassword),
    createdAt: record.createdAt
  });

  return res.json({ ok: true });
});

app.get('/api/users', requireAuth, requireAdmin, (_req, res) => {
  const rows = db.prepare('SELECT payload FROM users').all();
  res.json(rows.map(parseRowPayload).map(normalizeUser));
});

app.get('/api/users/:email', requireAuth, (req, res) => {
  const email = normalizeEmail(req.params.email);
  if (!email) {
    return res.status(400).json({ error: 'Invalid email.' });
  }
  if (req.auth.user.role !== 'Admin' && req.auth.email !== email) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  const row = db.prepare('SELECT payload FROM users WHERE email = ?').get(email);
  if (!row) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json(normalizeUser(parseRowPayload(row)));
});

app.post('/api/users', requireAuth, requireAdmin, (req, res) => {
  const user = req.body;
  if (!user || !user.email) {
    return res.status(400).json({ error: 'User payload with email is required.' });
  }

  const email = normalizeEmail(user.email);
  const existing = db.prepare('SELECT email FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'User already exists.' });
  }
  const password = typeof user.password === 'string' && user.password.length >= 6 ? user.password : 'password';

  const canonicalUser = normalizeUser({ ...user, email, trophies: user.trophies ?? 0 });
  upsertUser({
    email,
    user: canonicalUser,
    passwordHash: hashPassword(password)
  });

  return res.status(201).json({ ok: true });
});

app.put('/api/users/:email', requireAuth, (req, res) => {
  const email = normalizeEmail(req.params.email);
  const user = req.body;
  if (!user) {
    return res.status(400).json({ error: 'User payload is required.' });
  }
  if (req.auth.user.role !== 'Admin' && req.auth.email !== email) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  const existing = getUserRecord(email);
  const safeRole =
    req.auth.user.role === 'Admin' && VALID_ROLES.has(user.role)
      ? user.role
      : existing?.user?.role || req.auth.user.role;
  const canonicalUser = normalizeUser({ ...existing?.user, ...user, email, role: safeRole });
  upsertUser({
    email,
    user: canonicalUser,
    passwordHash: existing?.passwordHash || hashPassword('password'),
    createdAt: existing?.createdAt
  });

  return res.json({ ok: true });
});

app.patch('/api/users/:email/password', requireAuth, (req, res) => {
  const email = normalizeEmail(req.params.email);
  const { password } = req.body || {};
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  if (req.auth.user.role !== 'Admin' && req.auth.email !== email) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  const record = getUserRecord(email);
  if (!record) {
    return res.status(404).json({ error: 'User not found.' });
  }

  upsertUser({
    email,
    user: record.user,
    passwordHash: hashPassword(password),
    createdAt: record.createdAt
  });
  return res.json({ ok: true });
});

app.get('/api/session', (req, res) => {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return res.json(null);
  }
  return res.json(auth.user);
});

app.put('/api/session', requireAuth, (req, res) => {
  const user = req.body;
  if (!user || !user.email) {
    return res.status(400).json({ error: 'User payload with email is required.' });
  }

  const email = normalizeEmail(user.email);
  if (req.auth.user.role !== 'Admin' && req.auth.email !== email) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  const existing = getUserRecord(email);
  const canonicalUser = normalizeUser({
    ...existing?.user,
    ...user,
    email,
    role: existing?.user?.role || req.auth.user.role
  });
  upsertUser({
    email,
    user: canonicalUser,
    passwordHash: existing?.passwordHash || req.auth.passwordHash || hashPassword('password'),
    createdAt: existing?.createdAt
  });
  return res.json({ ok: true });
});

app.delete('/api/session', (_req, res) => {
  clearSessionCookie(res);
  return res.json({ ok: true });
});

app.get('/api/analytics', requireAuth, requireAdmin, (_req, res) => {
  const row = db.prepare('SELECT payload FROM analytics WHERE id = 1').get();
  if (!row) {
    return res.json(defaultAnalytics());
  }
  return res.json(parseRowPayload(row));
});

app.post('/api/analytics/drill-complete', requireAuth, (req, res) => {
  const result = req.body || {};
  if (!VALID_DISASTER_TYPES.has(result.disasterType)) {
    return res.status(400).json({ error: 'Invalid disaster type.' });
  }
  if (!VALID_DRILL_MODES.has(result.mode)) {
    return res.status(400).json({ error: 'Invalid drill mode.' });
  }

  const analytics = parseRowPayload(db.prepare('SELECT payload FROM analytics WHERE id = 1').get()) || defaultAnalytics();
  analytics.totalDrillsCompleted = Number(analytics.totalDrillsCompleted || 0) + 1;
  analytics.drillsByType = analytics.drillsByType || {};
  analytics.scoresByType = analytics.scoresByType || {};
  analytics.drillsByType[result.disasterType] = Number(analytics.drillsByType[result.disasterType] || 0) + 1;

  if (
    result.mode === 'Standard' &&
    isFiniteNumber(result.score) &&
    isFiniteNumber(result.totalQuestions) &&
    result.totalQuestions > 0
  ) {
    analytics.overallScoreSum = Number(analytics.overallScoreSum || 0) + Math.round(result.score);
    analytics.overallQuestionSum = Number(analytics.overallQuestionSum || 0) + Math.round(result.totalQuestions);
    const byType = analytics.scoresByType[result.disasterType] || { scoreSum: 0, questionSum: 0, count: 0 };
    analytics.scoresByType[result.disasterType] = {
      scoreSum: Number(byType.scoreSum || 0) + Math.round(result.score),
      questionSum: Number(byType.questionSum || 0) + Math.round(result.totalQuestions),
      count: Number(byType.count || 0) + 1
    };
  }

  db.prepare(`
    INSERT INTO analytics(id, payload, updated_at)
    VALUES(1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      payload = excluded.payload,
      updated_at = excluded.updated_at
  `).run(JSON.stringify(analytics), nowIso());

  return res.json({ ok: true });
});

app.put('/api/analytics', requireAuth, requireAdmin, (req, res) => {
  const payload = req.body;
  if (!payload) {
    return res.status(400).json({ error: 'Analytics payload is required.' });
  }

  db.prepare(`
    INSERT INTO analytics(id, payload, updated_at)
    VALUES(1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      payload = excluded.payload,
      updated_at = excluded.updated_at
  `).run(JSON.stringify(payload), nowIso());

  return res.json({ ok: true });
});

const drillResponseSchema = {
  type: Type.OBJECT,
  properties: {
    scenario: {
      type: Type.STRING,
      description: 'A detailed paragraph describing a disaster situation unfolding in a school.'
    },
    question: {
      type: Type.STRING,
      description: 'A clear question asking the immediate next action.'
    },
    options: {
      type: Type.ARRAY,
      description: 'An array of exactly three possible actions.',
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          isCorrect: { type: Type.BOOLEAN },
          feedback: { type: Type.STRING }
        },
        required: ['text', 'isCorrect', 'feedback']
      }
    },
    aiAdvice: {
      type: Type.STRING,
      description: 'A concise actionable hint.'
    }
  },
  required: ['scenario', 'question', 'options', 'aiAdvice']
};

const ensureAiReady = (res) => {
  if (!ai || !GEMINI_API_KEY) {
    res.status(503).json({ error: 'GEMINI_API_KEY is not configured.' });
    return false;
  }
  return true;
};

const generateDrillScenario = async (disasterType, region, mode, previousStepContext) => {
  const studentFocus = 'All scenarios and options must be easy for a school student in India to understand.';
  let prompt = '';

  if (previousStepContext) {
    const { scenario, question, userAnswer, stepsSurvived } = previousStepContext;
    if (mode === 'Survival') {
      prompt = `This is a continuous SURVIVAL MODE disaster drill about a ${disasterType} in a school in ${region}, India. The user has correctly survived ${stepsSurvived} scenarios so far.
The previous situation was: "${scenario}".
The user correctly chose the action: "${userAnswer?.text || ''}".
Generate the next logical follow-up scenario in this evolving story. It should become slightly more intense while staying realistic for a student perspective. Create one question and three options with one correct answer. ${studentFocus}`;
    } else {
      prompt = `This is a multi-step standard disaster drill for a ${disasterType} in a school in ${region}, India.
The previous situation was: "${scenario}".
The question asked was: "${question}".
The user chose the action: "${userAnswer?.text || ''}", which was ${userAnswer?.isCorrect ? 'correct' : 'incorrect'}.
Generate a logical follow-up scenario, with one new question and three options (one correct). ${studentFocus}`;
    }
  } else {
    const modeDescription = mode === 'Survival'
      ? 'This is the start of a continuous SURVIVAL MODE drill.'
      : 'This is the start of a standard multi-step drill.';
    prompt = `Generate a realistic initial-stage disaster scenario for a ${disasterType} in a school located in ${region}, India. ${modeDescription}
Use a student perspective. Create one question with exactly three options, one correct and two plausible incorrect, plus brief feedback and a concise hint. ${studentFocus}`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: drillResponseSchema,
      temperature: 0.8
    }
  });

  const parsed = JSON.parse(response.text.trim());
  const options = Array.isArray(parsed?.options) ? parsed.options : [];
  const valid =
    typeof parsed?.scenario === 'string' &&
    typeof parsed?.question === 'string' &&
    typeof parsed?.aiAdvice === 'string' &&
    options.length === 3 &&
    options.every(
      (option) =>
        typeof option?.text === 'string' &&
        typeof option?.isCorrect === 'boolean' &&
        typeof option?.feedback === 'string'
    );

  return valid ? parsed : null;
};

const generateSafetyTips = async (context) => {
  let contextDescription;
  switch (context) {
    case 'home':
      contextDescription = 'on the main home screen of the app. Give general preparedness tips.';
      break;
    case 'modules':
      contextDescription = 'looking at the list of disaster modules. Give tips about the importance of learning.';
      break;
    case 'drills':
      contextDescription = 'in the drills lobby, preparing to start a simulation. Give tips on how to approach a drill.';
      break;
    case 'Earthquake':
    case 'Flood':
    case 'Fire':
    case 'Cyclone':
      contextDescription = `studying the '${context}' disaster module. Give specific tips for this disaster.`;
      break;
    default:
      contextDescription = 'using the app. Give general safety tips.';
      break;
  }

  const prompt = `You are an AI Safety Advisor for the CrisisGuardian app. A user is currently ${contextDescription}
Generate 3 to 5 concise, actionable safety tips for students in India.
Format each tip on a new line and prefix each line with an emoji. Avoid markdown bullets.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { temperature: 0.7 }
  });

  return response.text;
};

const generateVideoLesson = async (disasterType, videoStyle) => {
  const styleDescription =
    videoStyle === 'cartoon'
      ? 'an engaging, clear, and friendly 2D animated cartoon style suitable for students. Simple characters, bright colors.'
      : 'a realistic, high-fidelity simulation with a serious but non-graphic tone.';

  const coreContent = {
    Earthquake:
      "A school classroom starts shaking. Students practice 'Drop, Cover, and Hold On' under desks. Show evacuation to an open assembly point. End with title card: Earthquake Safety: Drop, Cover, Hold On!",
    Flood:
      "Heavy rain causes water to rise around a school. Show students calmly moving to a higher floor. Show a car being swept away with text: Turn Around, Don't Drown. End with title card: Flood Preparedness: Stay Safe, Stay Dry.",
    Fire:
      'A smoke alarm blares in a school hallway. Show students crawling low under smoke. A teacher demonstrates PASS extinguisher method on a controlled fire. Evacuate to assembly point. End with title card: Fire Emergency: Get Out, Stay Out!',
    Cyclone:
      'Strong winds and rain lash school windows. Show students sheltered in a strong interior room away from windows. A tree branch falls outside. Show post-cyclone downed power lines. End with title card: Cyclone Alert: Weather the Storm Safely.'
  };

  const prompt = `Generate a short silent educational video (~30 seconds) about ${disasterType} safety in a school setting in India.
The video style should be ${styleDescription}
The scene should show: ${coreContent[disasterType]}`;

  let operation = await ai.models.generateVideos({
    model: 'veo-2.0-generate-001',
    prompt,
    config: { numberOfVideos: 1 }
  });

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    return null;
  }

  const response = await fetch(`${downloadLink}&key=${GEMINI_API_KEY}`);
  if (!response.ok) {
    return null;
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || 'video/mp4';
  return { buffer: Buffer.from(arrayBuffer), contentType };
};

app.post('/api/ai/drill-scenario', requireAuth, aiLimiter, async (req, res) => {
  if (!ensureAiReady(res)) return;

  const { disasterType, region, mode, previousStepContext } = req.body || {};
  if (!VALID_DISASTER_TYPES.has(disasterType)) {
    return res.status(400).json({ error: 'Invalid disaster type.' });
  }
  if (!VALID_DRILL_MODES.has(mode)) {
    return res.status(400).json({ error: 'Invalid drill mode.' });
  }
  if (typeof region !== 'string' || !region.trim()) {
    return res.status(400).json({ error: 'Region is required.' });
  }

  try {
    const scenario = await generateDrillScenario(disasterType, region.trim(), mode, previousStepContext);
    if (!scenario) {
      return res.status(502).json({ error: 'Failed to generate scenario.' });
    }
    return res.json(scenario);
  } catch (error) {
    console.error('Error generating drill scenario:', error);
    return res.status(502).json({ error: 'AI scenario generation failed.' });
  }
});

app.post('/api/ai/safety-tips', requireAuth, aiLimiter, async (req, res) => {
  if (!ensureAiReady(res)) return;

  const { context } = req.body || {};
  if (typeof context !== 'string' || !context.trim()) {
    return res.status(400).json({ error: 'Context is required.' });
  }

  try {
    const tips = await generateSafetyTips(context.trim());
    return res.json({ tips });
  } catch (error) {
    console.error('Error generating safety tips:', error);
    return res.status(502).json({ error: 'AI safety tips generation failed.' });
  }
});

app.post('/api/ai/video-lesson', requireAuth, aiLimiter, async (req, res) => {
  if (!ensureAiReady(res)) return;

  const { disasterType, videoStyle } = req.body || {};
  if (!VALID_DISASTER_TYPES.has(disasterType)) {
    return res.status(400).json({ error: 'Invalid disaster type.' });
  }
  if (!VALID_VIDEO_STYLES.has(videoStyle)) {
    return res.status(400).json({ error: 'Invalid video style.' });
  }

  try {
    const generated = await generateVideoLesson(disasterType, videoStyle);
    if (!generated) {
      return res.status(502).json({ error: 'Failed to generate video lesson.' });
    }
    res.setHeader('Content-Type', generated.contentType);
    res.setHeader('Cache-Control', 'no-store');
    return res.send(generated.buffer);
  } catch (error) {
    console.error('Error generating video lesson:', error);
    return res.status(502).json({ error: 'AI video generation failed.' });
  }
});

// Serve frontend build in production deployment.
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    return res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[CrisisGuardian API] Running on http://localhost:${PORT}`);
  console.log(`[CrisisGuardian API] SQLite file: ${DB_PATH}`);
  if (fs.existsSync(DIST_PATH)) {
    console.log(`[CrisisGuardian Web] Serving static files from: ${DIST_PATH}`);
  }
});
