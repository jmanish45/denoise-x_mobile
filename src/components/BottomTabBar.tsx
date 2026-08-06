/**
 * Floating five-destination navigation dock used by the tab navigator.
 * The center Denoise-X action intentionally rises above the glass surface.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { hapticImpact } from '../services/preferences';
import { BorderRadius, Colors, Typography } from '../theme';
import { createPulseLoop } from '../theme/animations';

interface TabItem {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  isCenter?: boolean;
}

const TABS: TabItem[] = [
  { name: 'home', label: 'Home', icon: 'home-outline', iconFocused: 'home' },
  { name: 'history', label: 'History', icon: 'time-outline', iconFocused: 'time' },
  { name: 'denoise', label: 'Denoise-X', icon: 'sparkles-outline', iconFocused: 'sparkles', isCenter: true },
  { name: 'feedback', label: 'Feedback', icon: 'chatbubble-outline', iconFocused: 'chatbubble' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', iconFocused: 'person' },
];

interface BottomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = createPulseLoop(pulseAnim, 2500);
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] });
  const centerRoute = state.routes.find((route: any) => TABS.find((tab) => tab.name === route.name)?.isCenter);
  const centerRouteIndex = state.routes.findIndex((route: any) => route.key === centerRoute?.key);

  const emitTabPress = (route: any, index: number) => {
    hapticImpact('light');
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (state.index !== index && !event.defaultPrevented) navigation.navigate(route.name);
  };

  const onCenterPress = () => {
    hapticImpact('light');
    const event = navigation.emit({ type: 'tabPress', target: centerRoute?.key, canPreventDefault: true });
    if (state.index !== centerRouteIndex && !event.defaultPrevented) navigation.navigate(centerRoute?.name);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <LinearGradient colors={['rgba(59,130,246,0.08)', 'transparent']} style={styles.topGlow} />
        <View style={styles.innerBar}>
          {state.routes.map((route: any, index: number) => {
            const tabMeta = TABS.find((tab) => tab.name === route.name) || TABS[index];
            if (!tabMeta) return null;

            if (tabMeta.isCenter) return <View key={route.key} style={styles.centerSlot} />;

            const isFocused = state.index === index;
            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={tabMeta.label}
                onPress={() => emitTabPress(route, index)}
                style={[styles.tab, isFocused && styles.activeTab]}
              >
                <Ionicons
                  name={isFocused ? tabMeta.iconFocused : tabMeta.icon}
                  size={27}
                  color={isFocused ? '#5F96FF' : '#8295AB'}
                />
                <Text style={[styles.tabLabel, { color: isFocused ? '#5F96FF' : '#8295AB' }]}>
                  {tabMeta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>

      {centerRoute ? (
        <View style={styles.absoluteCenterWrapper} pointerEvents="box-none">
          <View style={styles.centerWrapper}>
            <Animated.View style={[styles.centerGlow, { transform: [{ scale: pulseScale }], opacity: pulseOpacity }]} />
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel="Denoise-X"
              accessibilityState={{ selected: state.index === centerRouteIndex }}
              onPress={onCenterPress}
              style={styles.centerButton}
            >
              <LinearGradient
                colors={['#108DFF', '#3D62FF', '#5320D7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.centerGradient}
              >
                <Ionicons name="sparkles" size={30} color="#fff" />
              </LinearGradient>
            </Pressable>
            <Text style={styles.centerLabel}>Denoise-X</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const TAB_BAR_HEIGHT = 85;
const CENTER_SIZE = 70;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  blur: {
    height: TAB_BAR_HEIGHT,
    overflow: 'hidden',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#1C334A',
    backgroundColor: 'rgba(12,28,45,0.92)',
  },
  topGlow: { position: 'absolute', top: 0, right: 0, left: 0, height: 2 },
  innerBar: {
    height: '100%',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(12,28,45,0.72)',
  },
  tab: {
    flex: 1,
    height: 61,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 19,
  },
  activeTab: { backgroundColor: '#102D5C' },
  centerSlot: { flex: 1 },
  tabLabel: { ...Typography.bodySmall, fontSize: 12, lineHeight: 16 },
  absoluteCenterWrapper: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    left: 16,
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centerWrapper: { alignItems: 'center', justifyContent: 'center', marginTop: -38 },
  centerGlow: {
    position: 'absolute',
    width: CENTER_SIZE + 28,
    height: CENTER_SIZE + 28,
    borderRadius: (CENTER_SIZE + 28) / 2,
    backgroundColor: 'rgba(49,116,255,0.42)',
  },
  centerButton: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    overflow: 'hidden',
    borderRadius: CENTER_SIZE / 2,
    borderWidth: 1,
    borderColor: 'rgba(169,201,255,0.32)',
    shadowColor: '#3174FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.75,
    shadowRadius: 18,
    elevation: 20,
  },
  centerGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerLabel: { ...Typography.bodySmall, marginTop: 5, fontSize: 12, color: '#D9E5F5' },
});
