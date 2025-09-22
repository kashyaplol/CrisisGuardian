// services/authService.ts
import { User } from '../types';
import { INDIAN_SCHOOLS, NIRF_COLLEGES } from '../constants';

const USERS_DB_KEY = 'crisis_guardian_users';
const SESSION_KEY = 'crisis_guardian_session';
const OTP_KEY = 'crisis_guardian_otp';
const INSTITUTIONS_DB_KEY = 'crisis_guardian_institutions';

// Clear the user and session database on every application load to simulate a reset.
localStorage.removeItem(USERS_DB_KEY);
localStorage.removeItem(SESSION_KEY);

// --- Institution Database Simulation ---

interface InstitutionsDB {
    schools: string[];
    colleges: string[];
}

export const getInstitutions = (): InstitutionsDB => {
    const stored = localStorage.getItem(INSTITUTIONS_DB_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    // Seed the database if it doesn't exist
    const initialData: InstitutionsDB = {
        schools: INDIAN_SCHOOLS,
        colleges: NIRF_COLLEGES,
    };
    localStorage.setItem(INSTITUTIONS_DB_KEY, JSON.stringify(initialData));
    return initialData;
};

export const addInstitution = (name: string, type: 'school' | 'college'): boolean => {
    if (!name.trim()) return false;
    const db = getInstitutions();
    const list = type === 'school' ? db.schools : db.colleges;
    
    if (list.find(i => i.toLowerCase() === name.trim().toLowerCase())) {
        return false; // Already exists
    }

    list.push(name.trim());
    localStorage.setItem(INSTITUTIONS_DB_KEY, JSON.stringify(db));
    return true;
};

// --- User Database Simulation (localStorage) ---

const getUsers = (): Record<string, User> => {
  const users = localStorage.getItem(USERS_DB_KEY);
  return users ? JSON.parse(users) : {};
};

const saveUsers = (users: Record<string, User>) => {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

export const findUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users[email.toLowerCase()] || null;
};

export const createUser = (user: User): boolean => {
  const users = getUsers();
  const email = user.email.toLowerCase();
  if (users[email]) {
    // User already exists
    return false;
  }
  // In a real app, NEVER store plain text passwords. This should be a securely hashed password.
  users[email] = user;
  saveUsers(users);
  return true;
};

export const loginUser = (email: string, password: string): User | null => {
  const user = findUserByEmail(email);
  // In a real app, you would compare a hashed password, not plain text.
  if (user && user.password === password) {
    return user;
  }
  return null;
};


// --- OTP Simulation (sessionStorage + console.log) ---

export const sendOtp = (email: string) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpData = { email: email.toLowerCase(), otp, timestamp: Date.now() };
  
  // Store OTP in sessionStorage for verification
  sessionStorage.setItem(OTP_KEY, JSON.stringify(otpData));

  // Simulate sending OTP by logging to console
  console.log(`%c[CrisisGuardian] OTP for ${email}: ${otp}`, 'color: #0ea5e9; font-weight: bold; font-size: 14px;');
  console.log('%cThis is a simulated OTP. In a real app, this would be sent via email or SMS.', 'color: #64748b;');
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


// --- Session Management ---

export const createSession = (user: User) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const checkSession = (): User | null => {
  const sessionUser = localStorage.getItem(SESSION_KEY);
  return sessionUser ? JSON.parse(sessionUser) : null;
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};