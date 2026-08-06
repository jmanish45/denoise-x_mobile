/**
 * GradientButton.tsx — Premium Gradient CTA Button
 * ==================================================
 * Animated gradient button with press scale effect and haptic feedback.
 * Uses React Native's built-in Animated API.
 */

import React, { useRef } from 'react';
import { StyleSheet, Text, Pressable, ActivityIndicator, ViewStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { hapticImpact } from '../services/preferences';
import { Colors, Typography, BorderRadius, Spacing } from '../theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
  gradientColors?: [string, string];
  textColor?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export function GradientButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  gradientColors,
  textColor = '#FFFFFF',
  accessibilityLabel,
  style,
}: GradientButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    hapticImpact('light');
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    hapticImpact('medium');
    onPress();
  };

  if (variant === 'outline') {
    return (
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || title}
          accessibilityState={{ disabled: disabled || loading, busy: loading }}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={styles.outlineButton}
        >
          {icon && icon}
          {loading ? (
            <ActivityIndicator color={Colors.accent.primary} size="small" />
          ) : (
            <Text style={styles.outlineText}>{title}</Text>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  const resolvedGradientColors: [string, string] =
    gradientColors || (variant === 'secondary'
      ? [Colors.accent.secondary, '#6366F1']
      : [Colors.accent.gradient[0], Colors.accent.gradient[1]]);

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || title}
          accessibilityState={{ disabled: disabled || loading, busy: loading }}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
        >
        <LinearGradient
          colors={resolvedGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, (disabled || loading) && styles.disabled]}
        >
          {icon && icon}
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={[styles.text, { color: textColor }]}>{title}</Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    minHeight: 52,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...Typography.labelLarge,
    color: '#FFFFFF',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border.accent,
    gap: Spacing.sm,
    minHeight: 52,
  },
  outlineText: {
    ...Typography.labelLarge,
    color: Colors.accent.primary,
  },
});
