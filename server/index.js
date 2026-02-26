import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const PORT = Number(process.env.PORT || process.env.API_PORT || 3001);
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
`);

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

const nowIso = () => new Date().toISOString();

const parseRowPayload = (row) => (row ? JSON.parse(row.payload) : null);
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const levelFromXp = (xp) => Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);

const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') return user;

  const normalizedXp = isFiniteNumber(user.xp) ? Math.max(0, Math.round(user.xp)) : 0;
  const normalizedLevel = isFiniteNumber(user.level) ? Math.max(1, Math.round(user.level)) : levelFromXp(normalizedXp);

  return {
    ...user,
    score: isFiniteNumber(user.score) ? Math.round(user.score) : 0,
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
  email,
  password: 'password',
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

  const upsert = db.prepare(`
    INSERT INTO users(email, payload, created_at, updated_at)
    VALUES(@email, @payload, @createdAt, @updatedAt)
    ON CONFLICT(email) DO UPDATE SET
      payload = excluded.payload,
      updated_at = excluded.updated_at
  `);

  const tx = db.transaction(() => {
    users.forEach((user) => {
      const stamp = nowIso();
      upsert.run({
        email: user.email.toLowerCase(),
        payload: JSON.stringify({ ...user, email: user.email.toLowerCase() }),
        createdAt: stamp,
        updatedAt: stamp
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
  const rows = db.prepare('SELECT email, payload FROM users').all();
  if (!rows.length) return;

  const updateStmt = db.prepare('UPDATE users SET payload = ?, updated_at = ? WHERE email = ?');
  const tx = db.transaction(() => {
    rows.forEach((row) => {
      const user = JSON.parse(row.payload);
      const normalized = normalizeUser(user);
      if (JSON.stringify(user) !== JSON.stringify(normalized)) {
        updateStmt.run(JSON.stringify(normalized), nowIso(), row.email);
      }
    });
  });
  tx();
};

ensureSeedData();
migrateUsers();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, dbPath: DB_PATH });
});

app.post('/api/seed', (_req, res) => {
  ensureSeedData();
  res.json({ ok: true });
});

app.get('/api/institutions', (_req, res) => {
  const schools = db.prepare("SELECT name FROM institutions WHERE type = 'school' ORDER BY name").all().map((r) => r.name);
  const colleges = db.prepare("SELECT name FROM institutions WHERE type = 'college' ORDER BY name").all().map((r) => r.name);
  res.json({ schools, colleges });
});

app.post('/api/institutions', (req, res) => {
  const { name, type } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (type !== 'school' && type !== 'college') {
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

app.get('/api/users', (_req, res) => {
  const rows = db.prepare('SELECT payload FROM users').all();
  res.json(rows.map(parseRowPayload).map(normalizeUser));
});

app.get('/api/users/:email', (req, res) => {
  const email = String(req.params.email || '').toLowerCase();
  const row = db.prepare('SELECT payload FROM users WHERE email = ?').get(email);
  res.json(normalizeUser(parseRowPayload(row)));
});

app.post('/api/users', (req, res) => {
  const user = req.body;
  if (!user || !user.email) {
    return res.status(400).json({ error: 'User payload with email is required.' });
  }

  const email = String(user.email).toLowerCase();
  const existing = db.prepare('SELECT email FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'User already exists.' });
  }

  const stamp = nowIso();
  const canonicalUser = normalizeUser({ ...user, email, trophies: user.trophies ?? 0 });
  db.prepare('INSERT INTO users(email, payload, created_at, updated_at) VALUES (?, ?, ?, ?)').run(
    email,
    JSON.stringify(canonicalUser),
    stamp,
    stamp
  );

  return res.status(201).json({ ok: true });
});

app.put('/api/users/:email', (req, res) => {
  const email = String(req.params.email || '').toLowerCase();
  const user = req.body;
  if (!user) {
    return res.status(400).json({ error: 'User payload is required.' });
  }

  const stamp = nowIso();
  const canonicalUser = normalizeUser({ ...user, email });
  db.prepare(`
    INSERT INTO users(email, payload, created_at, updated_at)
    VALUES(@email, @payload, @createdAt, @updatedAt)
    ON CONFLICT(email) DO UPDATE SET
      payload = excluded.payload,
      updated_at = excluded.updated_at
  `).run({
    email,
    payload: JSON.stringify(canonicalUser),
    createdAt: stamp,
    updatedAt: stamp
  });

  return res.json({ ok: true });
});

app.patch('/api/users/:email/password', (req, res) => {
  const email = String(req.params.email || '').toLowerCase();
  const { password } = req.body || {};
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required.' });
  }

  const row = db.prepare('SELECT payload FROM users WHERE email = ?').get(email);
  if (!row) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const user = normalizeUser(parseRowPayload(row));
  user.password = password;

  db.prepare('UPDATE users SET payload = ?, updated_at = ? WHERE email = ?').run(JSON.stringify(user), nowIso(), email);
  return res.json({ ok: true });
});

app.get('/api/session', (_req, res) => {
  const sessionRow = db.prepare('SELECT email FROM sessions WHERE id = 1').get();
  if (!sessionRow) {
    return res.json(null);
  }

  const userRow = db.prepare('SELECT payload FROM users WHERE email = ?').get(sessionRow.email);
  return res.json(normalizeUser(parseRowPayload(userRow)));
});

app.put('/api/session', (req, res) => {
  const user = req.body;
  if (!user || !user.email) {
    return res.status(400).json({ error: 'User payload with email is required.' });
  }

  const email = String(user.email).toLowerCase();
  const canonicalUser = normalizeUser({ ...user, email });
  const stamp = nowIso();

  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO users(email, payload, created_at, updated_at)
      VALUES(@email, @payload, @createdAt, @updatedAt)
      ON CONFLICT(email) DO UPDATE SET
        payload = excluded.payload,
        updated_at = excluded.updated_at
    `).run({
      email,
      payload: JSON.stringify(canonicalUser),
      createdAt: stamp,
      updatedAt: stamp
    });

    db.prepare(`
      INSERT INTO sessions(id, email, updated_at)
      VALUES(1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        email = excluded.email,
        updated_at = excluded.updated_at
    `).run(email, stamp);
  });

  tx();
  return res.json({ ok: true });
});

app.delete('/api/session', (_req, res) => {
  db.prepare('DELETE FROM sessions WHERE id = 1').run();
  res.json({ ok: true });
});

app.get('/api/analytics', (_req, res) => {
  const row = db.prepare('SELECT payload FROM analytics WHERE id = 1').get();
  if (!row) {
    return res.json(defaultAnalytics());
  }
  return res.json(parseRowPayload(row));
});

app.put('/api/analytics', (req, res) => {
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
