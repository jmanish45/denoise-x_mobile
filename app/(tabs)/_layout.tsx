/**
 * (tabs)/_layout.tsx — Tab Navigator
 * ====================================
 * Premium bottom tab navigation with custom BottomTabBar.
 * 5 tabs: Home, History, Denoise (center CTA), Feedback, Profile.
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { BottomTabBar } from '../../src/components/BottomTabBar';
import { Colors } from '../../src/theme';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // We use custom tab bar
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="denoise" options={{ title: 'Denoise' }} />
      <Tabs.Screen name="feedback" options={{ title: 'Feedback' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
