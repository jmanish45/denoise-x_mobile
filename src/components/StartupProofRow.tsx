import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../theme';

interface StartupProofItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

interface StartupProofRowProps {
  items: StartupProofItem[];
}

export function StartupProofRow({ items }: StartupProofRowProps) {
  return (
    <View style={styles.row} accessible accessibilityLabel={items.map((item) => item.label).join(', ')}>
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.item}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={15} color={Colors.startup.tealBright} />
            </View>
            <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    minHeight: 62,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.startup.border,
    borderRadius: 16,
    backgroundColor: Colors.startup.surface,
  },
  item: { flex: 1, alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: Colors.startup.tealDim,
  },
  label: {
    ...Typography.captionSmall,
    fontSize: 9,
    color: Colors.startup.muted,
    textAlign: 'center',
  },
  divider: { width: 1, height: 30, backgroundColor: Colors.startup.border },
});
