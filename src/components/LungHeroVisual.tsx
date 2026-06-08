
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// A handful of subtle drifting particles (the reference has a few sparkles)
const PARTICLES = [
  { top: '12%', left: '20%', size: 2.5, opacity: 0.45, dur: 3200, range: 8 },
  { top: '28%', left: '70%', size: 2,   opacity: 0.35, dur: 2800, range: 6 },
  { top: '58%', left: '15%', size: 2,   opacity: 0.30, dur: 3600, range: 10 },
  { top: '72%', left: '78%', size: 3,   opacity: 0.40, dur: 2600, range: 7 },
  { top: '40%', left: '92%', size: 2,   opacity: 0.30, dur: 3400, range: 9 },
  { top: '85%', left: '45%', size: 1.8, opacity: 0.25, dur: 3000, range: 8 },
];

interface Props {
  /** Overall opacity of the lung image (default 0.95) */
  intensity?: number;
}

export function LungHeroVisual({ intensity = 0.95 }: Props) {
  const breathAnim = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 3000, easing: Easing.bezier(0.4, 0, 0.6, 1), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 3000, easing: Easing.bezier(0.4, 0, 0.6, 1), useNativeDriver: true }),
      ])
    ).start();

    particleAnims.forEach((anim, i) => {
      const p = PARTICLES[i];
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -p.range, duration: p.dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue:  p.range, duration: p.dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const breathScale = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.04] });
  const bloomOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.20, 0.55] });

  return (
    <View style={s.container} pointerEvents="none">
      {/* Soft pulsing bloom behind the lungs */}
      <Animated.View style={[s.bloom, { opacity: bloomOpacity }]}>
        <LinearGradient
          colors={['rgba(56,189,248,0.22)', 'rgba(59,130,246,0.10)', 'transparent']}
          style={s.bloomGrad}
          start={{ x: 0.5, y: 0.45 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* The lung image — fills container, breathes */}
      <Animated.Image
        source={require('../../assets/lungs_hologram.png')}
        style={[s.lungImage, { opacity: intensity, transform: [{ scale: breathScale }] }]}
        resizeMode="contain"
      />

      {/* Subtle drifting particles */}
      {PARTICLES.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            s.particle,
            {
              top: p.top as any,
              left: p.left as any,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              opacity: p.opacity,
              transform: [{ translateY: particleAnims[i] }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  bloom: { position: 'absolute', width: '120%', height: '120%' },
  bloomGrad: { flex: 1 },
  lungImage: { width: '100%', height: '100%' },
  particle: { position: 'absolute', backgroundColor: 'rgba(56,189,248,0.75)' },
});