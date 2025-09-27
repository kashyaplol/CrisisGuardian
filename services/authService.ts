// services/authService.ts
import { User, UserRole } from '../types';
import { INDIAN_SCHOOLS, NIRF_COLLEGES, DEFAULT_AVATARS } from '../constants';

const USERS_DB_KEY = 'crisis_guardian_users';
const SESSION_KEY = 'crisis_guardian_session';
const OTP_KEY = 'crisis_guardian_otp';
const INSTITUTIONS_DB_KEY = 'crisis_guardian_institutions';

const MOCK_API_LATENCY = 500; // ms

// --- Helper function to simulate async operations ---
const asyncLocalStorage = {
  getItem: (key: string): Promise<string | null> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(localStorage.getItem(key));
      }, MOCK_API_LATENCY / 2); // Reads are faster
    });
  },
  setItem: (key: string, value: string): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        localStorage.setItem(key, value);
        resolve();
      }, MOCK_API_LATENCY);
    });
  },
  removeItem: (key: string): Promise<void> => {
      return new Promise(resolve => {
        setTimeout(() => {
            localStorage.removeItem(key);
            resolve();
        }, MOCK_API_LATENCY);
      });
  }
};

// --- Institution Database Simulation ---

interface InstitutionsDB {
    schools: string[];
    colleges: string[];
}

