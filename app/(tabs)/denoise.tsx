/**
 * (tabs)/denoise.tsx — Premium Denoise Upload Screen
 * =====================================================
 * Cinematic scan area with atmospheric glow, floating particles,
 * gradient pipeline steps, and premium action cards.
 */

import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { hapticImpact } from '../../src/services/preferences';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { AnimatedEntry, FadeIn } from '../../src/components/AnimatedEntry';
import { createPulseLoop } from '../../src/theme/animations';

const { width: SW } = Dimensions.get('window');

export default function DenoiseTab() {
  const router = useRouter();
  const pulse = useRef(new Animated.Value(0)).current;
  const f1 = useRef(new Animated.Value(0)).current;
  const f2 = useRef(new Animated.Value(0)).current;
  const f3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    createPulseLoop(pulse, 2500).start();
    const mkF = (v: Animated.Value, d: number, dur: number) =>
      Animated.loop(Animated.sequence([
        Animated.timing(v, { toValue: -d, duration: dur, useNativeDriver: true }),
        Animated.timing(v, { toValue: d, duration: dur, useNativeDriver: true }),
      ]));
    mkF(f1, 12, 3000).start();
    mkF(f2, 8, 2200).start();
    mkF(f3, 6, 2600).start();
  }, []);

  const gS = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.35] });
  const gO = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.4] });

const handleCamera = () => { hapticImpact('heavy'); router.push('/camera'); };
  const handleGallery = async () => {
    hapticImpact('medium');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (!r.canceled && r.assets[0]) router.push({ pathname: '/results', params: { imageUri: r.assets[0].uri, fileName: r.assets[0].fileName || 'upload.jpg' } });
  };

  return (
    <LinearGradient colors={[Colors.bg.primary, '#080E1E', Colors.bg.primary]} style={s.fill}>
      <SafeAreaView style={s.fill} edges={['top']}>
        <View style={s.content}>
          <FadeIn duration={400}>
            <Text style={s.title}>Denoise X-Ray</Text>
            <Text style={s.subtitle}>Upload or capture for AI enhancement</Text>
          </FadeIn>

          {/* Central scan area */}
          <AnimatedEntry delay={250} duration={600} style={s.scanArea}>
            {/* Floating particles */}
            <Animated.View style={[s.pAbs, { top: 15, left: 30, transform: [{ translateY: f1 }] }]}>
              <View style={[s.pDot, { backgroundColor: Colors.accent.primary, width: 6, height: 6 }]} />
            </Animated.View>
            <Animated.View style={[s.pAbs, { bottom: 25, right: 40, transform: [{ translateY: f2 }] }]}>
              <View style={[s.pDot, { backgroundColor: Colors.accent.cyan }]} />
            </Animated.View>
            <Animated.View style={[s.pAbs, { top: 50, right: 25, transform: [{ translateY: f3 }] }]}>
              <View style={[s.pDot, { backgroundColor: 'rgba(139,92,246,0.5)', width: 4, height: 4 }]} />
            </Animated.View>

            {/* Pulsing glow */}
            <Animated.View style={[s.glow, { transform: [{ scale: gS }], opacity: gO }]}>
              <LinearGradient colors={[Colors.glow.teal, Colors.glow.cyan, 'transparent']} style={s.glowGrad} start={{ x: 0.5, y: 0.5 }} end={{ x: 1, y: 1 }} />
            </Animated.View>

            {/* Center icon */}
            <View style={s.centerCircle}>
              <LinearGradient colors={['#4F8EF7', '#6C63FF', Colors.accent.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.centerGrad}>
                <Ionicons name="scan" size={52} color="#fff" />
              </LinearGradient>
            </View>
            <View style={s.ring} />
            <View style={s.ringOuter} />
          </AnimatedEntry>

          {/* Pipeline */}
          <AnimatedEntry delay={450} duration={500} style={s.pipeline}>
            {[
              { label: 'Upload', color: Colors.accent.primary },
              { label: 'Analyze', color: Colors.accent.cyan },
              { label: 'Enhance', color: Colors.accent.secondary },
            ].map((step, i) => (
              <React.Fragment key={step.label}>
                {i > 0 && <LinearGradient colors={[Colors.border.medium, Colors.border.subtle]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.pipeLine} />}
                <View style={s.pipeStep}>
                  <View style={[s.pipeDot, { backgroundColor: step.color }]} />
                  <Text style={s.pipeLabel}>{step.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </AnimatedEntry>

          {/* Actions */}
          <AnimatedEntry delay={600} duration={500} style={s.actions}>
            <Pressable onPress={handleCamera}>
              <GlassCard accentBorder glowColor="teal" elevated>
                <View style={s.actionRow}>
                  <View style={[s.actionIcon, { backgroundColor: Colors.accent.primaryDim }]}>
                    <Ionicons name="camera" size={26} color={Colors.accent.primary} />
                  </View>
                  <View style={s.actionText}>
                    <Text style={s.actionTitle}>Capture X-Ray</Text>
                    <Text style={s.actionDesc}>Use device camera</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
                </View>
              </GlassCard>
            </Pressable>
            <Pressable onPress={handleGallery} style={{ marginTop: 12 }}>
              <GlassCard glowColor="blue" elevated>
                <View style={s.actionRow}>
                  <View style={[s.actionIcon, { backgroundColor: Colors.accent.secondaryDim }]}>
                    <Ionicons name="images" size={26} color={Colors.accent.secondary} />
                  </View>
                  <View style={s.actionText}>
                    <Text style={s.actionTitle}>Upload from Gallery</Text>
                    <Text style={s.actionDesc}>Select existing image</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
                </View>
              </GlassCard>
            </Pressable>
          </AnimatedEntry>

          <FadeIn delay={750} duration={400} style={s.footer}>
            <Text style={s.footerText}>Supports PNG, JPEG, DICOM • Max 50 MB</Text>
          </FadeIn>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const CS = 120;
const s = StyleSheet.create({
  fill: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 22, paddingBottom: 110 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text.primary, marginTop: 20, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.text.tertiary, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  scanArea: { alignItems: 'center', justifyContent: 'center', height: 220, marginBottom: 24 },
  pAbs: { position: 'absolute' },
  pDot: { width: 5, height: 5, borderRadius: 3, opacity: 0.7 },
  glow: { position: 'absolute', width: 200, height: 200, borderRadius: 100 },
  glowGrad: { width: '100%', height: '100%', borderRadius: 100 },
  centerCircle: { width: CS, height: CS, borderRadius: CS / 2, overflow: 'hidden', elevation: 24, shadowColor: '#4F8EF7', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 24 },
  centerGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: CS + 40, height: CS + 40, borderRadius: (CS + 40) / 2, borderWidth: 1, borderColor: 'rgba(0,212,170,0.15)' },
  ringOuter: { position: 'absolute', width: CS + 80, height: CS + 80, borderRadius: (CS + 80) / 2, borderWidth: 1, borderColor: Colors.border.subtle },
  pipeline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 },
  pipeStep: { alignItems: 'center', gap: 5 },
  pipeDot: { width: 10, height: 10, borderRadius: 5 },
  pipeLabel: { fontSize: 10, fontWeight: '600', color: Colors.text.tertiary, letterSpacing: 0.3 },
  pipeLine: { width: 40, height: 2, borderRadius: 1 },
  actions: { gap: 0 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  actionIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  actionDesc: { fontSize: 12, color: Colors.text.tertiary, marginTop: 2 },
  footer: { alignItems: 'center', marginTop: 'auto', paddingVertical: 14 },
  footerText: { fontSize: 11, color: Colors.text.quaternary },
});
