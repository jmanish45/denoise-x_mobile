/**
 * (tabs)/history.tsx — Premium Scan History Timeline
 * ====================================================
 * Cinematic timeline with X-ray thumbnails, glowing date groups,
 * expandable details, and atmospheric depth.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, RefreshControl, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { AnimatedEntry, FadeIn } from '../../src/components/AnimatedEntry';
import { getScanHistory, deleteScanRecord, clearScanHistory, ScanRecord } from '../../src/services/scanHistory';

export default function HistoryTab() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadHistory = useCallback(async () => { setScans(await getScanHistory()); }, []);
  useEffect(() => { loadHistory(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  const handleDelete = (id: string, fileName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Delete Scan', `Remove "${fileName}" from history?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteScanRecord(id); await loadHistory(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } },
    ]);
  };

  const handleClearAll = () => {
    if (scans.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Clear All History', 'This will remove all scan records. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: async () => { await clearScanHistory(); setScans([]); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } },
    ]);
  };

  const grouped = scans.reduce<Record<string, ScanRecord[]>>((acc, scan) => {
    const date = new Date(scan.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(scan);
    return acc;
  }, {});

  return (
    <LinearGradient colors={[Colors.bg.primary, '#080E1E', Colors.bg.primary]} style={s.fill}>
      <SafeAreaView style={s.fill} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent.primary} colors={[Colors.accent.primary]} />}>

          <FadeIn duration={400} style={s.header}>
            <View>
              <Text style={s.headerTitle}>Scan History</Text>
              <Text style={s.headerSub}>{scans.length} total scan{scans.length !== 1 ? 's' : ''}</Text>
            </View>
            {scans.length > 0 && (
              <Pressable onPress={handleClearAll} style={s.clearBtn}>
                <Ionicons name="trash-outline" size={17} color={Colors.status.error} />
              </Pressable>
            )}
          </FadeIn>

          {scans.length === 0 && (
            <AnimatedEntry delay={300} duration={600} style={s.emptyState}>
              <View style={s.emptyIcon}>
                <Ionicons name="time-outline" size={52} color={Colors.text.quaternary} />
              </View>
              <Text style={s.emptyTitle}>No scans yet</Text>
              <Text style={s.emptyDesc}>Your X-Ray enhancement history will appear here after your first scan.</Text>
            </AnimatedEntry>
          )}

          {Object.entries(grouped).map(([date, dateScans], gi) => (
            <AnimatedEntry key={date} delay={200 + gi * 80} duration={500} style={s.dateGroup}>
              <View style={s.dateHeader}>
                <View style={s.dateDot} />
                <Text style={s.dateText}>{date}</Text>
              </View>
              {/* Timeline line */}
              <View style={s.timelineLine} />

              {dateScans.map((scan) => {
                const isExp = expandedId === scan.id;
                return (
                  <Pressable key={scan.id} onPress={() => { Haptics.selectionAsync(); setExpandedId(isExp ? null : scan.id); }}>
                    <GlassCard style={s.scanCard} glowColor="blue">
                      <View style={s.scanRow}>
                        <View style={[s.scanThumb, { backgroundColor: scan.was_bypassed ? Colors.accent.secondaryDim : Colors.accent.primaryDim }]}>
                          <Ionicons name={scan.was_bypassed ? 'shield-checkmark' : 'flash'} size={18} color={scan.was_bypassed ? Colors.accent.secondary : Colors.accent.primary} />
                        </View>
                        <View style={s.scanInfo}>
                          <Text style={s.scanName} numberOfLines={1}>{scan.fileName}</Text>
                          <Text style={s.scanTime}>{new Date(scan.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                        <View style={[s.scanBadge, { backgroundColor: scan.was_bypassed ? Colors.accent.secondaryDim : Colors.accent.primaryDim }]}>
                          <Text style={[s.scanBadgeText, { color: scan.was_bypassed ? Colors.accent.secondary : Colors.accent.primary }]}>
                            {scan.was_bypassed ? 'Bypassed' : 'Enhanced'}
                          </Text>
                        </View>
                        <Ionicons name={isExp ? 'chevron-up' : 'chevron-down'} size={15} color={Colors.text.tertiary} />
                      </View>
                      {isExp && (
                        <View style={s.expanded}>
                          <View style={s.expDivider} />
                          <View style={s.expGrid}>
                            <View style={s.expStat}><Text style={s.expLabel}>Resolution</Text><Text style={s.expVal}>{scan.width}×{scan.height}</Text></View>
                            <View style={s.expStat}><Text style={s.expLabel}>Noise σ²</Text><Text style={s.expVal}>{scan.noise_variance.toFixed(2)}</Text></View>
                            <View style={s.expStat}><Text style={s.expLabel}>Time</Text><Text style={s.expVal}>{scan.processing_time_ms.toFixed(0)}ms</Text></View>
                          </View>
                          <Text style={s.routingMsg}>{scan.routing_message}</Text>
                          <Pressable onPress={() => handleDelete(scan.id, scan.fileName)} style={s.deleteBtn}>
                            <Ionicons name="trash-outline" size={13} color={Colors.status.error} />
                            <Text style={s.deleteText}>Remove</Text>
                          </Pressable>
                        </View>
                      )}
                    </GlassCard>
                  </Pressable>
                );
              })}
            </AnimatedEntry>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingBottom: 110 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.text.primary, letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: Colors.text.tertiary, marginTop: 3 },
  clearBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.status.errorDim, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingTop: 64, gap: 14 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.surface.card, borderWidth: 1, borderColor: Colors.border.subtle, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: Colors.text.secondary },
  emptyDesc: { fontSize: 13, color: Colors.text.tertiary, textAlign: 'center', maxWidth: 260 },
  dateGroup: { marginBottom: 22, paddingLeft: 14 },
  dateHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  dateDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent.cyan, borderWidth: 2, borderColor: Colors.bg.primary },
  dateText: { fontSize: 12, fontWeight: '600', color: Colors.text.tertiary, letterSpacing: 0.3 },
  timelineLine: { position: 'absolute', top: 22, bottom: 0, left: 18, width: 1, backgroundColor: Colors.border.subtle },
  scanCard: { marginBottom: 10 },
  scanRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scanThumb: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  scanInfo: { flex: 1 },
  scanName: { fontSize: 13, fontWeight: '600', color: Colors.text.primary },
  scanTime: { fontSize: 11, color: Colors.text.tertiary, marginTop: 2 },
  scanBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  scanBadgeText: { fontSize: 9, fontWeight: '600' },
  expanded: { marginTop: 12 },
  expDivider: { height: 1, backgroundColor: Colors.border.subtle, marginBottom: 12 },
  expGrid: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  expStat: { flex: 1, alignItems: 'center' },
  expLabel: { fontSize: 9, fontWeight: '600', color: Colors.text.tertiary, marginBottom: 3, letterSpacing: 0.3 },
  expVal: { fontSize: 13, fontWeight: '600', color: Colors.text.primary },
  routingMsg: { fontSize: 12, color: Colors.text.secondary, marginBottom: 12, lineHeight: 17 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.status.errorDim },
  deleteText: { fontSize: 10, fontWeight: '600', color: Colors.status.error },
});
