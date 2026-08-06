import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../theme';

interface PreferenceSwitchRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: () => void;
}

export function PreferenceSwitchRow({
  icon,
  label,
  description,
  value,
  disabled = false,
  onValueChange,
}: PreferenceSwitchRowProps) {
  return (
    <View style={[styles.row, disabled && styles.disabled]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={Colors.text.tertiary} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description} numberOfLines={1}>{description}</Text>
      </View>
      <Switch
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityHint={description}
        accessibilityState={{ checked: value, disabled }}
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: '#26384D', true: 'rgba(59,130,246,0.55)' }}
        thumbColor={value ? '#8CB5FF' : '#8394A8'}
        ios_backgroundColor="#26384D"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
  disabled: { opacity: 0.55 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148,163,184,0.06)',
  },
  copy: { flex: 1, minWidth: 0 },
  label: { ...Typography.bodyMedium, color: Colors.text.primary },
  description: { ...Typography.captionSmall, marginTop: 2, color: Colors.text.tertiary },
});
