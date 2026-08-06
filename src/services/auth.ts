/**
 * auth.ts — Mobile Auth Service
 * ================================
 * Mirrors the web frontend's auth.ts but uses SecureStore instead of localStorage.
 * All API calls have AbortController timeout protection.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_ENDPOINTS, FETCH_TIMEOUT_MS } from './config';

const TOKEN_KEY = 'denoisex_token';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface UserPublic {
  id: string;
  full_name: string;
  email: string;
  profile_type: string;
  college_name?: string | null;
  professional_role?: string | null;
  auth_provider?: string;
  profile_complete?: boolean;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: UserPublic;
  profile_complete?: boolean;
}

export interface SignUpData {
  full_name: string;
  email: string;
  password: string;
  profile_type: string;
  college_name?: string;
  professional_role?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface CompleteProfileData {
  profile_type: string;
  college_name?: string;
  professional_role?: string;
}

// ── Token Helpers (SecureStore) ────────────────────────────────────────────────
export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// ── API Calls (all with timeout protection) ───────────────────────────────────
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const res = await fetch(API_ENDPOINTS.signup, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Sign up failed.' }));
    throw new Error(err.detail || 'Sign up failed.');
  }
  const result: AuthResponse = await res.json();
  await saveToken(result.token);
  return result;
}

export async function signIn(data: SignInData): Promise<AuthResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const res = await fetch(API_ENDPOINTS.signin, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Sign in failed.' }));
    throw new Error(err.detail || 'Sign in failed.');
  }
  const result: AuthResponse = await res.json();
  await saveToken(result.token);
  return result;
}

export async function googleAuth(credential: string): Promise<AuthResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const res = await fetch(API_ENDPOINTS.google, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Google sign-in failed.' }));
    throw new Error(err.detail || 'Google sign-in failed.');
  }
  const result: AuthResponse = await res.json();
  await saveToken(result.token);
  return result;
}

export async function completeProfile(data: CompleteProfileData): Promise<UserPublic> {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const res = await fetch(API_ENDPOINTS.completeProfile, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Profile update failed.' }));
    throw new Error(err.detail || 'Profile update failed.');
  }
  return res.json();
}

export async function getMe(): Promise<UserPublic | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const res = await fetch(API_ENDPOINTS.me, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  await clearToken();
}

// ── Role labels (for display) ─────────────────────────────────────────────────
export const PROFESSIONAL_ROLE_LABELS: Record<string, string> = {
  pg_resident: 'Postgraduate Resident (MD/MS/DNB)',
  junior_doctor: 'Junior Doctor / House Officer',
  fellow: 'Senior Resident / Fellow',
  educator: 'Educator / Faculty',
};
