/**
 * api.ts — Mobile Denoise API Service
 * ======================================
 * Mirrors the web frontend's api.ts for image denoising.
 *
 * Fixes applied:
 *  - AbortController + configurable timeout on every request
 *  - NO manual Content-Type header (React Native sets multipart boundary automatically)
 *  - Bearer token attached to denoise requests for user-scoped features
 */

import { API_ENDPOINTS, FETCH_TIMEOUT_MS, COLD_START_MESSAGE } from './config';
import { getToken } from './auth';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface DenoiseResponse {
  original_b64: string;
  noise_map_b64: string;
  unet_b64: string;
  enhanced_b64: string;
  routing_message: string;
  noise_variance: number;
  was_bypassed: boolean;
  width: number;
  height: number;
  processing_time_ms: number;
}

// ── Health check ──────────────────────────────────────────────────────────────
export async function checkHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000); // 15s for health check

    const response = await fetch(API_ENDPOINTS.health, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

// ── Denoise image ─────────────────────────────────────────────────────────────
/**
 * Send an image to the backend for AI denoising.
 * @param imageUri  — Local file URI from camera or gallery
 * @param fileName  — Original filename (e.g. "xray.png")
 */
export async function denoiseImage(
  imageUri: string,
  fileName: string = 'upload.jpg',
): Promise<DenoiseResponse> {
  try {
    const formData = new FormData();

    // React Native's FormData accepts an object with uri/name/type
    formData.append('file', {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg',
    } as any);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    // Build headers — include auth token if available
    const headers: Record<string, string> = {};
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // NOTE: Do NOT set Content-Type manually for multipart/form-data.
    // React Native auto-generates it with the correct boundary string.

    const response = await fetch(API_ENDPOINTS.denoise, {
      method: 'POST',
      body: formData,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Denoising failed' }));
      throw new Error(error.detail || 'Denoising failed');
    }

    return response.json();
  } catch (error: any) {
    // Network errors / timeouts → show user-friendly cold start message
    if (
      error.name === 'TypeError' ||
      error.name === 'AbortError' ||
      error.message === 'Network request failed'
    ) {
      throw new Error(COLD_START_MESSAGE);
    }
    throw error;
  }
}

// ── DICOM Preview ─────────────────────────────────────────────────────────────
/**
 * Generate a preview for DICOM files.
 * @param imageUri  — Local file URI
 * @param fileName  — Original filename
 */
export async function getPreview(
  imageUri: string,
  fileName: string = 'upload.dcm',
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: fileName,
      type: 'application/dicom',
    } as any);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const headers: Record<string, string> = {};
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_ENDPOINTS.preview, {
      method: 'POST',
      body: formData,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error('Failed to generate DICOM preview');
    }

    const data = await response.json();
    return data.b64_url;
  } catch (error: any) {
    if (
      error.name === 'TypeError' ||
      error.name === 'AbortError' ||
      error.message === 'Network request failed'
    ) {
      throw new Error(COLD_START_MESSAGE);
    }
    throw error;
  }
}
