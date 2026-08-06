import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const PREFERENCES_KEY = 'denoisex_preferences';

export interface AppPreferences {
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  notificationsEnabled: true,
  hapticsEnabled: true,
};

export async function getPreferences(): Promise<AppPreferences> {
  try {
    const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (!stored) return DEFAULT_PREFERENCES;

    const parsed = JSON.parse(stored) as Partial<AppPreferences>;
    return {
      notificationsEnabled: parsed.notificationsEnabled ?? DEFAULT_PREFERENCES.notificationsEnabled,
      hapticsEnabled: parsed.hapticsEnabled ?? DEFAULT_PREFERENCES.hapticsEnabled,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function updatePreferences(
  patch: Partial<AppPreferences>,
): Promise<AppPreferences> {
  const current = await getPreferences();
  const next = { ...current, ...patch };
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
  return next;
}

export async function isHapticsEnabled(): Promise<boolean> {
  const preferences = await getPreferences();
  return preferences.hapticsEnabled;
}

export async function triggerHaptic(
  callback: () => Promise<void>,
): Promise<void> {
  try {
    if (await isHapticsEnabled()) await callback();
  } catch {
    // Haptics are optional and can be unavailable on web or unsupported devices.
  }
}

export type HapticImpactStyle = 'light' | 'medium' | 'heavy';
export type HapticNotificationType = 'success' | 'warning' | 'error';

export function hapticImpact(style: HapticImpactStyle) {
  const styles = {
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
  };
  return triggerHaptic(() => Haptics.impactAsync(styles[style]));
}

export function hapticSelection() {
  return triggerHaptic(() => Haptics.selectionAsync());
}

export async function hapticNotification(type: HapticNotificationType) {
  const preferences = await getPreferences();
  if (!preferences.notificationsEnabled) return;

  const types = {
    success: Haptics.NotificationFeedbackType.Success,
    warning: Haptics.NotificationFeedbackType.Warning,
    error: Haptics.NotificationFeedbackType.Error,
  };
  await triggerHaptic(() => Haptics.notificationAsync(types[type]));
}
