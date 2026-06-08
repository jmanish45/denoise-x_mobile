/**
 * networkUtils.ts — Network Connectivity Detection
 * ===================================================
 * Checks device network state before making API calls.
 * Shows user-friendly messages when offline.
 */

import * as Network from 'expo-network';

/**
 * Check if the device has an active internet connection.
 * Returns true if connected, false otherwise.
 */
export async function isNetworkAvailable(): Promise<boolean> {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return !!(networkState.isConnected && networkState.isInternetReachable);
  } catch {
    // If we can't check, assume connected and let the request fail naturally
    return true;
  }
}

/**
 * Throws a user-friendly error if the device is offline.
 * Call this before any API request to fail fast.
 */
export async function requireNetwork(): Promise<void> {
  const connected = await isNetworkAvailable();
  if (!connected) {
    throw new Error(
      'No internet connection. Please check your Wi-Fi or mobile data and try again.'
    );
  }
}

/**
 * Get a human-readable description of the current network type.
 */
export async function getNetworkType(): Promise<string> {
  try {
    const state = await Network.getNetworkStateAsync();
    if (!state.isConnected) return 'Offline';
    switch (state.type) {
      case Network.NetworkStateType.WIFI:
        return 'Wi-Fi';
      case Network.NetworkStateType.CELLULAR:
        return 'Cellular';
      case Network.NetworkStateType.ETHERNET:
        return 'Ethernet';
      default:
        return 'Connected';
    }
  } catch {
    return 'Unknown';
  }
}
