/**
 * animations.ts — Centralized Animation Presets
 * ================================================
 * Spring configs and timing presets for consistent,
 * premium-feeling micro-interactions across the app.
 */

import { Animated, Easing } from 'react-native';

// ── Spring Configs ──────────────────────────────────────────────────
export const Springs = {
  /** Gentle, flowing spring — for page entries, card reveals */
  gentle: { damping: 20, stiffness: 100, mass: 1, useNativeDriver: true },
  /** Snappy, responsive spring — for button presses, tab switches */
  snappy: { damping: 15, stiffness: 200, mass: 0.8, useNativeDriver: true },
  /** Bouncy spring — for success states, celebratory animations */
  bounce: { damping: 8, stiffness: 150, mass: 0.6, useNativeDriver: true },
  /** Very soft spring — for background element drift */
  soft: { damping: 30, stiffness: 60, mass: 1.2, useNativeDriver: true },
} as const;

// ── Timing Presets ──────────────────────────────────────────────────
export const Timing = {
  /** Quick fade in (200ms) */
  fadeQuick: { duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true },
  /** Standard fade in (400ms) */
  fadeIn: { duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true },
  /** Slow fade in (600ms) */
  fadeSlow: { duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true },
  /** Slide up entrance */
  slideUp: { duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true },
  /** Scale pop (for buttons, badges) */
  scalePop: { duration: 150, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true },
  /** Smooth bezier curve for pulsing/looping animations */
  pulse: { duration: 2000, easing: Easing.bezier(0.4, 0, 0.6, 1), useNativeDriver: true },
} as const;

// ── Animation Factories ─────────────────────────────────────────────

/**
 * Create a press-in/press-out animation for buttons.
 * Returns [onPressIn, onPressOut, animatedStyle].
 */
export function usePressAnimation(scaleTarget = 0.97) {
  const scale = new Animated.Value(1);

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: scaleTarget,
      ...Springs.snappy,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      ...Springs.snappy,
    }).start();
  };

  return { scale, onPressIn, onPressOut };
}

/**
 * Create a looping pulse animation.
 * Returns the animated value (0→1→0 loop).
 */
export function createPulseLoop(value: Animated.Value, duration = 2000): Animated.CompositeAnimation {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
        useNativeDriver: true,
      }),
    ]),
  );
}

/**
 * Create a floating/drifting animation for particles.
 * Returns the animated value that oscillates between -range and +range.
 */
export function createFloatLoop(
  value: Animated.Value,
  range: number,
  duration: number,
): Animated.CompositeAnimation {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: range,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: -range,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]),
  );
}

/**
 * Staggered entry animation for a list of items.
 */
export function staggeredEntry(
  values: Animated.Value[],
  staggerMs = 80,
  duration = 400,
): Animated.CompositeAnimation {
  return Animated.stagger(
    staggerMs,
    values.map((v) =>
      Animated.timing(v, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ),
  );
}
