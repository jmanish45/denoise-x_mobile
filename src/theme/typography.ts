/**
 * typography.ts — Denoise X Typography & Layout System
 * ======================================================
 * Clean, modern type scale. SF Pro on iOS, Roboto on Android.
 * Includes spacing, border radius, and shadow presets.
 */

import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const Typography: Record<string, TextStyle> = {
  // ── Display ───────────────────────────────────────────────────────
  displayLarge: {
    fontFamily,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: 44,
  },
  displayMedium: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  displaySmall: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 32,
  },

  // ── Heading ───────────────────────────────────────────────────────
  headingLarge: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  headingMedium: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  headingSmall: {
    fontFamily,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 24,
  },

  // ── Body ──────────────────────────────────────────────────────────
  bodyLarge: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.2,
    lineHeight: 16,
  },

  // ── Label ─────────────────────────────────────────────────────────
  labelLarge: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  labelMedium: {
    fontFamily,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    lineHeight: 18,
  },
  labelSmall: {
    fontFamily,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    lineHeight: 14,
    textTransform: 'uppercase',
  },

  // ── Caption ───────────────────────────────────────────────────────
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.3,
    lineHeight: 16,
  },
  captionSmall: {
    fontFamily,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.4,
    lineHeight: 14,
  },
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
  /** Extra padding to clear the floating tab bar */
  tabBarClearance: 100,
} as const;

export const BorderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;

/** Elevation shadow presets for iOS + Android */
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  }),
} as const;
