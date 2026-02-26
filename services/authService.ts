// services/authService.ts
import { User } from '../types';

const OTP_KEY = 'crisis_guardian_otp';

interface InstitutionsDB {
  schools: string[];
  colleges: string[];
}

const MOCK_API_LATENCY = 500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
};

export const getInstitutions = async (): Promise<InstitutionsDB> => {
  await wait(MOCK_API_LATENCY / 2);
  return apiFetch<InstitutionsDB>('/institutions');
};

export const addInstitution = async (name: string, type: 'school' | 'college'): Promise<boolean> => {
  if (!name.trim()) return false;

  try {
    await wait(MOCK_API_LATENCY);
    await apiFetch<{ ok: boolean }>('/institutions', {
      method: 'POST',
      body: JSON.stringify({ name: name.trim(), type }),
    });
    return true;
  } catch {
    return false;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  await wait(MOCK_API_LATENCY / 2);
  return apiFetch<User[]>('/users');
};

export const seedInitialUsers = async (): Promise<void> => {
  await wait(MOCK_API_LATENCY / 2);
  await apiFetch<{ ok: boolean }>('/seed', { method: 'POST' });
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  await wait(MOCK_API_LATENCY / 2);
  const encodedEmail = encodeURIComponent(email.toLowerCase());
  return apiFetch<User | null>(`/users/${encodedEmail}`);
};

export const createUser = async (user: User): Promise<boolean> => {
  try {
    await wait(MOCK_API_LATENCY);
    await apiFetch<{ ok: boolean }>('/users', {
      method: 'POST',
      body: JSON.stringify({ ...user, email: user.email.toLowerCase(), trophies: user.trophies ?? 0 }),
    });
    return true;
  } catch {
    return false;
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const user = await findUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
};

export const updatePassword = async (email: string, newPassword: string): Promise<boolean> => {
  try {
    await wait(MOCK_API_LATENCY);
    const encodedEmail = encodeURIComponent(email.toLowerCase());
    await apiFetch<{ ok: boolean }>(`/users/${encodedEmail}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password: newPassword }),
    });
    return true;
  } catch {
    return false;
  }
};

// --- OTP Simulation (sessionStorage + console.log) ---

export const sendOtp = (email: string): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpData = { email: email.toLowerCase(), otp, timestamp: Date.now() };

  sessionStorage.setItem(OTP_KEY, JSON.stringify(otpData));

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
  const isNotExpired = Date.now() - otpData.timestamp < 5 * 60 * 1000;

  if (isEmailMatch && isOtpMatch && isNotExpired) {
    sessionStorage.removeItem(OTP_KEY);
    return true;
  }
  return false;
};

// --- Session Management via API ---

export const createSession = async (user: User) => {
  await wait(MOCK_API_LATENCY);
  await apiFetch<{ ok: boolean }>('/session', {
    method: 'PUT',
    body: JSON.stringify({ ...user, email: user.email.toLowerCase() }),
  });
};

export const checkSession = async (): Promise<User | null> => {
  await wait(MOCK_API_LATENCY / 2);
  return apiFetch<User | null>('/session');
};

export const clearSession = async () => {
  await wait(MOCK_API_LATENCY);
  await apiFetch<{ ok: boolean }>('/session', { method: 'DELETE' });
};
