    /**
     * LungHeroVisual.tsx — Cinematic Holographic Lungs
     * ===================================================
     * Multi-layered hero visual: atmospheric glow, holographic lung
     * image, neural particles, pulsing bloom, and breathing motion.
     * Lightweight — uses Image + gradients + Animated API only.
     */
    
    import React, { useEffect, useRef } from 'react';
    import { StyleSheet, View, Image, Animated, Easing, Dimensions } from 'react-native';
    import { LinearGradient } from 'expo-linear-gradient';
    
    const { width: SW } = Dimensions.get('window');
    const LUNG_SIZE = SW * 0.52;
    
    // Particle config — small floating dots
    const PARTICLES = [
      { top: '8%',  left: '15%', size: 3, opacity: 0.5, dur: 3200, range: 8 },
      { top: '20%', left: '80%', size: 2.5, opacity: 0.4, dur: 2800, range: 6 },
      { top: '55%', left: '10%', size: 2, opacity: 0.35, dur: 3600, range: 10 },
      { top: '70%', left: '85%', size: 3.5, opacity: 0.45, dur: 2600, range: 7 },
      { top: '35%', left: '5%',  size: 2, opacity: 0.3, dur: 4000, range: 5 },
      { top: '45%', left: '92%', size: 2.5, opacity: 0.35, dur: 3400, range: 9 },
      { top: '12%', left: '60%', size: 1.5, opacity: 0.25, dur: 3800, range: 6 },
      { top: '80%', left: '40%', size: 2, opacity: 0.3, dur: 3000, range: 8 },
      { top: '65%', left: '25%', size: 3, opacity: 0.4, dur: 2900, range: 7 },
      { top: '25%', left: '45%', size: 1.5, opacity: 0.2, dur: 4200, range: 5 },
    ];
    
    interface Props {
      /** Overall size multiplier (default 1) */
      scale?: number;
    }
    
    export function LungHeroVisual({ scale = 1 }: Props) {
      // Breathing animation — slow scale pulse
      const breathAnim = useRef(new Animated.Value(0)).current;
      // Glow bloom pulse
      const glowAnim = useRef(new Animated.Value(0)).current;
      // Particle float animations
      const particleAnims = useRef(PARTICLES.map(() => new Animated.Value(0))).current;
    
      useEffect(() => {
        // Breathing: slow 4s scale oscillation
        Animated.loop(
          Animated.sequence([
            Animated.timing(breathAnim, {
              toValue: 1, duration: 4000,
              easing: Easing.inOut(Easing.ease), useNativeDriver: true,
            }),
            Animated.timing(breathAnim, {
              toValue: 0, duration: 4000,
              easing: Easing.inOut(Easing.ease), useNativeDriver: true,
            }),
          ])
        ).start();
    
        // Glow bloom
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1, duration: 3000,
              easing: Easing.bezier(0.4, 0, 0.6, 1), useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0, duration: 3000,
              easing: Easing.bezier(0.4, 0, 0.6, 1), useNativeDriver: true,
            }),
          ])
        ).start();
    
        // Particle floats
        particleAnims.forEach((anim, i) => {
          const p = PARTICLES[i];
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim, {
                toValue: -p.range, duration: p.dur,
                easing: Easing.inOut(Easing.ease), useNativeDriver: true,
              }),
              Animated.timing(anim, {
                toValue: p.range, duration: p.dur,
                easing: Easing.inOut(Easing.ease), useNativeDriver: true,
              }),
            ])
          ).start();
        });
      }, []);
    
      const breathScale = breathAnim.interpolate({
        inputRange: [0, 1], outputRange: [0.97 * scale, 1.03 * scale],
      });
      const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1], outputRange: [0.15, 0.45],
      });
      const glowScale = glowAnim.interpolate({
        inputRange: [0, 1], outputRange: [0.9, 1.15],
      });
    
      return (
        <View style={s.container}>
          {/* ── Layer 1: Atmospheric radial glow ── */}
          <Animated.View style={[s.radialGlow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}>
            <LinearGradient
              colors={['rgba(56,189,248,0.18)', 'rgba(59,130,246,0.08)', 'transparent']}
              style={s.radialGlowGrad}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
    
          {/* Secondary glow — lower, warmer */}
          <Animated.View style={[s.radialGlow2, { opacity: glowOpacity }]}>
            <LinearGradient
              colors={['rgba(0,212,170,0.08)', 'transparent']}
              style={s.radialGlow2Grad}
              start={{ x: 0.5, y: 0.3 }}
              end={{ x: 0.5, y: 1 }}
            />
          </Animated.View>
    
          {/* ── Layer 2: Holographic lung image ── */}
          <Animated.View style={[s.lungWrap, { transform: [{ scale: breathScale }] }]}>
            {/* Soft bloom behind image */}
            <View style={s.lungBloom}>
              <LinearGradient
                colors={['rgba(56,189,248,0.12)', 'rgba(59,130,246,0.06)', 'transparent']}
                style={s.lungBloomGrad}
                start={{ x: 0.5, y: 0.3 }}
                end={{ x: 0.5, y: 1 }}
              />
            </View>
            <Image
              source={require('../../assets/lungs_hologram.png')}
              style={s.lungImage}
              resizeMode="contain"
            />
          </Animated.View>
    
          {/* ── Layer 3: Outer glow ring ── */}
          <Animated.View style={[s.glowRing, { opacity: glowOpacity }]} />
          <View style={s.glowRingOuter} />
    
          {/* ── Layer 4: Neural particles ── */}
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
    
          {/* Bottom vignette fade */}
          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(6,10,20,0.8)', 'rgba(6,10,20,1)']}
            locations={[0, 0.5, 0.8, 1]}
            style={s.vignette}
            pointerEvents="none"
          />
        </View>
      );
    }
    
    const s = StyleSheet.create({
      container: {
        width: '100%',
        height: LUNG_SIZE + 40,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      },
    
      // Layer 1: Atmospheric glow
      radialGlow: {
        position: 'absolute',
        width: LUNG_SIZE * 1.6,
        height: LUNG_SIZE * 1.6,
        borderRadius: LUNG_SIZE * 0.8,
      },
      radialGlowGrad: {
        width: '100%',
        height: '100%',
        borderRadius: LUNG_SIZE * 0.8,
      },
      radialGlow2: {
        position: 'absolute',
        width: LUNG_SIZE * 1.2,
        height: LUNG_SIZE * 0.8,
        bottom: 0,
      },
      radialGlow2Grad: {
        width: '100%',
        height: '100%',
      },
    
      // Layer 2: Lung image
      lungWrap: {
        width: LUNG_SIZE,
        height: LUNG_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
      },
      lungBloom: {
        position: 'absolute',
        width: LUNG_SIZE * 1.3,
        height: LUNG_SIZE * 1.3,
        borderRadius: LUNG_SIZE * 0.65,
        alignItems: 'center',
        justifyContent: 'center',
      },
      lungBloomGrad: {
        width: '100%',
        height: '100%',
        borderRadius: LUNG_SIZE * 0.65,
      },
      lungImage: {
        width: LUNG_SIZE,
        height: LUNG_SIZE,
        opacity: 0.85,
      },
    
      // Layer 3: Glow rings
      glowRing: {
        position: 'absolute',
        width: LUNG_SIZE * 1.15,
        height: LUNG_SIZE * 1.15,
        borderRadius: LUNG_SIZE * 0.575,
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.15)',
      },
      glowRingOuter: {
        position: 'absolute',
        width: LUNG_SIZE * 1.35,
        height: LUNG_SIZE * 1.35,
        borderRadius: LUNG_SIZE * 0.675,
        borderWidth: 1,
        borderColor: 'rgba(59,130,246,0.07)',
      },
    
      // Layer 4: Particles
      particle: {
        position: 'absolute',
        backgroundColor: 'rgba(56,189,248,0.7)',
      },
    
      // Vignette
      vignette: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
      },
    });
    