/**
 * GlassInput.tsx — Premium Glassmorphic Text Input
 * ==================================================
 * Animated focus border with frosted glass styling.
 * Uses React Native's built-in Animated API.
 */

import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TextInputProps,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '../theme';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'default' | 'startup';
}

export function GlassInput({
  label,
  error,
  icon,
  secureTextEntry,
  tone = 'default',
  ...props
}: GlassInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderColorAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const accentColor = tone === 'startup' ? Colors.startup.tealBright : Colors.accent.primary;
  const idleBorderColor = tone === 'startup' ? Colors.startup.border : Colors.border.subtle;
  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [idleBorderColor, accentColor],
  });

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, tone === 'startup' && styles.startupLabel]}>{label}</Text>}
      <Animated.View
        style={[
          styles.inputWrapper,
          tone === 'startup' && styles.startupInputWrapper,
          { borderColor },
          error && styles.errorBorder,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? accentColor : tone === 'startup' ? Colors.startup.quiet : Colors.text.tertiary}
            style={styles.icon}
          />
        )}
        <TextInput
          {...props}
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[styles.input, tone === 'startup' && styles.startupInput]}
          placeholderTextColor={tone === 'startup' ? Colors.startup.quiet : Colors.text.tertiary}
          cursorColor={accentColor}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={tone === 'startup' ? Colors.startup.quiet : Colors.text.tertiary}
            />
          </Pressable>
        )}
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.labelMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  startupLabel: { color: Colors.startup.muted },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.bg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border.subtle,
    paddingHorizontal: Spacing.md,
    minHeight: 52,
  },
  startupInputWrapper: { backgroundColor: Colors.startup.surface },
  errorBorder: {
    borderColor: Colors.status.error,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    paddingVertical: Spacing.md,
  },
  startupInput: { color: Colors.startup.text },
  eyeBtn: {
    padding: Spacing.xs,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.status.error,
    marginTop: Spacing.xs,
  },
});
