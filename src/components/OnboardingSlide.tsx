/**
 * OnboardingSlide.tsx — Premium Onboarding Slide
 * =================================================
 * Reusable slide with animated icon, headline, description,
 * and floating particle effects.
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { createFloatLoop, createPulseLoop } from '../theme/animations';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface OnboardingSlideProps {
  headline: string;
  description: string;
  iconName: string;
  accentColor?: string;
  secondaryIcon?: string;
}

export function OnboardingSlide({
  headline,
  description,
  iconName,
  accentColor = Colors.accent.primary,
  secondaryIcon,
}: OnboardingSlideProps) {
  const glow = useRef(new Animated.Value(0)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Icon entrance
    Animated.parallel([
      Animated.spring(iconScale, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }),
      Animated.timing(iconOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    // Background glow pulse
    createPulseLoop(glow, 3000).start();

    // Floating particles
    createFloatLoop(float1, 15, 3000).start();
    createFloatLoop(float2, 12, 2500).start();
    createFloatLoop(float3, 18, 3500).start();
  }, []);

  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.35] });

  return (
    <View style={styles.slide}>
      {/* Floating particles */}
      <Animated.View style={[styles.particle, styles.p1, { transform: [{ translateY: float1 }] }]}>
        <View style={[styles.particleDot, { backgroundColor: accentColor }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, styles.p2, { transform: [{ translateY: float2 }] }]}>
        <View style={[styles.particleDot, styles.particleSmall, { backgroundColor: Colors.accent.cyan }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, styles.p3, { transform: [{ translateY: float3 }] }]}>
        <View style={[styles.particleDot, { backgroundColor: Colors.accent.secondary }]} />
      </Animated.View>

      {/* Icon area */}
      <View style={styles.iconArea}>
        {/* Glow ring */}
        <Animated.View
          style={[
            styles.glowRing,
            { transform: [{ scale: glowScale }], opacity: glowOpacity },
          ]}
        >
          <LinearGradient
            colors={[accentColor, 'rgba(56, 189, 248, 0.3)', 'transparent']}
            style={styles.glowGradient}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Main icon */}
        <Animated.View
          style={[styles.iconCircle, { transform: [{ scale: iconScale }], opacity: iconOpacity }]}
        >
          <LinearGradient
            colors={[accentColor, Colors.accent.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Ionicons name={iconName as any} size={48} color="#fff" />
          </LinearGradient>
        </Animated.View>

        {/* Secondary floating icon */}
        {secondaryIcon && (
          <Animated.View
            style={[styles.secondaryIcon, { transform: [{ translateY: float1 }], opacity: iconOpacity }]}
          >
            <View style={styles.secondaryIconCircle}>
              <Ionicons name={secondaryIcon as any} size={20} color={accentColor} />
            </View>
          </Animated.View>
        )}
      </View>

      {/* Text */}
      <View style={styles.textArea}>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const ICON_SIZE = 100;

const styles = StyleSheet.create({
  slide: {
    width: SCREEN_W,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  particle: { position: 'absolute' },
  p1: { top: SCREEN_H * 0.15, left: SCREEN_W * 0.15 },
  p2: { top: SCREEN_H * 0.25, right: SCREEN_W * 0.12 },
  p3: { top: SCREEN_H * 0.55, left: SCREEN_W * 0.8 },
  particleDot: { width: 6, height: 6, borderRadius: 3, opacity: 0.4 },
  particleSmall: { width: 4, height: 4, borderRadius: 2 },

  iconArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.huge,
    height: 200,
    width: 200,
  },
  glowRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  iconCircle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryIcon: {
    position: 'absolute',
    top: 20,
    right: 10,
  },
  secondaryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textArea: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  headline: {
    ...Typography.displayMedium,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  description: {
    ...Typography.bodyLarge,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
  },
});
