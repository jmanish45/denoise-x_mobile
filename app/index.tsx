/**
 * index.tsx — branded boot state while the root layout resolves auth.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { StartupBrandMark } from '../src/components/StartupBrandMark';
import { Colors, Typography } from '../src/theme';

export default function Index() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.08] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.64] });

  return (
    <LinearGradient colors={[Colors.startup.bg, '#07100E', Colors.startup.bg]} style={styles.container}>
      <Animated.View style={[styles.ring, { transform: [{ scale }], opacity }]} />
      <View style={styles.content}>
        <StartupBrandMark showLabel={false} />
        <Text style={styles.brand}>DENOISE-X</Text>
        <Text style={styles.kicker}>INITIALIZING CLINICAL WORKSPACE</Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { transform: [{ scaleX: scale }], opacity }]} />
        </View>
        <View style={styles.statusRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color={Colors.startup.tealBright} />
          <Text style={styles.status}>Secure local session</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: Colors.startup.borderStrong },
  content: { alignItems: 'center' },
  brand: { ...Typography.labelLarge, marginTop: 18, fontSize: 16, letterSpacing: 2, color: Colors.startup.text },
  kicker: { ...Typography.captionSmall, marginTop: 6, fontSize: 8, letterSpacing: 1.2, color: Colors.startup.quiet },
  progressTrack: { width: 138, height: 2, overflow: 'hidden', marginTop: 26, borderRadius: 2, backgroundColor: Colors.startup.border },
  progressFill: { width: '100%', height: '100%', transformOrigin: 'left', backgroundColor: Colors.startup.tealBright },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  status: { ...Typography.captionSmall, fontSize: 9, color: Colors.startup.muted },
});
