/**
 * onboarding.tsx — First-launch clinical onboarding carousel.
 *
 * Preserves the original four-slide education flow and persistence behavior
 * while using the black-glass startup language.
 */

import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { OnboardingSlide } from '../src/components/OnboardingSlide';
import { hapticImpact, hapticSelection } from '../src/services/preferences';
import { Colors, Typography, Spacing, BorderRadius } from '../src/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const ONBOARDED_KEY = 'denoisex_has_onboarded';

const SLIDES = [
  {
    headline: 'AI-powered X-ray\nenhancement',
    description: 'Enhance low-dose X-rays with deep learning precision. Noise2Noise removes noise while preserving the anatomy clinicians rely on.',
    iconName: 'sparkles-outline',
    secondaryIcon: 'medical-outline',
  },
  {
    headline: 'Preserving anatomy.\nEliminating noise.',
    description: 'Our framework reduces noise without hallucinating anatomy, giving learners and professionals a clearer image to review.',
    iconName: 'shield-checkmark-outline',
    secondaryIcon: 'eye-outline',
  },
  {
    headline: 'Built for learners\nand professionals',
    description: 'A focused workflow for medical students, residents, radiologists, and doctors who need clarity without extra friction.',
    iconName: 'people-outline',
    secondaryIcon: 'school-outline',
  },
  {
    headline: 'Fast. Safe.\nIntelligent.',
    description: 'A smart two-path pipeline lets low-noise images pass quickly while noisy images receive full AI enhancement.',
    iconName: 'flash-outline',
    secondaryIcon: 'analytics-outline',
  },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / SCREEN_W);
    if (page !== currentPage) {
      setCurrentPage(page);
      hapticSelection();
    }
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    router.replace('/(auth)/signin');
  };

  const handleNext = () => {
    hapticImpact('light');
    if (currentPage < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentPage + 1) * SCREEN_W, animated: true });
    } else {
      finishOnboarding();
    }
  };

  const handleSkip = () => {
    hapticImpact('light');
    finishOnboarding();
  };

  return (
    <LinearGradient colors={[Colors.startup.bg, '#07100E', Colors.startup.bg]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <View style={styles.progressCopy}>
            <Text style={styles.progressKicker}>DENOISE-X / ONBOARDING</Text>
            <Text style={styles.progressValue}>{String(currentPage + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            onPress={handleSkip}
            style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}
          >
            <Text style={styles.skipText}>Skip</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.startup.tealBright} />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={styles.carousel}
          accessible
          accessibilityLabel={`Onboarding slide ${currentPage + 1} of ${SLIDES.length}`}
        >
          {SLIDES.map((slide) => (
            <OnboardingSlide key={slide.headline} {...slide} accentColor={Colors.startup.teal} />
          ))}
        </ScrollView>

        <View style={styles.bottomArea}>
          <View style={styles.dots} accessibilityLabel={`Slide ${currentPage + 1} selected`}>
            {SLIDES.map((slide, index) => (
              <View
                key={slide.headline}
                accessible
                accessibilityLabel={`Slide ${index + 1}${index === currentPage ? ', current' : ''}`}
                style={[styles.dot, index === currentPage ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={currentPage === SLIDES.length - 1 ? 'Finish onboarding' : 'Next onboarding slide'}
            accessibilityHint={currentPage === SLIDES.length - 1 ? 'Continue to sign in' : 'Show the next clinical feature'}
            onPress={handleNext}
            style={({ pressed }) => [styles.nextBtn, pressed && styles.pressed]}
          >
            <LinearGradient colors={[Colors.startup.tealBright, Colors.startup.teal]} style={styles.nextGrad}>
              <Text style={styles.nextText}>{currentPage === SLIDES.length - 1 ? 'Continue to sign in' : 'Next'}</Text>
              <Ionicons name={currentPage === SLIDES.length - 1 ? 'arrow-forward' : 'chevron-forward'} size={19} color={Colors.startup.bg} />
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topBar: {
    minHeight: 58,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressCopy: { gap: 3 },
  progressKicker: { ...Typography.labelSmall, fontSize: 8, letterSpacing: 1.2, color: Colors.startup.tealBright },
  progressValue: { ...Typography.captionSmall, fontSize: 10, color: Colors.startup.quiet },
  skipBtn: {
    minWidth: 80,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.startup.border,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.startup.surface,
  },
  skipText: { ...Typography.labelMedium, color: Colors.startup.muted },
  carousel: { flex: 1 },
  bottomArea: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxl, gap: Spacing.lg },
  dots: { minHeight: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  dot: { height: 4, borderRadius: 2 },
  dotActive: { width: 28, backgroundColor: Colors.startup.tealBright },
  dotInactive: { width: 8, backgroundColor: Colors.startup.quiet },
  nextBtn: { overflow: 'hidden', borderRadius: BorderRadius.lg },
  nextGrad: { minHeight: 56, paddingHorizontal: Spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  nextText: { ...Typography.labelLarge, color: Colors.startup.bg },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
