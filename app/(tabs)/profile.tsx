/**
 * (tabs)/profile.tsx — Premium Cinematic Profile
 * =================================================
 * Gradient avatar ring, atmospheric depth, premium stats,
 * clean settings sections, and cinematic sign-out.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { AnimatedEntry, FadeIn } from '../../src/components/AnimatedEntry';
import { getMe, signOut, UserPublic, PROFESSIONAL_ROLE_LABELS } from '../../src/services/auth';
import { useAuth } from '../../src/services/AuthContext';
import { getScanCount } from '../../src/services/scanHistory';

export default function ProfileTab() {
  const router = useRouter();
  const { setLoggedIn } = useAuth();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    getMe().then(setUser).catch(() => {});
    getScanCount().then(setScanCount);
  }, []);

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); setLoggedIn(false); router.replace('/welcome'); } },
    ]);
  };

  const roleLabel = user?.profile_type
    ? (PROFESSIONAL_ROLE_LABELS as Record<string, string>)[user.profile_type] || user.profile_type
    : 'Medical Professional';

  return (
    <LinearGradient colors={[Colors.bg.primary, '#080E1E', Colors.bg.primary]} style={s.fill}>
      <SafeAreaView style={s.fill} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <FadeIn duration={400} style={s.header}>
            <Text style={s.headerTitle}>Profile</Text>
          </FadeIn>

          {/* Avatar + Name */}
          <AnimatedEntry delay={200} duration={500}>
            <GlassCard accentBorder glowColor="teal" elevated style={s.profileCard}>
              <View style={s.avatarSection}>
                <LinearGradient colors={[Colors.accent.primary, Colors.accent.secondary]} style={s.avatarRing}>
                  <View style={s.avatarInner}>
                    <Text style={s.avatarLetter}>{user?.full_name?.charAt(0)?.toUpperCase() || 'D'}</Text>
                  </View>
                </LinearGradient>
                <View style={s.nameArea}>
                  <Text style={s.nameText}>{user?.full_name || 'Doctor'}</Text>
                  <Text style={s.roleText}>{roleLabel}</Text>
                </View>
              </View>
              <View style={s.statsRow}>
                <View style={s.statItem}>
                  <Text style={s.statNum}>{scanCount}</Text>
                  <Text style={s.statLabel}>Scans</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                  <Text style={s.statNum}>v1.0</Text>
                  <Text style={s.statLabel}>Version</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                  <Ionicons name="shield-checkmark" size={18} color={Colors.status.success} />
                  <Text style={s.statLabel}>Verified</Text>
                </View>
              </View>
            </GlassCard>
          </AnimatedEntry>

          {/* Account */}
          <AnimatedEntry delay={350} duration={500}>
            <Text style={s.secTitle}>Account</Text>
            <GlassCard glowColor="blue">
              <SettingsRow icon="mail-outline" label="Email" value={user?.email || '—'} />
              <View style={s.divider} />
              <SettingsRow icon="briefcase-outline" label="Role" value={roleLabel} />
              {user?.college_name && (<><View style={s.divider} /><SettingsRow icon="school-outline" label="Institution" value={user.college_name} /></>)}
            </GlassCard>
          </AnimatedEntry>

          {/* Preferences */}
          <AnimatedEntry delay={500} duration={500}>
            <Text style={s.secTitle}>Preferences</Text>
            <GlassCard glowColor="cyan">
              <SettingsRow icon="hand-left-outline" label="Haptic Feedback" value="On" />
            </GlassCard>
          </AnimatedEntry>

          {/* About */}
          <AnimatedEntry delay={650} duration={500}>
            <Text style={s.secTitle}>About</Text>
            <GlassCard>
              <SettingsRow icon="information-circle-outline" label="App Version" value="1.0.0" />
              <View style={s.divider} />
              <SettingsRow icon="code-slash-outline" label="AI Model" value="Noise2Noise U-Net" />
            </GlassCard>
          </AnimatedEntry>

          {/* Logout */}
          <AnimatedEntry delay={800} duration={500}>
            <Pressable onPress={handleLogout} style={s.logoutBtn}>
              <Ionicons name="log-out-outline" size={19} color={Colors.status.error} />
              <Text style={s.logoutText}>Sign Out</Text>
            </Pressable>
          </AnimatedEntry>

          <FadeIn delay={900} duration={400} style={s.footer}>
            <Text style={s.footerText}>Denoise X • Built with ❤️ for medical professionals</Text>
          </FadeIn>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SettingsRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={s.settingsRow}>
      <View style={s.settingsIconWrap}>
        <Ionicons name={icon as any} size={18} color={Colors.text.tertiary} />
      </View>
      <Text style={s.settingsLabel}>{label}</Text>
      <Text style={s.settingsValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingBottom: 110 },
  header: { marginTop: 10, marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.text.primary, letterSpacing: -0.5 },
  profileCard: { marginBottom: 24 },
  avatarSection: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatarRing: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  avatarInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.bg.primary, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 24, fontWeight: '700', color: Colors.accent.primary },
  nameArea: { flex: 1 },
  nameText: { fontSize: 20, fontWeight: '600', color: Colors.text.primary, letterSpacing: -0.3 },
  roleText: { fontSize: 12, color: Colors.text.tertiary, marginTop: 3 },
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border.subtle },
  statItem: { flex: 1, alignItems: 'center', gap: 5 },
  statNum: { fontSize: 17, fontWeight: '600', color: Colors.text.primary },
  statLabel: { fontSize: 10, fontWeight: '600', color: Colors.text.tertiary, letterSpacing: 0.3 },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.border.subtle },
  secTitle: { fontSize: 10, fontWeight: '700', color: Colors.text.tertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  settingsIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(148,163,184,0.06)', alignItems: 'center', justifyContent: 'center' },
  settingsLabel: { fontSize: 14, color: Colors.text.secondary, flex: 1 },
  settingsValue: { fontSize: 13, fontWeight: '600', color: Colors.text.primary, maxWidth: 160, textAlign: 'right' },
  divider: { height: 1, backgroundColor: Colors.border.subtle, marginVertical: 8 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, backgroundColor: Colors.status.errorDim, borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)', marginTop: 20 },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.status.error },
  footer: { alignItems: 'center', paddingVertical: 22 },
  footerText: { fontSize: 11, color: Colors.text.quaternary, textAlign: 'center' },
});
