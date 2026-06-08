/**
 * onboarding.tsx — Premium Onboarding Tutorial
 * ================================================
 * 4-screen horizontal swipeable tutorial shown only on first launch.
 * Skip button, animated pagination, parallax-ready layout.
 */

import React, { useRef, useState } from 'react';
import {
  StyleSheet, View, Text, Pressable, ScrollView,
  Dimensions, NativeSyntheticEvent, NativeScrollEvent,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../src/theme';
import { OnboardingSlide } from '../src/components/OnboardingSlide';

const { width: SCREEN_W } = Dimensions.get('window');
const ONBOARDED_KEY = 'denoisex_has_onboarded';

const SLIDES = [
  {
    headline: 'AI-Powered X-Ray\nEnhancement',
    description: 'Enhance low-dose X-rays with deep learning precision. Our Noise2Noise U-Net removes noise while preserving critical anatomical detail.',
    iconName: 'sparkles',
    accentColor: Colors.accent.primary,
    secondaryIcon: 'medical-outline',
  },
  {
    headline: 'Preserving Anatomy.\nEliminating Noise.',
    description: 'Our framework removes noise without hallucinating anatomy — ensuring diagnostic accuracy you can trust.',
    iconName: 'shield-checkmark',
    accentColor: Colors.accent.cyan,
    secondaryIcon: 'eye-outline',
  },
  {
    headline: 'Built for Learners\n& Professionals',
    description: 'Designed for medical students, residents, radiologists, and doctors. Intuitive interface meets clinical-grade processing.',
    iconName: 'people',
    accentColor: Colors.accent.secondary,
    secondaryIcon: 'school-outline',
  },
  {
    headline: 'Fast. Safe.\nIntelligent.',
    description: 'Smart two-path pipeline: low-noise images pass through quickly, while noisy images get full AI enhancement. Efficient and reliable.',
    iconName: 'flash',
    accentColor: Colors.accent.primary,
    secondaryIcon: 'analytics-outline',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (page !== currentPage) {
      setCurrentPage(page);
      Haptics.selectionAsync();
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentPage < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentPage + 1) * SCREEN_W, animated: true });
    } else {
      finishOnboarding();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    finishOnboarding();
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    router.replace('/(auth)/signin');
  };

  return (
    <LinearGradient colors={[Colors.bg.primary, '#0A1020', '#0D1321']} style={s.fill}>
      <SafeAreaView style={s.fill}>
        {/* Skip button */}
        <View style={s.topBar}>
          <View />
          <Pressable onPress={handleSkip} style={s.skipBtn}>
            <Text style={s.skipText}>Skip</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.text.tertiary} />
          </Pressable>
        </View>

        {/* Slides */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={s.fill}
        >
          {SLIDES.map((slide, idx) => (
            <OnboardingSlide key={idx} {...slide} />
          ))}
        </ScrollView>

        {/* Bottom area: pagination + button */}
        <View style={s.bottomArea}>
          {/* Pagination dots */}
          <View style={s.dots}>
            {SLIDES.map((_, idx) => (
              <View
                key={idx}
                style={[
                  s.dot,
                  idx === currentPage ? s.dotActive : s.dotInactive,
                ]}
              />
            ))}
          </View>

          {/* Next / Get Started button */}
          <Pressable onPress={handleNext} style={s.nextBtn}>
            <LinearGradient
              colors={[Colors.accent.primary, Colors.accent.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.nextGrad}
            >
              <Text style={s.nextText}>
                {currentPage === SLIDES.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons
                name={currentPage === SLIDES.length - 1 ? 'arrow-forward' : 'chevron-forward'}
                size={20}
                color="#fff"
              />
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.sm,
  },
  skipBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
  },
  skipText: { ...Typography.labelMedium, color: Colors.text.tertiary },

  bottomArea: {
    paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl,
    gap: Spacing.xxl,
  },
  dots: {
    flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm,
  },
  dot: { height: 4, borderRadius: 2 },
  dotActive: { width: 24, backgroundColor: Colors.accent.primary },
  dotInactive: { width: 8, backgroundColor: Colors.text.quaternary },

  nextBtn: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  nextGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.lg,
  },
  nextText: { ...Typography.labelLarge, color: '#fff' },
});
