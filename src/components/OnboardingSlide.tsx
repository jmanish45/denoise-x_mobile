/**
 * Reusable black-glass onboarding slide with purpose-driven medical icons.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
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
  accentColor = Colors.startup.teal,
  secondaryIcon,
}: OnboardingSlideProps) {
  const glow = useRef(new Animated.Value(0)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.86)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.spring(iconScale, { toValue: 1, damping: 15, stiffness: 110, useNativeDriver: true }),
      Animated.timing(iconOpacity, { toValue: 1, duration: 550, useNativeDriver: true }),
    ]);
    entrance.start();

    const glowLoop = createPulseLoop(glow, 3400);
    const floatLoop1 = createFloatLoop(float1, 10, 3000);
    const floatLoop2 = createFloatLoop(float2, 8, 2500);
    const floatLoop3 = createFloatLoop(float3, 12, 3500);
    glowLoop.start();
    floatLoop1.start();
    floatLoop2.start();
    floatLoop3.start();

    return () => {
      entrance.stop();
      glowLoop.stop();
      floatLoop1.stop();
      floatLoop2.stop();
      floatLoop3.stop();
    };
  }, [float1, float2, float3, glow, iconOpacity, iconScale]);

  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1.12] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.22] });

  return (
    <View style={styles.slide} accessible accessibilityLabel={`${headline.replace('\n', ' ')}. ${description}`}>
      <Animated.View style={[styles.particle, styles.p1, { transform: [{ translateY: float1 }] }]}>
        <View style={[styles.particleDot, { backgroundColor: accentColor }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, styles.p2, { transform: [{ translateY: float2 }] }]}>
        <View style={[styles.particleDot, styles.particleSmall, { backgroundColor: Colors.startup.tealBright }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, styles.p3, { transform: [{ translateY: float3 }] }]}>
        <View style={[styles.particleDot, { backgroundColor: Colors.startup.teal }]} />
      </Animated.View>

      <View style={styles.iconArea}>
        <Animated.View style={[styles.glowRing, { transform: [{ scale: glowScale }], opacity: glowOpacity }]}>
          <LinearGradient
            colors={[Colors.startup.teal, Colors.startup.cyanDim, 'transparent']}
            style={styles.glowGradient}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
        <View style={[styles.ring, { borderColor: Colors.startup.borderStrong }]} />
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: iconScale }], opacity: iconOpacity }]}>
          <LinearGradient
            colors={[Colors.startup.tealBright, Colors.startup.teal]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={43} color={Colors.startup.bg} />
          </LinearGradient>
        </Animated.View>
        {secondaryIcon ? (
          <Animated.View style={[styles.secondaryIcon, { transform: [{ translateY: float1 }], opacity: iconOpacity }]}>
            <View style={styles.secondaryIconCircle}>
              <Ionicons name={secondaryIcon as keyof typeof Ionicons.glyphMap} size={19} color={Colors.startup.tealBright} />
            </View>
          </Animated.View>
        ) : null}
      </View>

      <View style={styles.copyPanel}>
        <Text style={styles.stepLabel}>DENOISE-X / CLINICAL INTELLIGENCE</Text>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const ICON_SIZE = 92;

const styles = StyleSheet.create({
  slide: {
    width: SCREEN_W,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  particle: { position: 'absolute' },
  p1: { top: SCREEN_H * 0.16, left: SCREEN_W * 0.16 },
  p2: { top: SCREEN_H * 0.28, right: SCREEN_W * 0.13 },
  p3: { top: SCREEN_H * 0.58, left: SCREEN_W * 0.84 },
  particleDot: { width: 5, height: 5, borderRadius: 3, opacity: 0.55 },
  particleSmall: { width: 3, height: 3, borderRadius: 2 },
  iconArea: {
    width: 214,
    height: 214,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxxl,
  },
  glowRing: { position: 'absolute', width: 210, height: 210, borderRadius: 105 },
  glowGradient: { width: '100%', height: '100%', borderRadius: 105 },
  ring: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  iconCircle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    overflow: 'hidden',
    borderRadius: ICON_SIZE / 2,
    shadowColor: Colors.startup.teal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 14,
  },
  iconGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  secondaryIcon: { position: 'absolute', top: 28, right: 8 },
  secondaryIconCircle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.startup.border,
    backgroundColor: Colors.startup.surfaceStrong,
  },
  copyPanel: {
    width: '100%',
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.startup.border,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.startup.surface,
  },
  stepLabel: { ...Typography.labelSmall, fontSize: 9, letterSpacing: 1.2, color: Colors.startup.tealBright, marginBottom: 13 },
  headline: { ...Typography.displayMedium, fontSize: 30, lineHeight: 35, letterSpacing: -0.9, color: Colors.startup.text, marginBottom: 13 },
  description: { ...Typography.bodyLarge, fontSize: 14, lineHeight: 22, color: Colors.startup.muted },
});
