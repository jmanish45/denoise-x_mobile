/**
 * BottomTabBar.tsx — Premium Floating Dock Navigation
 * =====================================================
 * Cinematic glassmorphic floating bar matching the reference:
 * elevated center button with sparkle icon, active pill states.
 */

import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { createPulseLoop } from '../theme/animations';

const { width: SCREEN_W } = Dimensions.get('window');

interface TabItem {
  name: string;
  label: string;
  icon: string;
  iconFocused: string;
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

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    createPulseLoop(pulseAnim, 2500).start();
  }, []);

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] });

  const centerRoute = state.routes.find((r: any) => TABS.find(t => t.name === r.name)?.isCenter);
  const centerRouteIndex = state.routes.findIndex((r: any) => r.key === centerRoute?.key);

  const onCenterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const event = navigation.emit({
      type: 'tabPress',
      target: centerRoute?.key,
      canPreventDefault: true,
    });
    if (state.index !== centerRouteIndex && !event.defaultPrevented) {
      navigation.navigate(centerRoute?.name);
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        {/* Top edge glow */}
        <LinearGradient
          colors={['rgba(59,130,246,0.08)', 'transparent']}
          style={styles.topGlow}
        />
        <View style={styles.innerBar}>
          {state.routes.map((route: any, index: number) => {
            const tabMeta = TABS.find((t) => t.name === route.name) || TABS[index];
            if (!tabMeta) return null;

            const isFocused = state.index === index;
            const isCenter = tabMeta.isCenter;

            const onPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            if (isCenter) {
              return <View key={route.key} style={{ flex: 1 }} />;
            }

            return (
              <Pressable key={route.key} onPress={onPress} style={styles.tab}>
                <Ionicons
                  name={(isFocused ? tabMeta.iconFocused : tabMeta.icon) as any}
                  size={21}
                  color={isFocused ? Colors.accent.secondary : Colors.tabBar.inactive}
                />
                <Text style={[styles.tabLabel, { color: isFocused ? Colors.accent.secondary : Colors.tabBar.inactive }]}>
                  {tabMeta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>

      {/* Floating Center Button */}
      {centerRoute && (
        <View style={styles.absoluteCenterWrapper} pointerEvents="box-none">
          <View style={styles.centerWrapper}>
            <Animated.View
              style={[styles.centerGlow, { transform: [{ scale: pulseScale }], opacity: pulseOpacity }]}
            />
            <Pressable onPress={onCenterPress} style={styles.centerBtn}>
              <LinearGradient
                colors={['#4F8EF7', '#6C63FF', Colors.accent.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.centerGradient}
              >
                <Ionicons name="sparkles" size={26} color="#fff" />
              </LinearGradient>
            </Pressable>
            <Text style={styles.centerLabel}>Denoise-X</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const TAB_BAR_HEIGHT = 68;
const CENTER_SIZE = 58;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingBottom: 18,
  },
  blur: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.08)',
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 1,
  },
  innerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: TAB_BAR_HEIGHT,
    backgroundColor: 'rgba(6,10,20,0.88)',
    paddingHorizontal: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  absoluteCenterWrapper: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  centerGlow: {
    position: 'absolute',
    width: CENTER_SIZE + 26,
    height: CENTER_SIZE + 26,
    borderRadius: (CENTER_SIZE + 26) / 2,
    backgroundColor: 'rgba(79,142,247,0.35)',
  },
  centerBtn: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#4F8EF7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  centerGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.accent.secondary,
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
