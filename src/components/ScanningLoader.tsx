/**
 * ScanningLoader.tsx — Animated AI Scanning Overlay
 * ==================================================
 * Displays the uploaded image with a vertical scanning laser
 * effect while the AI processes the image.
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { FadeIn } from './AnimatedEntry';

interface ScanningLoaderProps {
  imageUri: string;
  message: string;
  subtitle?: string;
}

export function ScanningLoader({ imageUri, message, subtitle }: ScanningLoaderProps) {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous loop from 0 to 1 and back
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanAnim]);

  // Translate from top (0) to bottom (280) of the card
  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280],
  });

  return (
    <View style={s.container}>
      <FadeIn duration={600} style={s.card}>
        <ImageBackground 
          source={{ uri: imageUri }} 
          style={s.imageBg} 
          imageStyle={s.imageStyle}
          resizeMode="cover"
        >
          {/* A dark overlay so the scan line pops */}
          <View style={s.darkOverlay} />
          
          {/* Animated Scanning Container */}
          <Animated.View style={[s.scannerContainer, { transform: [{ translateY }] }]}>
            {/* The solid cyan laser line */}
            <View style={s.laserLine} />
            {/* The gradient glow trailing below the line */}
            <LinearGradient
              colors={['rgba(34, 211, 238, 0.4)', 'transparent']}
              style={s.laserGlow}
            />
          </Animated.View>
        </ImageBackground>
      </FadeIn>

      <View style={s.textContainer}>
        <Text style={s.message}>{message}</Text>
        {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  card: {
    width: '100%',
    height: 300,
    backgroundColor: '#050A15',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    overflow: 'hidden',
  },
  imageBg: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imageStyle: {
    opacity: 0.5, // keep image visible but dark
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 21, 0.3)', // subtle tint over the image
  },
  scannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100, // holds line + glow
    zIndex: 10,
  },
  laserLine: {
    width: '100%',
    height: 3,
    backgroundColor: Colors.accent.cyan,
    shadowColor: Colors.accent.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  laserGlow: {
    width: '100%',
    height: 60,
  },
  textContainer: {
    marginTop: Spacing.xxxl,
    alignItems: 'center',
  },
  message: {
    ...Typography.headingMedium,
    color: Colors.accent.cyan,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
