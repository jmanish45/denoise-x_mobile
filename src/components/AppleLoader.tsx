/**
 * AppleLoader.tsx — Apple-Style Premium Loading Indicator
 * ========================================================
 * Pulsing shimmer orb with animated gradient glow.
 * Uses React Native's built-in Animated API.
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing } from '../theme';

interface AppleLoaderProps {
  message?: string;
  subtitle?: string;
}

export function AppleLoader({
  message = 'Processing...',
  subtitle,
}: AppleLoaderProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulsing orb
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Rotating ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const orbScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.15],
  });

  const orbOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  });

  const glowScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.6],
  });

  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.35],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.glowOuter,
          { transform: [{ scale: glowScale }], opacity: glowOpacity },
        ]}
      >
        <LinearGradient
          colors={['rgba(0,212,170,0.3)', 'rgba(59,130,246,0.3)', 'rgba(0,212,170,0.1)']}
          style={styles.glowGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Rotating ring */}
      <Animated.View style={[styles.ring, { transform: [{ rotate }] }]} />

      {/* Central orb */}
      <Animated.View
        style={[
          styles.orb,
          { transform: [{ scale: orbScale }], opacity: orbOpacity },
        ]}
      >
        <LinearGradient
          colors={[Colors.accent.primary, Colors.accent.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.orbGradient}
        />
      </Animated.View>

      {/* Text */}
      <Text style={styles.message}>{message}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const ORB_SIZE = 56;
const RING_SIZE = 90;
const GLOW_SIZE = 130;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  glowOuter: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: GLOW_SIZE / 2,
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2.5,
    borderColor: 'transparent',
    borderTopColor: Colors.accent.primary,
    borderRightColor: 'rgba(0,212,170,0.3)',
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    overflow: 'hidden',
    marginBottom: Spacing.xxl,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
  },
  message: {
    ...Typography.headingSmall,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
