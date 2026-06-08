/**
 * results.tsx — AI Results Viewer
 * =================================
 * Uses expo-file-system/legacy API (proven to work in Expo Go)
 * to save base64 images to cache files before displaying.
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, Image, ScrollView, Pressable, Dimensions,
  Modal, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Colors, Typography, Spacing, BorderRadius } from '../src/theme';
import { GlassCard } from '../src/components/GlassCard';
import ImageViewer from 'react-native-image-zoom-viewer';
import { ScanningLoader } from '../src/components/ScanningLoader';
import { AnimatedEntry, FadeIn } from '../src/components/AnimatedEntry';
import { denoiseImage, DenoiseResponse } from '../src/services/api';
import { requireNetwork } from '../src/services/networkUtils';
import { resizeForUpload } from '../src/services/imageUtils';
import { saveScanResult } from '../src/services/scanHistory';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const IMG_W = SCREEN_W - Spacing.xxl * 2;

type ViewMode = 'original' | 'enhanced' | 'noise_map' | 'unet';

const MODE_META: Record<ViewMode, { label: string; icon: string }> = {
  original:  { label: 'Original',  icon: 'image-outline' },
  enhanced:  { label: 'Enhanced',  icon: 'sparkles' },
  noise_map: { label: 'Noise Map', icon: 'layers-outline' },
  unet:      { label: 'U-Net Raw', icon: 'git-network-outline' },
};

/** Strip `data:image/…;base64,` prefix if present */
function rawBase64(b64: string): string {
  if (b64.startsWith('data:')) {
    const i = b64.indexOf(',');
    return i >= 0 ? b64.substring(i + 1) : b64;
  }
  return b64;
}

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri: string; fileName: string }>();

  const [loading, setLoading]         = useState(true);
  const [loadMsg, setLoadMsg]         = useState('Preparing image…');
  const [error, setError]             = useState('');
  const [result, setResult]           = useState<DenoiseResponse | null>(null);
  const [viewMode, setViewMode]       = useState<ViewMode>('enhanced');
  const [fullScreen, setFullScreen]   = useState(false);
  const [saving, setSaving]           = useState(false);

  // file:// URIs for each view mode — written to cache for reliable rendering
  const [files, setFiles] = useState<Record<ViewMode, string | null>>({
    original: null, enhanced: null, noise_map: null, unet: null,
  });

  useEffect(() => {
    if (params.imageUri) processImage();
  }, [params.imageUri]);

  // ── Write base64 → cache file ────────────────────────────────────────────
  async function b64ToFile(b64: string, tag: string): Promise<string> {
    const file = new File(Paths.cache, `denoisex_${tag}_${Date.now()}.png`);
    if (!file.exists) file.create({ overwrite: true, intermediates: true });
    file.write(rawBase64(b64), { encoding: 'base64' });
    return file.uri;
  }

  // ── Main processing pipeline ────────────────────────────────────────────────
  async function processImage() {
    setLoading(true);
    setError('');
    try {
      setLoadMsg('Checking connection…');
      await requireNetwork();

      setLoadMsg('Optimising image…');
      const opt = await resizeForUpload(params.imageUri!);

      setLoadMsg('AI Processing…');
      const data = await denoiseImage(opt.uri, params.fileName || 'upload.jpg');
      setResult(data);

      setLoadMsg('Preparing results…');
      const [f1, f2, f3, f4] = await Promise.all([
        b64ToFile(data.original_b64,  'original'),
        b64ToFile(data.enhanced_b64,  'enhanced'),
        b64ToFile(data.noise_map_b64, 'noise_map'),
        b64ToFile(data.unet_b64,      'unet'),
      ]);
      setFiles({ original: f1, enhanced: f2, noise_map: f3, unet: f4 });

      // Save to history (truncated b64 for thumbnails)
      try {
        await saveScanResult({
          fileName: params.fileName || 'upload.jpg',
          width: data.width, height: data.height,
          noise_variance: data.noise_variance,
          processing_time_ms: data.processing_time_ms,
          was_bypassed: data.was_bypassed,
          routing_message: data.routing_message,
          enhanced_b64: data.enhanced_b64.substring(0, 500),
          original_b64: data.original_b64.substring(0, 500),
        });
      } catch { /* non-critical */ }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      setError(e.message || 'Processing failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m: ViewMode) { Haptics.selectionAsync(); setViewMode(m); }

  const curFile = files[viewMode];

  // ── Save to gallery ─────────────────────────────────────────────────────────
  async function handleSave() {
    if (!curFile) return;
    setSaving(true);
    try {
      // Pass 'true' to request writeOnly permissions, avoiding the AUDIO permission error
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Allow photo library access to save images.');
        return;
      }
      const asset = await MediaLibrary.createAssetAsync(curFile);
      await MediaLibrary.createAlbumAsync('Denoise X', asset, false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved ✓', `${MODE_META[viewMode].label} saved to "Denoise X" album.`);
    } catch (e: any) {
      Alert.alert('Save Failed', e.message);
    } finally { setSaving(false); }
  }

  // ── Share ───────────────────────────────────────────────────────────────────
  async function handleShare() {
    if (!curFile) return;
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Unavailable', 'Sharing not available on this device.');
        return;
      }
      await Sharing.shareAsync(curFile, { mimeType: 'image/png' });
    } catch { /* user cancelled */ }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // Loading
  if (loading) {
    return (
      <LinearGradient colors={[Colors.bg.primary, '#0D1321']} style={s.fill}>
        <SafeAreaView style={s.center}>
          <Pressable onPress={() => router.back()} style={s.backAbs}>
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </Pressable>
          <ScanningLoader
            imageUri={params.imageUri}
            message={loadMsg}
            subtitle={loadMsg.includes('AI') ? 'Running Noise2Noise U-Net' : undefined}
          />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Error
  if (error) {
    return (
      <LinearGradient colors={[Colors.bg.primary, '#0D1321']} style={s.fill}>
        <SafeAreaView style={s.center}>
          <Ionicons name="alert-circle" size={64} color={Colors.status.error} />
          <Text style={s.errTitle}>Processing Failed</Text>
          <Text style={s.errMsg}>{error}</Text>
          <Pressable onPress={processImage} style={s.retryBtn}>
            <Ionicons name="refresh" size={20} color={Colors.accent.primary} />
            <Text style={s.retryTxt}>Try Again</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={{ marginTop: Spacing.lg }}>
            <Text style={s.retryTxt}>Go Back</Text>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Success
  return (
    <LinearGradient colors={[Colors.bg.primary, '#0D1321']} style={s.fill}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Header */}
          <FadeIn duration={400} style={s.header}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
            </Pressable>
            <Text style={s.headerTitle}>Analysis Results</Text>
            <View style={{ width: 44 }} />
          </FadeIn>

          {/* ── Image preview ──────────────────────────────────────────── */}
          <AnimatedEntry delay={200} duration={500}>
            <Pressable
              onPress={() => { if (curFile) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullScreen(true); }}}
              style={s.imgBox}
            >
              {curFile ? (
                <Image source={{ uri: curFile }} style={s.img} resizeMode="contain" />
              ) : (
                <View style={s.imgLoading}>
                  <ActivityIndicator color={Colors.accent.primary} />
                  <Text style={s.imgLoadTxt}>Loading image…</Text>
                </View>
              )}
              {curFile && (
                <View style={s.tapBadge}>
                  <Ionicons name="expand-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={s.tapTxt}>Tap to expand</Text>
                </View>
              )}
            </Pressable>
          </AnimatedEntry>

          {/* ── View mode tabs ─────────────────────────────────────────── */}
          <AnimatedEntry delay={350} duration={500}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>
              {(Object.keys(MODE_META) as ViewMode[]).map(m => (
                <Pressable key={m} onPress={() => switchMode(m)}
                  style={[s.tab, viewMode === m && s.tabOn]}>
                  <Ionicons name={MODE_META[m].icon as any} size={16}
                    color={viewMode === m ? Colors.accent.primary : Colors.text.tertiary} />
                  <Text style={[s.tabTxt, viewMode === m && s.tabTxtOn]}>
                    {MODE_META[m].label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </AnimatedEntry>

          {/* ── Save / Share row ────────────────────────────────────────── */}
          <AnimatedEntry delay={450} duration={500} style={s.actRow}>
            <Pressable style={s.actItem} onPress={handleSave} disabled={saving || !curFile}>
              <View style={[s.actCircle, { backgroundColor: Colors.accent.primaryDim }]}>
                {saving
                  ? <ActivityIndicator size="small" color={Colors.accent.primary} />
                  : <Ionicons name="download-outline" size={22} color={Colors.accent.primary} />}
              </View>
              <Text style={s.actLabel}>Save</Text>
            </Pressable>
            <Pressable style={s.actItem} onPress={handleShare} disabled={!curFile}>
              <View style={[s.actCircle, { backgroundColor: Colors.accent.secondaryDim }]}>
                <Ionicons name="share-outline" size={22} color={Colors.accent.secondary} />
              </View>
              <Text style={s.actLabel}>Share</Text>
            </Pressable>
          </AnimatedEntry>

          {/* ── Metadata ───────────────────────────────────────────────── */}
          {result && (
            <AnimatedEntry delay={550} duration={500} style={s.meta}>
              <GlassCard accentBorder={!result.was_bypassed}>
                <View style={s.metaRow}>
                  <View style={[s.metaIcon, { backgroundColor: result.was_bypassed ? Colors.accent.secondaryDim : Colors.accent.primaryDim }]}>
                    <Ionicons name={result.was_bypassed ? 'shield-checkmark' : 'flash'} size={22}
                      color={result.was_bypassed ? Colors.accent.secondary : Colors.accent.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.metaLabel}>AI Routing</Text>
                    <Text style={s.metaVal}>{result.routing_message}</Text>
                  </View>
                </View>
              </GlassCard>
              <View style={s.statRow}>
                <GlassCard style={s.statCard}>
                  <Text style={s.statLbl}>Noise Variance</Text>
                  <Text style={s.statVal}>{result.noise_variance.toFixed(2)}</Text>
                </GlassCard>
                <GlassCard style={s.statCard}>
                  <Text style={s.statLbl}>Processing</Text>
                  <Text style={s.statVal}>{result.processing_time_ms.toFixed(0)}ms</Text>
                </GlassCard>
              </View>
              <View style={s.statRow}>
                <GlassCard style={s.statCard}>
                  <Text style={s.statLbl}>Resolution</Text>
                  <Text style={s.statVal}>{result.width}×{result.height}</Text>
                </GlassCard>
                <GlassCard style={s.statCard}>
                  <Text style={s.statLbl}>AI Status</Text>
                  <Text style={[s.statVal, { color: result.was_bypassed ? Colors.accent.secondary : Colors.accent.primary }]}>
                    {result.was_bypassed ? 'Bypassed' : 'Enhanced'}
                  </Text>
                </GlassCard>
              </View>
            </AnimatedEntry>
          )}

          {/* New Scan */}
          <AnimatedEntry delay={700} duration={500}>
            <Pressable style={s.newScanBtn} onPress={() => router.push('/(tabs)/denoise')}>
              <LinearGradient colors={[Colors.accent.primary, Colors.accent.secondary]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.newScanGrad}>
                <Ionicons name="add-circle-outline" size={22} color="#fff" />
                <Text style={s.newScanTxt}>New Scan</Text>
              </LinearGradient>
            </Pressable>
          </AnimatedEntry>
        </ScrollView>
      </SafeAreaView>

      {/* ═══ Full-screen modal ══════════════════════════════════════════════ */}
      <Modal visible={fullScreen} transparent animationType="fade"
        statusBarTranslucent onRequestClose={() => setFullScreen(false)}>
        <View style={s.modalBg}>
          {/* Top bar */}
          <SafeAreaView style={s.modalTop}>
            <View style={s.modalTopRow}>
              <View>
                <Text style={s.modalTitle}>{MODE_META[viewMode].label}</Text>
                {result && <Text style={s.modalSub}>{result.width}×{result.height}</Text>}
              </View>
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFullScreen(false); }} style={s.modalClose}>
                <Ionicons name="close" size={28} color="#fff" />
              </Pressable>
            </View>
          </SafeAreaView>

          {/* Image */}
          {curFile && (
            <View style={{ flex: 1 }}>
              <ImageViewer
                imageUrls={[{ url: curFile }]}
                backgroundColor="transparent"
                renderIndicator={() => <></>} // hide the "1/1" page indicator
                enableSwipeDown={false} // Disable swipe down to close as we have a close button
                maxOverflow={0}
              />
            </View>
          )}

          {/* Bottom bar */}
          <SafeAreaView style={s.modalBot}>
            <View style={s.modalBotRow}>
              <Pressable style={s.modalAct} onPress={handleSave}>
                {saving ? <ActivityIndicator size="small" color="#fff" />
                  : <Ionicons name="download-outline" size={24} color="#fff" />}
                <Text style={s.modalActTxt}>Save</Text>
              </Pressable>
              <Pressable style={s.modalAct} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color="#fff" />
                <Text style={s.modalActTxt}>Share</Text>
              </Pressable>
              <Pressable style={s.modalAct} onPress={() => {
                const modes: ViewMode[] = ['original','enhanced','noise_map','unet'];
                switchMode(modes[(modes.indexOf(viewMode) + 1) % 4]);
              }}>
                <Ionicons name="swap-horizontal-outline" size={24} color="#fff" />
                <Text style={s.modalActTxt}>Next</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  scroll: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.huge },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.md, marginBottom: Spacing.xxl },
  headerTitle: { ...Typography.headingMedium, color: Colors.text.primary },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backAbs: { position: 'absolute', top: 60, left: Spacing.xxl, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', zIndex: 10 },

  // Image box
  imgBox: { width: IMG_W, height: IMG_W * 0.85, borderRadius: BorderRadius.lg, overflow: 'hidden', backgroundColor: Colors.bg.tertiary, borderWidth: 1, borderColor: Colors.border.subtle, marginBottom: Spacing.lg },
  img: { width: '100%', height: '100%' },
  imgLoading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imgLoadTxt: { ...Typography.caption, color: Colors.text.tertiary },
  tapBadge: { position: 'absolute', bottom: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  tapTxt: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },

  // Tabs
  tabs: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: Spacing.lg },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: 20, backgroundColor: Colors.glass.bg, borderWidth: 1, borderColor: Colors.border.subtle },
  tabOn: { borderColor: Colors.accent.primary, backgroundColor: Colors.accent.primaryDim },
  tabTxt: { ...Typography.labelSmall, color: Colors.text.tertiary, textTransform: 'none' },
  tabTxtOn: { color: Colors.accent.primary },

  // Action row
  actRow: { flexDirection: 'row', justifyContent: 'center', gap: 48, marginBottom: Spacing.xxl },
  actItem: { alignItems: 'center', gap: 4 },
  actCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  actLabel: { ...Typography.caption, color: Colors.text.secondary },

  // Metadata
  meta: { gap: Spacing.md, marginBottom: Spacing.xxl },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  metaIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  metaLabel: { ...Typography.labelSmall, color: Colors.text.tertiary, textTransform: 'none', marginBottom: 2 },
  metaVal: { ...Typography.bodyMedium, color: Colors.text.primary },
  statRow: { flexDirection: 'row', gap: Spacing.md },
  statCard: { flex: 1, alignItems: 'center' },
  statLbl: { ...Typography.caption, color: Colors.text.tertiary, marginBottom: 4 },
  statVal: { ...Typography.headingSmall, color: Colors.text.primary },

  // Error
  errTitle: { ...Typography.headingLarge, color: Colors.text.primary, marginTop: Spacing.xxl, marginBottom: 8 },
  errMsg: { ...Typography.bodyMedium, color: Colors.text.secondary, textAlign: 'center' },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.xxl, paddingVertical: 12, paddingHorizontal: 24, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border.accent },
  retryTxt: { ...Typography.labelMedium, color: Colors.accent.primary },

  // New Scan
  newScanBtn: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  newScanGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 24 },
  newScanTxt: { ...Typography.labelLarge, color: '#fff' },

  // Modal
  modalBg: { flex: 1, backgroundColor: '#000' },
  modalTop: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 },
  modalTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xxl, paddingTop: 12, paddingBottom: 12, backgroundColor: 'rgba(0,0,0,0.65)' },
  modalTitle: { ...Typography.labelLarge, color: '#fff' },
  modalSub: { ...Typography.caption, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  modalClose: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  modalImg: { flex: 1, width: SCREEN_W, height: SCREEN_H },
  modalBot: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20 },
  modalBotRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, paddingHorizontal: Spacing.xxl, backgroundColor: 'rgba(0,0,0,0.65)' },
  modalAct: { alignItems: 'center', gap: 4, paddingHorizontal: 16 },
  modalActTxt: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
});
