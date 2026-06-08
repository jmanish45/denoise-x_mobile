/**
 * scanHistory.ts — Local Scan History Persistence
 * ==================================================
 * Stores scan results locally using AsyncStorage so doctors can
 * review past scans offline. Keeps the most recent 50 scans.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'denoisex_scan_history';
const MAX_HISTORY = 50;

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ScanRecord {
  id: string;
  timestamp: string;                // ISO 8601
  fileName: string;
  width: number;
  height: number;
  noise_variance: number;
  processing_time_ms: number;
  was_bypassed: boolean;
  routing_message: string;
  /** Base64 thumbnail of the enhanced image (first 200 chars for preview) */
  thumbnail_b64: string;
  /** Full base64 of the enhanced image */
  enhanced_b64: string;
  /** Full base64 of the original image */
  original_b64: string;
}

/**
 * Generate a unique ID for a scan record.
 */
function generateId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Get all scan records, sorted by most recent first.
 */
export async function getScanHistory(): Promise<ScanRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const records: ScanRecord[] = JSON.parse(raw);
    return records.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.warn('[ScanHistory] Failed to read history (likely CursorWindow too big):', error);
    // The SQLite row exceeded the maximum size (e.g. 2MB) because of an old un-truncated base64 string.
    // The only way to recover is to nuke the corrupted history cache.
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
      console.log('[ScanHistory] Successfully wiped corrupted history cache.');
    } catch (wipeError) {
      console.warn('[ScanHistory] Failed to wipe corrupted history:', wipeError);
    }
    return [];
  }
}

/**
 * Get the N most recent scans (for home screen preview).
 */
export async function getRecentScans(count: number = 5): Promise<ScanRecord[]> {
  const history = await getScanHistory();
  return history.slice(0, count);
}

/**
 * Save a new scan result to history.
 * Automatically trims to MAX_HISTORY entries.
 */
export async function saveScanResult(params: {
  fileName: string;
  width: number;
  height: number;
  noise_variance: number;
  processing_time_ms: number;
  was_bypassed: boolean;
  routing_message: string;
  enhanced_b64: string;
  original_b64: string;
}): Promise<ScanRecord> {
  const record: ScanRecord = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    fileName: params.fileName,
    width: params.width,
    height: params.height,
    noise_variance: params.noise_variance,
    processing_time_ms: params.processing_time_ms,
    was_bypassed: params.was_bypassed,
    routing_message: params.routing_message,
    thumbnail_b64: params.enhanced_b64.substring(0, 200),
    enhanced_b64: params.enhanced_b64,
    original_b64: params.original_b64,
  };

  try {
    const history = await getScanHistory();
    history.unshift(record); // Add to front

    // Trim to max
    const trimmed = history.slice(0, MAX_HISTORY);

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    return record;
  } catch (error) {
    console.warn('[ScanHistory] Failed to save scan:', error);
    return record;
  }
}

/**
 * Delete a scan record by ID.
 */
export async function deleteScanRecord(id: string): Promise<void> {
  try {
    const history = await getScanHistory();
    const filtered = history.filter((r) => r.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn('[ScanHistory] Failed to delete scan:', error);
  }
}

/**
 * Clear all scan history.
 */
export async function clearScanHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.warn('[ScanHistory] Failed to clear history:', error);
  }
}

/**
 * Get total scan count.
 */
export async function getScanCount(): Promise<number> {
  const history = await getScanHistory();
  return history.length;
}
