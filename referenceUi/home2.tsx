/**
 * (tabs)/home.tsx — Premium Cinematic Dashboard
 * ================================================
 * Matches the reference UI exactly: atmospheric lung background,
 * gradient-bordered CTA card, stat cards, recent enhancements.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, Pressable, Dimensions, Animated,
  RefreshControl, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { LungHeroVisual } from '../../src/components/LungHeroVisual';
import { AnimatedEntry, FadeIn } from '../../src/components/AnimatedEntry';
import { checkHealth } from '../../src/services/api';
import { getMe, UserPublic } from '../../src/services/auth';
import { useAuth } from '../../src/services/AuthContext';
import { getRecentScans, getScanHistory, ScanRecord } from '../../src/services/scanHistory';


const { width: SW } = Dimensions.get('window');

export default function HomeTab() {
  const router = useRouter();
  const { setLoggedIn } = useAuth();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [enhancedCount, setEnhancedCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const headerOp = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    getMe().then(setUser).catch(() => {});
    checkHealth().then(setServerOnline);
    getRecentScans(3).then(setRecentScans);
    getScanHistory().then((all) => {
      setTotalScans(all.length);
      setEnhancedCount(all.filter(s => !s.was_bypassed).length);
    });
  }, []);

  useEffect(() => {
    loadData();
    Animated.timing(headerOp, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    const iv = setInterval(() => checkHealth().then(setServerOnline), 30_000);
    return () => clearInterval(iv);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning,';
    if (h < 17) return 'Good Afternoon,';
    if (h < 21) return 'Good Evening,';
    return 'Good Night,';
  };

  const handlePickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (!result.canceled && result.assets[0]) {
      router.push({ pathname: '/results', params: { imageUri: result.assets[0].uri, fileName: result.assets[0].fileName || 'upload.jpg' } });
    }
  };

  const successRate = totalScans > 0 ? ((enhancedCount / totalScans) * 100).toFixed(1) : '0.0';

  return (
    <LinearGradient colors={[Colors.bg.primary, '#080E1E', Colors.bg.primary]} style={s.fill}>
      <SafeAreaView style={s.fill} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent.primary} colors={[Colors.accent.primary]} />}
        >
          {/* ═══ HEADER ═══ */}
          <Animated.View style={[s.header, { opacity: headerOp }]}>
            <Pressable style={s.menuBtn}>
              <Ionicons name="menu" size={24} color={Colors.text.secondary} />
            </Pressable>
            <View style={s.headerRight}>
              <Pressable style={s.notifBtn}>
                <Ionicons name="notifications-outline" size={21} color={Colors.text.secondary} />
                <View style={s.notifDot} />
              </Pressable>
              <Pressable onPress={() => router.push('/(tabs)/profile' as any)}>
                <LinearGradient colors={[Colors.accent.primary, Colors.accent.cyan]} style={s.avatarRing}>
                  <View style={s.avatarInner}>
                    <Ionicons name="person" size={18} color={Colors.accent.primary} />
                  </View>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>

          {/* ═══ HERO: GREETING + CINEMATIC LUNGS ═══ */}
          <AnimatedEntry delay={80} duration={500}>
            <View style={s.heroWrap}>
              {/* Greeting text — overlays on left */}
              <View style={s.heroTextSide}>
                <Text style={s.greeting}>{greeting()}</Text>
                <Text style={s.userName}>{user?.full_name || 'Doctor'} 👋</Text>
                <Text style={s.heroSub}>AI-Powered enhancement for{'\n'}clearer, more reliable X-rays.</Text>
              </View>
              {/* Holographic lung visual — right side */}
              <View style={s.heroArt}>
                <LungHeroVisual />
              </View>
            </View>
          </AnimatedEntry>

          {/* ═══ CTA CARD — "Use Denoise-X" ═══ */}
          <AnimatedEntry delay={220} duration={600}>
            <Pressable onPress={handlePickImage}>
              <View style={s.ctaOuter}>
                {/* Gradient border effect */}
                <LinearGradient colors={['rgba(59,130,246,0.5)', 'rgba(139,92,246,0.4)', 'rgba(0,212,170,0.3)', 'rgba(59,130,246,0.2)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                <View style={s.ctaInner}>
                  <LinearGradient colors={['rgba(8,14,30,0.98)', 'rgba(12,18,34,0.95)']} style={StyleSheet.absoluteFill} />
                  {/* Atmospheric top-right glow */}
                  <View style={s.ctaAtmosGlow}>
                    <LinearGradient colors={['rgba(59,130,246,0.12)', 'transparent']} style={{ width: '100%', height: '100%', borderRadius: 100 }} />
                  </View>
                  <View style={s.ctaContent}>
                    <View style={s.ctaLeft}>
                      <Text style={s.ctaTitle}>Use <Text style={{ color: Colors.accent.primary, fontWeight: '700' }}>Denoise-X</Text></Text>
                      <Text style={s.ctaDesc}>Upload a low-dose X-ray and let our AI enhance it for better clarity.</Text>
                      <LinearGradient colors={[Colors.accent.primary, '#0EA47A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.ctaBtn}>
                        <Text style={s.ctaBtnText}>Upload X-ray</Text>
                        <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                      </LinearGradient>
                    </View>
                    {/* Right: X-ray before/after preview */}
                    <View style={s.ctaRight}>
                      <View style={s.xrayPreviewWrap}>
                        {/* Before side */}
                        <View style={s.xrayHalf}>
                          <View style={s.xrayPlaceholder}>
                            <Ionicons name="body" size={50} color="rgba(148,163,184,0.25)" />
                          </View>
                        </View>
                        {/* Glowing divider */}
                        <View style={s.xrayDivider}>
                          <View style={s.xrayDividerLine} />
                          <View style={s.xrayCompareIcon}>
                            <Ionicons name="code" size={12} color={Colors.text.secondary} />
                          </View>
                        </View>
                        {/* After side */}
                        <View style={s.xrayHalf}>
                          <View style={[s.xrayPlaceholder, { backgroundColor: 'rgba(0,212,170,0.04)' }]}>
                            <Ionicons name="body" size={50} color="rgba(0,212,170,0.3)" />
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          </AnimatedEntry>

          {/* ═══ QUICK OVERVIEW ═══ */}
          <AnimatedEntry delay={380} duration={500}>
            <View style={s.secHeader}>
              <Text style={s.secTitle}>Quick Overview</Text>
              <Pressable onPress={() => router.push('/(tabs)/history' as any)}>
                <Text style={s.seeAll}>See All  →</Text>
              </Pressable>
            </View>
            <View style={s.statsRow}>
              <StatCard icon="scan-outline" iconBg={Colors.accent.secondaryDim} iconColor={Colors.accent.secondary} label="Total Scans" value={String(totalScans)} sub={`+${Math.min(totalScans, 12)} this week`} subColor={Colors.accent.primary} />
              <StatCard icon="checkmark-circle-outline" iconBg={Colors.accent.primaryDim} iconColor={Colors.accent.primary} label="Enhanced" value={String(enhancedCount)} sub={`${successRate}% success`} subColor={Colors.accent.primary} />
              <StatCard icon="time-outline" iconBg="rgba(245,158,11,0.12)" iconColor="#F59E0B" label="Time Saved" value={`${(totalScans * 0.3).toFixed(1)}`} valueSuffix=" hrs" sub="This month" subColor={Colors.text.quaternary} />
            </View>
          </AnimatedEntry>

          {/* ═══ RECENT ENHANCEMENTS ═══ */}
          <AnimatedEntry delay={520} duration={500}>
            <View style={s.secHeader}>
              <Text style={s.secTitle}>Recent Enhancements</Text>
            </View>
            {recentScans.length === 0 ? (
              <GlassCard glowColor="blue">
                <View style={s.emptyRecent}>
                  <Ionicons name="images-outline" size={32} color={Colors.text.quaternary} />
                  <Text style={s.emptyRecentText}>No enhancements yet. Upload your first X-ray!</Text>
                </View>
              </GlassCard>
            ) : (
              recentScans.map((scan) => (
                <GlassCard key={scan.id} style={s.recentCard} glowColor="blue">
                  <View style={s.recentRow}>
                    <View style={s.recentThumb}>
                      <Ionicons name="image-outline" size={24} color={Colors.accent.cyan} />
                    </View>
                    <View style={s.recentInfo}>
                      <Text style={s.recentName} numberOfLines={1}>{scan.fileName}</Text>
                      <View style={s.recentMeta}>
                        <Ionicons name="calendar-outline" size={10} color={Colors.text.quaternary} />
                        <Text style={s.recentDate}>
                          {new Date(scan.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' • '}
                          {new Date(scan.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <View style={s.recentBadge}>
                        <Ionicons name="checkmark-circle" size={11} color={Colors.accent.primary} />
                        <Text style={s.recentBadgeText}>
                          {scan.was_bypassed ? 'Bypassed — Clean' : 'Enhancement Completed'}
                        </Text>
                      </View>
                    </View>
                    <Pressable style={s.viewBtn}>
                      <Text style={s.viewBtnText}>View</Text>
                    </Pressable>
                  </View>
                </GlassCard>
              ))
            )}
          </AnimatedEntry>

          {/* Footer */}
          <FadeIn delay={700} duration={400} style={s.footer}>
            <Text style={s.footerText}>⚠️ For supplementary clinical decision support only.{'\n'}Always consult a qualified healthcare provider.</Text>
          </FadeIn>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ── Stat Card Sub-component ── */
function StatCard({ icon, iconBg, iconColor, label, value, valueSuffix, sub, subColor }: {
  icon: string; iconBg: string; iconColor: string;
  label: string; value: string; valueSuffix?: string;
  sub: string; subColor: string;
}) {
  return (
    <GlassCard style={s.statCard} glowColor="blue" elevated>
      <View style={s.statTopRow}>
        <View style={[s.statIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon as any} size={17} color={iconColor} />
        </View>
        <Text style={s.statLabel}>{label}</Text>
      </View>
      <Text style={s.statValue}>{value}<Text style={s.statSuffix}>{valueSuffix || ''}</Text></Text>
      <Text style={[s.statSub, { color: subColor }]}>{sub}</Text>
    </GlassCard>
  );
}

/* ═══ STYLES ═══ */
const s = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingBottom: 110 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, marginBottom: 12 },
  menuBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  notifBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.surface.card, borderWidth: 1, borderColor: Colors.border.subtle, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.accent.secondary, borderWidth: 1.5, borderColor: Colors.bg.primary },
  avatarRing: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarInner: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.bg.primary, alignItems: 'center', justifyContent: 'center' },

  // Hero
  heroWrap: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 },
  heroTextSide: { flex: 1, paddingRight: 10 },
  greeting: { fontSize: 13, fontWeight: '500', color: Colors.accent.primary, letterSpacing: 0.5, marginBottom: 4 },
  userName: { fontSize: 28, fontWeight: '800', color: Colors.text.primary, letterSpacing: -0.8, lineHeight: 34, marginBottom: 8 },
  heroSub: { fontSize: 13, color: Colors.text.tertiary, lineHeight: 19 },
  heroArt: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginTop: -15, marginRight: -10 },

  // CTA Card
  ctaOuter: { borderRadius: 20, overflow: 'hidden', marginBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 12 },
  ctaInner: { margin: 1.5, borderRadius: 18.5, overflow: 'hidden', position: 'relative' },
  ctaAtmosGlow: { position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: 75, opacity: 0.8 },
  ctaContent: { flexDirection: 'row', padding: 20, gap: 12 },
  ctaLeft: { flex: 1, justifyContent: 'center' },
  ctaTitle: { fontSize: 20, fontWeight: '600', color: Colors.text.primary, marginBottom: 8 },
  ctaDesc: { fontSize: 12, color: Colors.text.tertiary, lineHeight: 17, marginBottom: 16 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, alignSelf: 'flex-start' },
  ctaBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  ctaRight: { width: SW * 0.32, justifyContent: 'center' },
  xrayPreviewWrap: { flexDirection: 'row', borderRadius: 14, overflow: 'hidden', height: 130, backgroundColor: 'rgba(15,23,42,0.6)', borderWidth: 1, borderColor: Colors.border.subtle },
  xrayHalf: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  xrayPlaceholder: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(148,163,184,0.03)' },
  xrayDivider: { width: 2, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  xrayDividerLine: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  xrayCompareIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.bg.primary, borderWidth: 1, borderColor: Colors.border.medium, alignItems: 'center', justifyContent: 'center', zIndex: 6 },

  // Section headers
  secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  secTitle: { fontSize: 17, fontWeight: '600', color: Colors.text.primary, letterSpacing: -0.2 },
  seeAll: { fontSize: 13, fontWeight: '500', color: Colors.accent.primary },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: { flex: 1, paddingVertical: 14, paddingHorizontal: 12 },
  statTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  statIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 10, fontWeight: '600', color: Colors.text.tertiary, letterSpacing: 0.3 },
  statValue: { fontSize: 26, fontWeight: '800', color: Colors.text.primary, letterSpacing: -0.8, lineHeight: 30 },
  statSuffix: { fontSize: 14, fontWeight: '600' },
  statSub: { fontSize: 10, fontWeight: '500', marginTop: 4 },

  // Recent
  recentCard: { marginBottom: 10 },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recentThumb: { width: 54, height: 54, borderRadius: 12, backgroundColor: 'rgba(56,189,248,0.08)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.12)', alignItems: 'center', justifyContent: 'center' },
  recentInfo: { flex: 1 },
  recentName: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, marginBottom: 4 },
  recentMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5 },
  recentDate: { fontSize: 10, fontWeight: '500', color: Colors.text.quaternary },
  recentBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: Colors.accent.primaryDim, alignSelf: 'flex-start' },
  recentBadgeText: { fontSize: 9, fontWeight: '600', color: Colors.accent.primary },
  viewBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: Colors.border.accent },
  viewBtnText: { fontSize: 12, fontWeight: '600', color: Colors.accent.primary },

  // Empty
  emptyRecent: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  emptyRecentText: { fontSize: 12, color: Colors.text.tertiary, textAlign: 'center' },

  // Footer
  footer: { alignItems: 'center', paddingVertical: 16, marginTop: 12 },
  footerText: { fontSize: 11, color: Colors.text.quaternary, textAlign: 'center', lineHeight: 17 },
});
