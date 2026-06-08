/**
 * GlassCard.tsx — Premium Glassmorphic Card Component
 * =====================================================
 * Frosted glass card with inner glow, subtle border shimmer,
 * and depth elevation. Matches cinematic medical aesthetic.
 */

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius, Spacing, Shadows } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  accentBorder?: boolean;
  /** Teal/blue/cyan inner glow tint */
  glowColor?: 'teal' | 'blue' | 'cyan' | 'none';
  /** Stronger shadow + elevation */
  elevated?: boolean;
  /** Skip inner padding (for cards that manage their own) */
  noPadding?: boolean;
}

export function GlassCard({
  children,
  style,
  intensity = 40,
  accentBorder = false,
  glowColor = 'none',
  elevated = false,
  noPadding = false,
}: GlassCardProps) {
  const glowBg: Record<string, string> = {
    teal: 'rgba(0,212,170,0.04)',
    blue: 'rgba(59,130,246,0.04)',
    cyan: 'rgba(56,189,248,0.04)',
    none: 'transparent',
  };

  return (
    <View style={[
      styles.wrapper,
      accentBorder && styles.accentBorder,
      elevated && styles.elevated,
      style,
    ]}>
      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        <View style={[
          styles.inner,
          noPadding && { padding: 0 },
          glowColor !== 'none' && { backgroundColor: glowBg[glowColor] || Colors.glass.bg },
        ]}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  accentBorder: {
    borderColor: Colors.border.accent,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  blur: {
    overflow: 'hidden',
  },
  inner: {
    backgroundColor: Colors.glass.bg,
    padding: Spacing.lg,
  },
});
