/**
 * welcome.tsx — Cinematic Welcome / Splash
 * ==========================================
 * Premium animated splash with glowing logo, floating particles,
 * and neural-inspired background effects.
 * Routes to onboarding (first time) or auth (returning users).
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing } from '../src/theme';
import { GradientButton } from '../src/components/GradientButton';
import { AnimatedEntry, FadeIn } from '../src/components/AnimatedEntry';
import { createPulseLoop, createFloatLoop } from '../src/theme/animations';

const { width, height } = Dimensions.get('window');
const ONBOARDED_KEY = 'denoisex_has_onboarded';

export default function WelcomeScreen() {
  const router = useRouter();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const p1 = useRef(new Animated.Value(0)).current;
  const p2 = useRef(new Animated.Value(0)).current;
  const p3 = useRef(new Animated.Value(0)).current;
  const p4 = useRef(new Animated.Value(0)).current;
  const p5 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check onboarding status
    AsyncStorage.getItem(ONBOARDED_KEY).then((v) => setHasOnboarded(v === 'true'));

    // Logo entrance
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start();
    }, 300);

    // Glow pulse
    createPulseLoop(glowPulse, 2500).start();

    // Floating particles (neural-inspired)
    createFloatLoop(p1, 20, 3000).start();
    createFloatLoop(p2, 15, 2500).start();
    createFloatLoop(p3, 10, 3500).start();
    createFloatLoop(p4, 18, 2800).start();
    createFloatLoop(p5, 12, 3200).start();
  }, []);

  const glowScale = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.3] });
  const glowOpacity = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] });

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (hasOnboarded === false) {
      router.push('/onboarding');
    } else {
      router.push('/(auth)/signup');
    }
  };

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/signin');
  };

  return (
    <LinearGradient colors={[Colors.bg.primary, '#0A1020', '#0D1525']} style={styles.container}>
      {/* Neural floating particles */}
      <Animated.View style={[styles.particle, { top: height * 0.1, left: width * 0.15 }, { transform: [{ translateY: p1 }] }]}>
        <View style={[styles.particleDot, { backgroundColor: Colors.glow.teal, width: 6, height: 6 }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: height * 0.2, right: width * 0.1 }, { transform: [{ translateY: p2 }] }]}>
        <View style={[styles.particleDot, { backgroundColor: Colors.glow.cyan, width: 4, height: 4 }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: height * 0.6, left: width * 0.8 }, { transform: [{ translateY: p3 }] }]}>
        <View style={[styles.particleDot, { backgroundColor: Colors.glow.blue, width: 5, height: 5 }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: height * 0.45, left: width * 0.05 }, { transform: [{ translateY: p4 }] }]}>
        <View style={[styles.particleDot, { backgroundColor: Colors.glow.teal, width: 3, height: 3 }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: height * 0.75, right: width * 0.2 }, { transform: [{ translateY: p5 }] }]}>
        <View style={[styles.particleDot, { backgroundColor: Colors.glow.cyan, width: 5, height: 5 }]} />
      </Animated.View>

      {/* Faint connecting lines (neural network feel) */}
      <View style={styles.neuralLine1} />
      <View style={styles.neuralLine2} />

      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Animated.View style={[styles.logoGlow, { transform: [{ scale: glowScale }], opacity: glowOpacity }]}>
          <LinearGradient
            colors={['rgba(0,212,170,0.35)', 'rgba(56,189,248,0.2)', 'transparent']}
            style={styles.logoGlowGradient}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
          <LinearGradient
            colors={[Colors.accent.primary, Colors.accent.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Ionicons name="scan" size={44} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <AnimatedEntry delay={600} duration={800}>
          <Text style={styles.brandName}>Denoise X</Text>
        </AnimatedEntry>
        <AnimatedEntry delay={800} duration={800}>
          <Text style={styles.tagline}>Clinical-Grade AI X-Ray Enhancement</Text>
        </AnimatedEntry>
      </View>

      {/* Feature pills */}
      <FadeIn delay={1100} duration={800} style={styles.pills}>
        <View style={styles.pill}>
          <Ionicons name="sparkles" size={14} color={Colors.accent.primary} />
          <Text style={styles.pillText}>Noise2Noise U-Net</Text>
        </View>
        <View style={styles.pill}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.accent.cyan} />
          <Text style={styles.pillText}>Anatomy Preserved</Text>
        </View>
        <View style={styles.pill}>
          <Ionicons name="flash" size={14} color={Colors.accent.secondary} />
          <Text style={styles.pillText}>Smart Pipeline</Text>
        </View>
      </FadeIn>

      {/* CTA Buttons */}
      <AnimatedEntry delay={1400} duration={800} style={styles.cta}>
        <GradientButton
          title="Get Started"
          onPress={handleGetStarted}
          icon={<Ionicons name="arrow-forward" size={20} color="#fff" />}
        />
        <GradientButton
          title="I have an account"
          variant="outline"
          onPress={handleSignIn}
        />
      </AnimatedEntry>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.xxl, justifyContent: 'center' },

  // Particles
  particle: { position: 'absolute' },
  particleDot: { borderRadius: 999, opacity: 0.6 },

  // Neural lines
  neuralLine1: {
    position: 'absolute', top: height * 0.15, left: width * 0.17,
    width: width * 0.5, height: 1,
    backgroundColor: 'rgba(0, 212, 170, 0.06)',
    transform: [{ rotate: '30deg' }],
  },
  neuralLine2: {
    position: 'absolute', top: height * 0.55, right: width * 0.1,
    width: width * 0.4, height: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    transform: [{ rotate: '-20deg' }],
  },

  // Logo
  logoSection: { alignItems: 'center', marginBottom: Spacing.xxxl },
  logoGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100 },
  logoGlowGradient: { width: '100%', height: '100%', borderRadius: 100 },
  logoContainer: {
    width: 88, height: 88, borderRadius: 28, overflow: 'hidden', marginBottom: Spacing.xl,
    elevation: 20, shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20,
  },
  logoGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brandName: { ...Typography.displayLarge, color: Colors.text.primary, marginBottom: Spacing.sm },
  tagline: { ...Typography.bodyLarge, color: Colors.text.secondary, textAlign: 'center' },

  // Feature pills
  pills: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.sm, marginBottom: Spacing.huge },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: Spacing.md,
    borderRadius: 999, backgroundColor: Colors.surface.card,
    borderWidth: 1, borderColor: Colors.border.subtle,
  },
  pillText: { ...Typography.captionSmall, color: Colors.text.secondary },

  // CTA
  cta: { gap: Spacing.md },
});
