import { User } from '../types';

const SIGNUP_OTP_KEY = 'crisis_guardian_signup_otp';
const RESET_TOKEN_KEY = 'crisis_guardian_reset_token';

interface InstitutionsDB {
  schools: string[];
  colleges: string[];
}

const MOCK_API_LATENCY = 500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const payload = await response.json();
      if (payload?.error && typeof payload.error === 'string') {
        message = payload.error;
      }
    } catch {
      // Ignore JSON parse failure on error payloads.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
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

export const isEmailRegistered = async (email: string): Promise<boolean> => {
  try {
    const payload = await apiFetch<{ exists: boolean }>('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email: email.toLowerCase() }),
    });
    return Boolean(payload.exists);
  } catch {
    return false;
  }
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const exists = await isEmailRegistered(email);
  return exists ? ({ email: email.toLowerCase() } as User) : null;
};

export const createUser = async (user: User): Promise<boolean> => {
  try {
    await wait(MOCK_API_LATENCY);
    await apiFetch<{ user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: user.name,
        email: user.email.toLowerCase(),
        password: user.password,
        role: user.role,
        institution: user.institution,
        phone: user.phone,
        avatar: user.avatar,
      }),
    });
    return true;
  } catch {
    return false;
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    await wait(MOCK_API_LATENCY / 2);
    const payload = await apiFetch<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.toLowerCase(), password }),
    });
    return payload.user;
  } catch {
    return null;
  }
};

export const createSession = async (user: User) => {
  await wait(MOCK_API_LATENCY / 2);
  await apiFetch<{ ok: boolean }>('/session', {
    method: 'PUT',
    body: JSON.stringify({ ...user, email: user.email.toLowerCase() }),
  });
};

export const checkSession = async (): Promise<User | null> => {
  await wait(MOCK_API_LATENCY / 2);
  try {
    const payload = await apiFetch<{ user: User }>('/auth/me');
    return payload.user;
  } catch {
    return null;
  }
};

export const clearSession = async () => {
  await wait(MOCK_API_LATENCY / 2);
  clearPendingPasswordReset();
  await apiFetch<{ ok: boolean }>('/auth/logout', { method: 'POST' });
};

export const sendSignupOtp = (email: string): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpData = { email: email.toLowerCase(), otp, timestamp: Date.now() };
  sessionStorage.setItem(SIGNUP_OTP_KEY, JSON.stringify(otpData));
  return otp;
};

export const verifySignupOtp = (email: string, otp: string): boolean => {
  const otpDataString = sessionStorage.getItem(SIGNUP_OTP_KEY);
  if (!otpDataString) return false;

  const otpData = JSON.parse(otpDataString);
  const isEmailMatch = otpData.email === email.toLowerCase();
  const isOtpMatch = otpData.otp === otp;
  const isNotExpired = Date.now() - otpData.timestamp < 5 * 60 * 1000;

  if (isEmailMatch && isOtpMatch && isNotExpired) {
    sessionStorage.removeItem(SIGNUP_OTP_KEY);
    return true;
  }
  return false;
};

export const requestPasswordReset = async (email: string): Promise<string | undefined> => {
  await wait(MOCK_API_LATENCY / 2);
  const payload = await apiFetch<{ ok: boolean; otpHint?: string }>('/auth/request-password-reset', {
    method: 'POST',
    body: JSON.stringify({ email: email.toLowerCase() }),
  });
  return payload.otpHint;
};

export const verifyPasswordResetOtp = async (email: string, otp: string): Promise<boolean> => {
  try {
    const payload = await apiFetch<{ ok: boolean; resetToken: string }>('/auth/verify-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email: email.toLowerCase(), otp }),
    });
    sessionStorage.setItem(RESET_TOKEN_KEY, payload.resetToken);
    return true;
  } catch {
    return false;
  }
};

export const updatePassword = async (newPassword: string): Promise<boolean> => {
  const resetToken = sessionStorage.getItem(RESET_TOKEN_KEY);
  if (!resetToken) {
    return false;
  }
  try {
    await apiFetch<{ ok: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword }),
    });
    sessionStorage.removeItem(RESET_TOKEN_KEY);
    return true;
  } catch {
    return false;
  }
};

export const clearPendingPasswordReset = () => {
  sessionStorage.removeItem(RESET_TOKEN_KEY);
};
