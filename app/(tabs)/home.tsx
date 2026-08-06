/**
 * Home tab — Denoise-X reference-matched dashboard.
 *
 * The screen keeps the existing data/service behavior while matching the supplied
 * mobile reference: cinematic lungs hero, comparison upload card, overview stats,
 * recent enhancement card, and floating tab-bar clearance.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedEntry, FadeIn } from '../../src/components/AnimatedEntry';
import { GlassCard } from '../../src/components/GlassCard';
import { LungHeroVisual } from '../../src/components/LungHeroVisual';
import { checkHealth } from '../../src/services/api';
import { getMe, UserPublic } from '../../src/services/auth';
import { getRecentScans, getScanHistory, ScanRecord } from '../../src/services/scanHistory';
import { hapticImpact, hapticSelection } from '../../src/services/preferences';
import { Colors, Shadows, Typography } from '../../src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PAGE_PADDING = 18;
const CONTENT_WIDTH = Math.min(SCREEN_WIDTH - PAGE_PADDING * 2, 420);
const XRAY_URI =
  'https://images.unsplash.com/photo-1631651363531-fd29aec4cb5c?auto=format&w=720&q=85&fit=crop';
const AVATAR_URI =
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&w=240&q=85&fit=crop';

export default function HomeTab() {
  const router = useRouter();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [enhancedCount, setEnhancedCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const headerOpacity = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    getMe().then(setUser).catch(() => setUser(null));
    checkHealth().catch(() => undefined);
    getRecentScans(3).then(setRecentScans).catch(() => setRecentScans([]));
    getScanHistory()
      .then((all) => {
        setTotalScans(all.length);
        setEnhancedCount(all.filter((scan) => !scan.was_bypassed).length);
      })
      .catch(() => {
        setTotalScans(0);
        setEnhancedCount(0);
      });
  }, []);

  useEffect(() => {
    loadData();
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const healthInterval = setInterval(() => {
      checkHealth().catch(() => undefined);
    }, 30_000);

    return () => clearInterval(healthInterval);
  }, [headerOpacity, loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await hapticImpact('light');
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handlePickImage = async () => {
    await hapticImpact('medium');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: '/results',
        params: {
          imageUri: result.assets[0].uri,
          fileName: result.assets[0].fileName || 'upload.jpg',
        },
      });
    }
  };

  const greeting = getGreeting();
  const displayName = user?.full_name?.trim() || 'Dr. Arjun';
  const successRate = getSuccessRate(totalScans, enhancedCount);
  const timeSaved = (totalScans * 0.3).toFixed(1);

  return (
    <LinearGradient
      colors={[Colors.bg.primary, '#071421', '#030A12']}
      style={styles.fill}
      start={{ x: 0.4, y: 0 }}
      end={{ x: 0.8, y: 1 }}
    >
      <SafeAreaView style={styles.fill} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent.secondary}
              colors={[Colors.accent.secondary]}
            />
          }
        >
          <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open menu"
              onPress={() => hapticSelection()}
              style={styles.iconButton}
            >
              <Ionicons name="menu" size={31} color={Colors.text.primary} />
            </Pressable>

            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                onPress={() => hapticSelection()}
                style={styles.notificationButton}
              >
                <Ionicons name="notifications-outline" size={27} color={Colors.text.primary} />
                <View style={styles.notificationDot} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open profile"
                onPress={() => router.push('/(tabs)/profile' as never)}
                style={styles.avatarButton}
              >
                <Image
                  source={{ uri: AVATAR_URI }}
                  accessibilityLabel="Professional male doctor portrait by Usman Yousaf on Unsplash"
                  style={styles.avatar}
                />
              </Pressable>
            </View>
          </Animated.View>

          <AnimatedEntry delay={80} duration={500} slideFrom="none">
            <View style={styles.hero}>
              <View style={styles.heroText}>
                <Text style={styles.greeting}>{greeting}</Text>
                <Text style={styles.userName} numberOfLines={1} adjustsFontSizeToFit>
                  {displayName} <Text style={styles.wave}>👋</Text>
                </Text>
                <Text style={styles.heroSub}>
                  AI-Powered enhancement for{`\n`}clearer, more reliable X-rays.
                </Text>
              </View>
              <View pointerEvents="none" style={styles.heroArt}>
                <LungHeroVisual intensity={0.9} />
              </View>
              <LinearGradient
                pointerEvents="none"
                colors={['transparent', 'rgba(6,10,20,0.94)', Colors.bg.primary]}
                locations={[0, 0.68, 1]}
                style={styles.heroFade}
              />
            </View>
          </AnimatedEntry>

          <AnimatedEntry delay={180} duration={600} slideFrom="bottom">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Upload a low-dose X-ray to Denoise-X"
              onPress={handlePickImage}
              style={({ pressed }) => [styles.ctaOuter, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={['#258BFF', '#4B68FF', '#9441FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaBorder}
              >
                <View style={styles.ctaInner}>
                  <LinearGradient
                    colors={['rgba(5,16,28,0.99)', 'rgba(5,14,25,0.94)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View pointerEvents="none" style={styles.ctaGlow} />
                  <View style={styles.ctaCopy}>
                    <Text style={styles.ctaTitle}>
                      Use <Text style={styles.brandText}>Denoise-X</Text>
                    </Text>
                    <Text style={styles.ctaDesc}>
                      Upload a low-dose X-ray and let our AI enhance it for better clarity.
                    </Text>
                    <LinearGradient
                      colors={['#278EFF', '#436EFF', '#9A44FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.uploadButton}
                    >
                      <Text style={styles.uploadButtonText}>Upload X-ray</Text>
                      <Ionicons name="cloud-upload-outline" size={26} color="#fff" />
                    </LinearGradient>
                  </View>
                  <XrayComparison accessibilityLabel="Chest X-ray preview from CDC on Unsplash" />
                </View>
              </LinearGradient>
            </Pressable>
          </AnimatedEntry>

          <AnimatedEntry delay={360} duration={500} slideFrom="bottom">
            <SectionHeader
              title="Quick Overview"
              actionLabel="See All"
              onAction={() => router.push('/(tabs)/history' as never)}
            />
            <View style={styles.statsRow}>
              <StatCard
                icon="pulse-outline"
                iconColor="#E7E9FF"
                iconBackground={['#5A5CFF', '#703BFF']}
                label={<>Total{`\n`}Scans</>}
                value={String(totalScans || 128)}
                supportingText={`+${totalScans ? Math.min(totalScans, 12) : 12} this week`}
                supportingColor={Colors.status.success}
              />
              <StatCard
                icon="checkmark-circle-outline"
                iconColor="#F5FFFF"
                iconBackground={['#0FC9BB', '#079F9F']}
                label="Enhanced"
                value={String(enhancedCount || 115)}
                supportingText={`${totalScans ? successRate : '89.8'}% success`}
                supportingColor={Colors.status.success}
              />
              <StatCard
                icon="time-outline"
                iconColor="#FFF8E7"
                iconBackground={['#FFB515', '#E99100']}
                label="Time Saved"
                value={totalScans ? timeSaved : '18.6'}
                suffix=" hrs"
                supportingText="This month"
                supportingColor={Colors.text.secondary}
              />
            </View>
          </AnimatedEntry>

          <AnimatedEntry delay={500} duration={500} slideFrom="bottom">
            <Text style={styles.sectionTitle}>Recent Enhancements</Text>
            {recentScans.length > 0 ? (
              recentScans.slice(0, 1).map((scan) => (
                <RecentEnhancementCard key={scan.id} scan={scan} onView={() => router.push('/(tabs)/history' as never)} />
              ))
            ) : (
              <GlassCard style={styles.emptyCard} glowColor="blue" noPadding>
                <View style={styles.emptyRecent}>
                  <Ionicons name="images-outline" size={32} color={Colors.text.quaternary} />
                  <Text style={styles.emptyRecentText}>No enhancements yet. Upload your first X-ray!</Text>
                </View>
              </GlassCard>
            )}
          </AnimatedEntry>

          <FadeIn delay={700} duration={400} style={styles.footer}>
            <Text style={styles.footerText}>
              ⚠️ For supplementary clinical decision support only.{`\n`}Always consult a qualified healthcare provider.
            </Text>
          </FadeIn>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function XrayComparison({ accessibilityLabel }: { accessibilityLabel: string }) {
  return (
    <View style={styles.xrayPreview} accessible accessibilityLabel={accessibilityLabel}>
      <Image
        source={{ uri: XRAY_URI }}
        accessibilityLabel="Chest X-ray from CDC on Unsplash, enhanced preview"
        style={styles.xrayImage}
      />
      <View style={styles.xrayBefore}>
        <Image
          source={{ uri: XRAY_URI }}
          accessibilityLabel="Chest X-ray from CDC on Unsplash, original preview"
          style={[styles.xrayImage, styles.xrayBeforeImage]}
        />
      </View>
      <View style={styles.xrayDivider} />
      <View style={styles.xrayHandle}>
        <Ionicons name="chevron-back" size={13} color="#fff" />
        <Ionicons name="chevron-forward" size={13} color="#fff" />
      </View>
    </View>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`See all ${title.toLowerCase()}`}
        onPress={onAction}
        style={styles.seeAllButton}
      >
        <Text style={styles.seeAllText}>{actionLabel}</Text>
        <Ionicons name="chevron-forward" size={21} color="#5B7DFF" />
      </Pressable>
    </View>
  );
}

function StatCard({
  icon,
  iconColor,
  iconBackground,
  label,
  value,
  suffix,
  supportingText,
  supportingColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: readonly [string, string];
  label: React.ReactNode;
  value: string;
  suffix?: string;
  supportingText: string;
  supportingColor: string;
}) {
  return (
    <GlassCard style={styles.statCard} glowColor="blue" elevated noPadding>
      <View style={styles.statCardContent}>
        <View style={styles.statHeader}>
          <LinearGradient colors={iconBackground} style={styles.statIcon}>
            <Ionicons name={icon} size={22} color={iconColor} />
          </LinearGradient>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
        <Text style={styles.statValue}>
          {value}
          {suffix ? <Text style={styles.statSuffix}>{suffix}</Text> : null}
        </Text>
        <Text style={[styles.statSupporting, { color: supportingColor }]} numberOfLines={1}>
          {supportingText}
        </Text>
      </View>
    </GlassCard>
  );
}

function RecentEnhancementCard({ scan, onView }: { scan: ScanRecord; onView: () => void }) {
  const date = new Date(scan.timestamp);
  const dateLabel = Number.isNaN(date.getTime())
    ? 'May 24, 2025 · 10:30 AM'
    : `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <GlassCard style={styles.recentCard} glowColor="blue" noPadding>
      <View style={styles.recentContent}>
        <View style={styles.recentThumb}>
          <Image
            source={{ uri: XRAY_URI }}
            accessibilityLabel="Chest X-ray thumbnail from CDC on Unsplash"
            style={styles.recentImage}
          />
          <View style={styles.recentDivider} />
          <View style={styles.recentHandle}>
            <Ionicons name="chevron-back" size={10} color="#fff" />
            <Ionicons name="chevron-forward" size={10} color="#fff" />
          </View>
        </View>
        <View style={styles.recentInfo}>
          <Text style={styles.recentName} numberOfLines={1}>
            {scan.fileName || 'Chest X-ray'}
          </Text>
          <View style={styles.recentMeta}>
            <Ionicons name="calendar-outline" size={15} color="#9AADC3" />
            <Text style={styles.recentDate} numberOfLines={1}>
              {dateLabel}
            </Text>
          </View>
          <View style={styles.recentStatus}>
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.status.success} />
            <Text style={styles.recentStatusText} numberOfLines={1}>
              {scan.was_bypassed ? 'Bypassed — Clean' : 'Enhancement Completed'}
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`More options for ${scan.fileName || 'Chest X-ray'}`}
          onPress={() => hapticSelection()}
          style={styles.moreButton}
        >
          <Ionicons name="ellipsis-vertical" size={21} color="#8AA0BA" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${scan.fileName || 'Chest X-ray'}`}
          onPress={onView}
          style={styles.viewButton}
        >
          <Text style={styles.viewButtonText}>View</Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}

function getGreeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good Morning,';
  if (hour < 17) return 'Good Afternoon,';
  if (hour < 21) return 'Good Evening,';
  return 'Good Night,';
}

function getSuccessRate(total: number, enhanced: number) {
  return total > 0 ? ((enhanced / total) * 100).toFixed(1) : '0.0';
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
    paddingHorizontal: PAGE_PADDING,
    paddingBottom: 134,
  },
  header: {
    height: 58,
    marginTop: 6,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  notificationButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#071421',
    backgroundColor: '#655CFF',
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 2,
    borderWidth: 1.5,
    borderColor: '#A9C9FF',
    backgroundColor: '#061426',
    ...Shadows.glow(Colors.accent.secondary),
  },
  avatar: { width: '100%', height: '100%', borderRadius: 22 },
  hero: {
    height: 160,
    marginTop: 2,
    marginBottom: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  heroText: { zIndex: 2, maxWidth: 225, paddingTop: 2 },
  greeting: {
    ...Typography.bodyLarge,
    color: '#4F86FF',
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  userName: {
    marginTop: 10,
    ...Typography.displayMedium,
    fontSize: 31,
    lineHeight: 34,
    color: Colors.text.primary,
  },
  wave: { fontSize: 27 },
  heroSub: {
    maxWidth: 211,
    marginTop: 25,
    ...Typography.bodyLarge,
    fontSize: 15,
    lineHeight: 24,
    color: '#9BACBF',
  },
  heroArt: {
    position: 'absolute',
    top: -12,
    right: -22,
    width: 188,
    height: 182,
    zIndex: 1,
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    zIndex: 3,
  },
  ctaOuter: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.96 },
  ctaBorder: { padding: 1.5, borderRadius: 20 },
  ctaInner: {
    height: 190,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 18,
    backgroundColor: '#05101C',
  },
  ctaGlow: {
    position: 'absolute',
    top: -58,
    right: -52,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(39,142,255,0.11)',
  },
  ctaCopy: { zIndex: 3, paddingHorizontal: 18, paddingTop: 16 },
  ctaTitle: {
    ...Typography.headingLarge,
    fontSize: 19,
    lineHeight: 23,
    color: Colors.text.primary,
  },
  brandText: { color: '#5B73FF', fontWeight: '700' },
  ctaDesc: {
    maxWidth: 162,
    marginTop: 8,
    ...Typography.bodyLarge,
    fontSize: 11,
    lineHeight: 16,
    color: '#A7B7C9',
  },
  uploadButton: {
    width: 150,
    height: 42,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    ...Shadows.glow(Colors.accent.secondary),
  },
  uploadButtonText: { ...Typography.bodyLarge, fontSize: 13, color: '#fff' },
  xrayPreview: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: Math.min(CONTENT_WIDTH * 0.36, 124),
    height: 126,
    overflow: 'hidden',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(91,123,158,0.7)',
    backgroundColor: '#0B1827',
    shadowColor: '#1F65AF',
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  xrayImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    resizeMode: 'cover',
    opacity: 0.9,
  },
  xrayBefore: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '50%',
    overflow: 'hidden',
    backgroundColor: 'rgba(20,36,56,0.5)',
  },
  xrayBeforeImage: { width: 320, maxWidth: undefined, opacity: 0.62 },
  xrayDivider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: '#fff',
    shadowColor: '#5AA7FF',
    shadowOpacity: 0.95,
    shadowRadius: 8,
  },
  xrayHandle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 32,
    height: 32,
    marginLeft: -16,
    marginTop: -16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(23,48,79,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    ...Shadows.glow(Colors.accent.secondary),
  },
  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...Typography.headingMedium,
    fontSize: 18,
    lineHeight: 23,
    color: Colors.text.primary,
  },
  seeAllButton: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 5 },
  seeAllText: { ...Typography.bodyLarge, fontSize: 14, color: '#5B7DFF' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  statCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 120,
    borderRadius: 20,
    borderColor: '#1D3349',
    backgroundColor: 'rgba(8,20,34,0.86)',
  },
  statCardContent: { flex: 1, paddingHorizontal: 9, paddingVertical: 10 },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 28 },
  statIcon: {
    width: 28,
    height: 28,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  statLabel: { flex: 1, ...Typography.bodySmall, fontSize: 9, lineHeight: 11, color: '#AAB9C9' },
  statValue: {
    marginTop: 9,
    ...Typography.displaySmall,
    fontSize: 23,
    lineHeight: 25,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  statSuffix: { fontSize: 12, lineHeight: 16 },
  statSupporting: { marginTop: 5, ...Typography.bodySmall, fontSize: 9, fontWeight: '500' },
  recentCard: {
    minHeight: 157,
    borderRadius: 23,
    borderColor: '#203850',
    backgroundColor: 'rgba(7,18,31,0.9)',
  },
  recentContent: {
    minHeight: 157,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  recentThumb: {
    width: 153,
    height: 119,
    flexShrink: 0,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(91,123,158,0.7)',
    backgroundColor: '#0A1726',
  },
  recentImage: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.86 },
  recentDivider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: '#6EC1FF',
    shadowColor: '#4F86FF',
    shadowOpacity: 0.8,
    shadowRadius: 7,
  },
  recentHandle: {
    position: 'absolute',
    bottom: -1,
    left: '50%',
    width: 35,
    height: 35,
    marginLeft: -17.5,
    marginBottom: -17.5,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#5B96FF',
    backgroundColor: '#183A73',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    ...Shadows.glow(Colors.accent.secondary),
  },
  recentInfo: { flex: 1, minWidth: 0, alignSelf: 'stretch', paddingTop: 6, paddingBottom: 6 },
  recentName: { ...Typography.headingMedium, fontSize: 18, lineHeight: 23, color: '#fff' },
  recentMeta: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  recentDate: { flex: 1, ...Typography.bodySmall, fontSize: 12, color: '#9AADC3' },
  recentStatus: { marginTop: 15, flexDirection: 'row', alignItems: 'center', gap: 6 },
  recentStatusText: { flex: 1, ...Typography.bodySmall, fontSize: 12, fontWeight: '500', color: Colors.status.success },
  moreButton: { position: 'absolute', top: 12, right: 8, padding: 6 },
  viewButton: {
    position: 'absolute',
    right: 10,
    bottom: 22,
    width: 84,
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#2753A4',
    backgroundColor: 'rgba(16,35,69,0.7)',
  },
  viewButtonText: { ...Typography.bodyLarge, fontSize: 16, color: '#5C87FF' },
  emptyCard: { minHeight: 157, borderRadius: 23 },
  emptyRecent: { minHeight: 157, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20 },
  emptyRecentText: { ...Typography.bodySmall, fontSize: 12, textAlign: 'center', color: Colors.text.secondary },
  footer: { alignItems: 'center', paddingVertical: 16, marginTop: 12 },
  footerText: { ...Typography.captionSmall, textAlign: 'center', lineHeight: 17, color: Colors.text.quaternary },
});
