/**
 * welcome.tsx — Denoise-X clinical startup entry.
 *
 * The screen establishes the black-glass visual language before routing a
 * first-time user through onboarding or a returning user to authentication.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { AnimatedEntry, FadeIn } from '../src/components/AnimatedEntry';
import { GradientButton } from '../src/components/GradientButton';
import { GlassCard } from '../src/components/GlassCard';
import { LungHeroVisual } from '../src/components/LungHeroVisual';
import { StartupBrandMark } from '../src/components/StartupBrandMark';
import { StartupProofRow } from '../src/components/StartupProofRow';
import { hapticImpact } from '../src/services/preferences';
import { Colors, Typography, Spacing, BorderRadius } from '../src/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ONBOARDED_KEY = 'denoisex_has_onboarded';

export default function WelcomeScreen() {
  const router = useRouter();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslate = useRef(new Animated.Value(14)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const scanLine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    const entrance = Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.spring(logoTranslate, { toValue: 0, damping: 18, stiffness: 120, useNativeDriver: true }),
    ]);

    AsyncStorage.getItem(ONBOARDED_KEY)
      .then((value) => {
        if (mounted) setHasOnboarded(value === 'true');
      })
      .catch(() => {
        if (mounted) setHasOnboarded(false);
      });

    entrance.start();
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 3200, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0, duration: 3200, useNativeDriver: true }),
      ]),
    );
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, { toValue: 1, duration: 3600, useNativeDriver: true }),
        Animated.timing(scanLine, { toValue: 0, duration: 3600, useNativeDriver: true }),
      ]),
    );
    pulseLoop.start();
    scanLoop.start();

    return () => {
      mounted = false;
      pulseLoop.stop();
      scanLoop.stop();
    };
  }, [glowPulse, logoOpacity, logoTranslate, scanLine]);

  const glowScale = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.18] });
  const glowOpacity = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.24] });
  const scanTranslate = scanLine.interpolate({ inputRange: [0, 1], outputRange: [0, 170] });

  const handleGetStarted = () => {
    if (hasOnboarded === null) return;
    hapticImpact('medium');
    router.push(hasOnboarded ? '/(auth)/signup' : '/onboarding');
  };

  const handleSignIn = () => {
    hapticImpact('light');
    router.push('/(auth)/signin');
  };

  return (
    <LinearGradient
      colors={[Colors.startup.bg, '#07100E', Colors.startup.bg]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.fill}
    >
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <View style={styles.backgroundVisual} pointerEvents="none">
          <Animated.View style={[styles.visualGlow, { transform: [{ scale: glowScale }], opacity: glowOpacity }]} />
          <View style={styles.lungsWrap}>
            <LungHeroVisual intensity={0.42} />
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanTranslate }] }]} />
          </View>
        </View>

        <View style={styles.content}>
          <Animated.View style={[styles.topBar, { opacity: logoOpacity, transform: [{ translateY: logoTranslate }] }]}>
            <StartupBrandMark compact />
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>READY TO SCAN</Text>
            </View>
          </Animated.View>

          <View style={styles.heroBlock}>
            <AnimatedEntry delay={180} duration={650} slideFrom="bottom">
              <Text style={styles.eyebrow}>CLINICAL-GRADE IMAGE CLARITY</Text>
              <Text style={styles.title}>Sharper insight.{`\n`}Less noise.</Text>
              <Text style={styles.subtitle}>
                Enhance low-dose chest X-rays with AI that protects the anatomy clinicians rely on.
              </Text>
            </AnimatedEntry>

            <FadeIn delay={380} duration={600} style={styles.proofCard}>
              <GlassCard intensity={45} glowColor="teal" noPadding>
                <StartupProofRow
                  items={[
                    { icon: 'shield-checkmark-outline', label: 'Anatomy preserved' },
                    { icon: 'medical-outline', label: 'Clinical workflow' },
                    { icon: 'scan-outline', label: 'Fast processing' },
                  ]}
                />
              </GlassCard>
            </FadeIn>
          </View>

          <View style={styles.bottomBlock}>
            <AnimatedEntry delay={560} duration={650} style={styles.ctaGroup}>
              <GradientButton
                title={hasOnboarded === null ? 'Preparing workspace' : 'Get Started'}
                loading={hasOnboarded === null}
                onPress={handleGetStarted}
                icon={hasOnboarded === null ? undefined : <Ionicons name="arrow-forward" size={19} color={Colors.startup.bg} />}
                gradientColors={[Colors.startup.tealBright, Colors.startup.teal]}
                textColor={Colors.startup.bg}
                accessibilityLabel="Get started with Denoise-X"
                style={styles.primaryButton}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign in to Denoise-X"
                onPress={handleSignIn}
                style={({ pressed }) => [styles.signInButton, pressed && styles.pressed]}
              >
                <Text style={styles.signInText}>I already have an account</Text>
                <Ionicons name="chevron-forward" size={17} color={Colors.startup.tealBright} />
              </Pressable>
            </AnimatedEntry>

            <FadeIn delay={760} duration={500} style={styles.footnote}>
              <Ionicons name="lock-closed-outline" size={13} color={Colors.startup.quiet} />
              <Text style={styles.footnoteText}>Private by design · Supplementary clinical support only</Text>
            </FadeIn>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backgroundVisual: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  visualGlow: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.24,
    left: SCREEN_WIDTH * 0.08,
    width: SCREEN_WIDTH * 0.84,
    height: SCREEN_WIDTH * 0.84,
    borderRadius: SCREEN_WIDTH,
    backgroundColor: Colors.startup.teal,
  },
  lungsWrap: {
    position: 'absolute',
    right: -SCREEN_WIDTH * 0.18,
    bottom: SCREEN_HEIGHT * 0.22,
    width: SCREEN_WIDTH * 0.88,
    height: SCREEN_WIDTH * 0.86,
    opacity: 0.82,
  },
  scanLine: {
    position: 'absolute',
    top: 30,
    left: '9%',
    right: '9%',
    height: 1,
    backgroundColor: Colors.startup.tealBright,
    opacity: 0.42,
    shadowColor: Colors.startup.tealBright,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    justifyContent: 'space-between',
  },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.startup.border,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(5, 9, 8, 0.62)',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.startup.tealBright },
  statusText: { ...Typography.captionSmall, fontSize: 8, letterSpacing: 1.1, color: Colors.startup.muted },
  heroBlock: { maxWidth: 350, marginTop: 30 },
  eyebrow: { ...Typography.labelSmall, fontSize: 10, letterSpacing: 1.7, color: Colors.startup.tealBright, marginBottom: 13 },
  title: { ...Typography.displayLarge, fontSize: 42, lineHeight: 45, letterSpacing: -1.8, color: Colors.startup.text },
  subtitle: { ...Typography.bodyLarge, maxWidth: 320, marginTop: 18, fontSize: 15, lineHeight: 23, color: Colors.startup.muted },
  proofCard: { marginTop: 24 },
  bottomBlock: { gap: 14 },
  ctaGroup: { gap: 13 },
  primaryButton: {
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.startup.teal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 10,
  },
  signInButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  signInText: { ...Typography.labelMedium, color: Colors.startup.muted },
  pressed: { opacity: 0.68, transform: [{ scale: 0.985 }] },
  footnote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  footnoteText: { ...Typography.captionSmall, fontSize: 9, color: Colors.startup.quiet, textAlign: 'center' },
});
