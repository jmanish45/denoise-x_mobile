/**
 * config.ts — API configuration
 * ===============================
 * Points to the same deployed HuggingFace backend used by the web frontend.
 */

export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://parthgiramkar-denoise-x.hf.space';

/** Timeout for all fetch requests (60s — backend is kept warm by ping bot) */
export const FETCH_TIMEOUT_MS = 60_000;

export const COLD_START_MESSAGE =
  'Connecting to DenoiseX Cloud... The AI engine may take a moment to respond. Please wait.';

export const API_ENDPOINTS = {
  health: `${BASE_URL}/health`,
  denoise: `${BASE_URL}/api/denoise`,
  preview: `${BASE_URL}/api/preview`,
  signup: `${BASE_URL}/api/auth/signup`,
  signin: `${BASE_URL}/api/auth/signin`,
  google: `${BASE_URL}/api/auth/google`,
  completeProfile: `${BASE_URL}/api/auth/complete-profile`,
  me: `${BASE_URL}/api/auth/me`,
} as const;
