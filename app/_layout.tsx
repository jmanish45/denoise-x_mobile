/**
 * _layout.tsx — Root Layout
 * ===========================
 * AuthProvider + Stack navigator.
 * Global route guard: unauthenticated users are sent to /welcome,
 * authenticated users on welcome/auth/index are sent to (tabs)/home.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../src/theme';
import { AuthProvider, useAuth } from '../src/services/AuthContext';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const [appReady, setAppReady] = useState(false);
  const { loggedIn, refreshAuth } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function prepare() {
      try { await refreshAuth(); } catch {}
      finally { setAppReady(true); }
    }
    prepare();
  }, []);

  // Global route guard
  useEffect(() => {
    if (!appReady) return;

    const firstSeg = segments[0];
    const inAuthGroup = firstSeg === '(auth)';
    const isPublic = firstSeg === 'welcome' || firstSeg === 'onboarding';
    const isIndex = firstSeg === 'index' || firstSeg === undefined;

    if (!loggedIn) {
      // If unauthenticated and on index or protected route -> welcome
      if (isIndex || (!inAuthGroup && !isPublic)) {
        router.replace('/welcome');
      }
    } else {
      // If authenticated and on public/auth/index route -> home
      if (inAuthGroup || isPublic || isIndex) {
        router.replace('/(tabs)/home');
      }
    }
  }, [loggedIn, appReady, segments]);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) await SplashScreen.hideAsync();
  }, [appReady]);

  if (!appReady) return null;

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar style="light" backgroundColor={Colors.bg.primary} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg.primary },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="onboarding" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="camera" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="results" options={{ animation: 'fade_from_bottom' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
});