export const getInstitutions = async (): Promise<InstitutionsDB> => {
    const stored = await asyncLocalStorage.getItem(INSTITUTIONS_DB_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    // Seed the database if it doesn't exist
    const initialData: InstitutionsDB = {
        schools: INDIAN_SCHOOLS,
        colleges: NIRF_COLLEGES,
    };
    await asyncLocalStorage.setItem(INSTITUTIONS_DB_KEY, JSON.stringify(initialData));
    return initialData;
};

export const addInstitution = async (name: string, type: 'school' | 'college'): Promise<boolean> => {
    if (!name.trim()) return false;
    const db = await getInstitutions();
    const list = type === 'school' ? db.schools : db.colleges;
    
    if (list.find(i => i.toLowerCase() === name.trim().toLowerCase())) {
        return false; // Already exists
    }

    list.push(name.trim());
    await asyncLocalStorage.setItem(INSTITUTIONS_DB_KEY, JSON.stringify(db));
    return true;
};

// --- User Database Simulation (localStorage) ---

const getUsers = async (): Promise<Record<string, User>> => {
  const usersJson = await asyncLocalStorage.getItem(USERS_DB_KEY);
  return usersJson ? JSON.parse(usersJson) : {};
};

export const getAllUsers = async (): Promise<User[]> => {
    const users = await getUsers();
    return Object.values(users);
};

const saveUsers = async (users: Record<string, User>) => {
  await asyncLocalStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

export const seedInitialUsers = async () => {
    const users = await getUsers();
    let usersModified = false;

    // Test Student
    const studentEmail = 'student@test.com';
    const studentData = {
        name: 'Test Student',
        email: studentEmail,
        password: 'password',
        role: UserRole.Student,
        institution: 'Indian Institute of Technology Madras',
        score: 78,
        avatar: DEFAULT_AVATARS[1].id,
        drillHistory: [],
        xp: 1250,
        level: 4,
        trophies: 25,
        streak: { count: 3, lastActivityDate: new Date(Date.now() - 86400000).toISOString() },
        unlockedAchievements: [],
    };

    // If user doesn't exist or is missing new properties, create/overwrite it.
    if (!users[studentEmail] || users[studentEmail].trophies === undefined) {
        users[studentEmail] = studentData;
        usersModified = true;
    }

    // Test Admin
    const adminEmail = 'admin@test.com';
    const adminData = {
        name: 'Test Admin',
        email: adminEmail,
        password: 'password',
        role: UserRole.Admin,
        institution: 'CrisisGuardian HQ',
        score: 0,
        avatar: DEFAULT_AVATARS[2].id,
        drillHistory: [],
        xp: 0,
        level: 1,
        trophies: 0,
        streak: { count: 0, lastActivityDate: null },
        unlockedAchievements: [],
    };
    
    // If user doesn't exist or is missing new properties, create/overwrite it.
    if (!users[adminEmail] || users[adminEmail].trophies === undefined) {
        users[adminEmail] = adminData;
        usersModified = true;
    }

    if (usersModified) {
        await saveUsers(users);
        console.log('[CrisisGuardian] Initial test users seeded or updated.');
    }
};


export const findUserByEmail = async (email: string): Promise<User | null> => {
  const users = await getUsers();
  return users[email.toLowerCase()] || null;
};

export const createUser = async (user: User): Promise<boolean> => {
  const users = await getUsers();
  const email = user.email.toLowerCase();
  if (users[email]) {
    // User already exists
    return false;
  }
  // Ensure the canonical user object also has the lowercase email.
  users[email] = { ...user, email, trophies: 0 };
  await saveUsers(users);
  return true;
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const user = await findUserByEmail(email);
  // In a real app, you would compare a hashed password, not plain text.
  if (user && user.password === password) {
    return user;
  }
  return null;
};

export const updatePassword = async (email: string, newPassword: string): Promise<boolean> => {
  const users = await getUsers();
  const lowerCaseEmail = email.toLowerCase();
  if (users[lowerCaseEmail]) {
    users[lowerCaseEmail].password = newPassword;
    await saveUsers(users);
    return true;
  }
  return false;
};


// --- OTP Simulation (sessionStorage + console.log) ---

export const sendOtp = (email: string): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpData = { email: email.toLowerCase(), otp, timestamp: Date.now() };
  
  // Store OTP in sessionStorage for verification
  sessionStorage.setItem(OTP_KEY, JSON.stringify(otpData));

  // Simulate sending OTP by logging to console
  console.log(`%c[CrisisGuardian] OTP for ${email}: ${otp}`, 'color: #0ea5e9; font-weight: bold; font-size: 14px;');
  console.log('%cThis is a simulated OTP. In a real app, this would be sent via email or SMS.', 'color: #64748b;');
  
  return otp;
};

export const verifyOtp = (email: string, otp: string): boolean => {
  const otpDataString = sessionStorage.getItem(OTP_KEY);
  if (!otpDataString) return false;

  const otpData = JSON.parse(otpDataString);
  const isEmailMatch = otpData.email === email.toLowerCase();
  const isOtpMatch = otpData.otp === otp;
  
  // OTP is valid for 5 minutes
  const isNotExpired = (Date.now() - otpData.timestamp) < 5 * 60 * 1000;

  if (isEmailMatch && isOtpMatch && isNotExpired) {
    sessionStorage.removeItem(OTP_KEY); // OTP is single-use
    return true;
  }
  return false;
};


// --- Session Management (localStorage) ---

export const createSession = async (user: User) => {
  const users = await getUsers();
  const email = user.email.toLowerCase();
  // Ensure the canonical user object being saved to both DB and session has the lowercase email.
  const canonicalUser = { ...user, email };
  
  users[email] = canonicalUser;
  await saveUsers(users);
  
  await asyncLocalStorage.setItem(SESSION_KEY, JSON.stringify(canonicalUser));
};

export const checkSession = async (): Promise<User | null> => {
  const sessionJson = await asyncLocalStorage.getItem(SESSION_KEY);
  if (!sessionJson) return null;
  
  try {
      const user = JSON.parse(sessionJson) as User;
      // Re-fetch from the main user DB to ensure data is consistent and fresh
      return await findUserByEmail(user.email);
  } catch (e) {
      // If parsing fails, the session is invalid.
      await clearSession();
      return null;
  }
};

export const clearSession = async () => {
  await asyncLocalStorage.removeItem(SESSION_KEY);
};