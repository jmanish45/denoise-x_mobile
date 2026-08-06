/**
 * camera.tsx — Camera Screen
 * ============================
 * Native camera view to capture X-Ray films with a premium overlay.
 */

import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { hapticImpact, hapticSelection } from '../src/services/preferences';
import { Colors, Typography, Spacing, BorderRadius } from '../src/theme';
import { GradientButton } from '../src/components/GradientButton';
import { FadeIn, AnimatedEntry } from '../src/components/AnimatedEntry';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [flashEnabled, setFlashEnabled] = useState(false);

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <LinearGradient colors={[Colors.bg.primary, '#0D1321']} style={styles.permissionContainer}>
        <SafeAreaView style={styles.permissionSafe}>
          <Ionicons name="camera-outline" size={64} color={Colors.text.tertiary} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>We need access to your camera to capture X-Ray images for AI-powered denoising.</Text>
          <GradientButton title="Grant Permission" onPress={requestPermission} icon={<Ionicons name="shield-checkmark-outline" size={20} color="#fff" />} style={{ marginTop: Spacing.xxl }} />
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    hapticImpact('heavy');
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
    if (photo) {
      router.push({ pathname: '/results', params: { imageUri: photo.uri, fileName: 'capture.jpg' } });
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} flash={flashEnabled ? 'on' : 'off'}>
        <SafeAreaView style={styles.overlayTop}>
          <FadeIn delay={200} duration={500} style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.controlBtn}>
              <Ionicons name="close" size={28} color="#fff" />
            </Pressable>
            <View style={styles.topCenter}>
              <Text style={styles.cameraLabel}>X-Ray Capture</Text>
            </View>
            <Pressable onPress={() => { hapticSelection(); setFlashEnabled(!flashEnabled); }} style={styles.controlBtn}>
              <Ionicons name={flashEnabled ? 'flash' : 'flash-off'} size={24} color={flashEnabled ? Colors.accent.primary : '#fff'} />
            </Pressable>
          </FadeIn>
        </SafeAreaView>

        {/* Scan frame */}
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        <Text style={styles.hint}>Align X-Ray within the frame</Text>

        <AnimatedEntry delay={300} duration={600} style={styles.bottomBar}>
          <Pressable onPress={() => { hapticSelection(); setFacing(facing === 'back' ? 'front' : 'back'); }} style={styles.sideBtn}>
            <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
          </Pressable>
          <Pressable onPress={handleCapture} style={styles.captureOuter}>
            <LinearGradient colors={[Colors.accent.primary, Colors.accent.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.captureInner} />
          </Pressable>
          <View style={styles.sideBtn} />
        </AnimatedEntry>
      </CameraView>
    </View>
  );
}

const FRAME_SIZE = width * 0.75;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  permissionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxl },
  permissionSafe: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  permissionTitle: { ...Typography.headingLarge, color: Colors.text.primary, marginTop: Spacing.xxl, marginBottom: Spacing.md, textAlign: 'center' },
  permissionText: { ...Typography.bodyMedium, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  backLink: { marginTop: Spacing.xxl },
  backLinkText: { ...Typography.labelMedium, color: Colors.text.tertiary },
  overlayTop: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  topCenter: { flex: 1, alignItems: 'center' },
  cameraLabel: { ...Typography.labelMedium, color: 'rgba(255,255,255,0.7)' },
  controlBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)' },
  scanFrame: { position: 'absolute', top: (height - FRAME_SIZE) / 2 - 40, left: (width - FRAME_SIZE) / 2, width: FRAME_SIZE, height: FRAME_SIZE },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: Colors.accent.primary },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  hint: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.6)', textAlign: 'center', position: 'absolute', bottom: 180, left: 0, right: 0 },
  bottomBar: { position: 'absolute', bottom: 50, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xxxl },
  captureOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#fff', padding: 4, alignItems: 'center', justifyContent: 'center' },
  captureInner: { width: '100%', height: '100%', borderRadius: 34 },
  sideBtn: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.3)' },
});
