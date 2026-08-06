import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../theme';

interface StartupBrandMarkProps {
  compact?: boolean;
  showLabel?: boolean;
}

export function StartupBrandMark({ compact = false, showLabel = true }: StartupBrandMarkProps) {
  const size = compact ? 36 : 58;
  const iconSize = compact ? 18 : 28;

  return (
    <View style={styles.group} accessible accessibilityLabel="Denoise X clinical AI">
      <View
        style={[styles.mark, { width: size, height: size, borderRadius: compact ? 12 : 18 }]}
      >
        <View style={styles.markInner}>
          <Ionicons name="scan-outline" size={iconSize} color={Colors.startup.tealBright} />
        </View>
      </View>
      {showLabel ? (
        <View style={styles.copy}>
          <Text style={[styles.brand, compact && styles.brandCompact]}>DENOISE-X</Text>
          <Text style={styles.kicker}>CLINICAL AI</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: {
    padding: 1,
    backgroundColor: Colors.startup.teal,
    shadowColor: Colors.startup.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.34,
    shadowRadius: 16,
    elevation: 8,
  },
  markInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: Colors.startup.bgRaised,
  },
  copy: { gap: 2 },
  brand: {
    ...Typography.labelLarge,
    fontSize: 14,
    letterSpacing: 1.7,
    color: Colors.startup.text,
  },
  brandCompact: { fontSize: 12, letterSpacing: 1.3 },
  kicker: {
    ...Typography.captionSmall,
    fontSize: 8,
    letterSpacing: 1.5,
    color: Colors.startup.tealBright,
  },
});
