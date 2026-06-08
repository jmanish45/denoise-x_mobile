/**
 * signin.tsx — Sign In Screen
 * ==============================
 * Premium dark login with glass inputs and animated transitions.
 */

import React, { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView, KeyboardAvoidingView,
  Platform, Pressable, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/theme';
import { GlassInput } from '../../src/components/GlassInput';
import { GradientButton } from '../../src/components/GradientButton';
import { GlassCard } from '../../src/components/GlassCard';
import { AnimatedEntry } from '../../src/components/AnimatedEntry';
import { signIn, googleAuth, saveToken } from '../../src/services/auth';
import { useAuth } from '../../src/services/AuthContext';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const router = useRouter();
  const { setLoggedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '361903633441-nuao6pddfs3aob5mqn6mctju175887rs.apps.googleusercontent.com',
    androidClientId: '361903633441-nuao6pddfs3aob5mqn6mctju175887rs.apps.googleusercontent.com',
    iosClientId: '361903633441-nuao6pddfs3aob5mqn6mctju175887rs.apps.googleusercontent.com',
    redirectUri: 'https://auth.expo.io', // Force use of Expo proxy for web client ID
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleSignIn(id_token);
      }
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await googleAuth(idToken);
      saveToken(res.token);
      setLoggedIn(true);
      if (!res.profile_complete) {
        // If profile isn't complete, we should navigate them to complete it
        // For now, signin them and they will be prompted on next steps or we let them in
      }
      router.replace('/(tabs)/home');
    } catch (e: any) {
      setError(e.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setError('');
    if (!email.trim() || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      await signIn({ email: email.trim().toLowerCase(), password });
      setLoggedIn(true);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      setError(e.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[Colors.bg.primary, '#0D1321']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
            </Pressable>

            <AnimatedEntry delay={200} duration={600}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to continue your X-Ray analysis</Text>
            </AnimatedEntry>

            <AnimatedEntry delay={400} duration={600} style={styles.form}>
              <GlassInput label="Email" placeholder="your@email.com" icon="mail-outline" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <GlassInput label="Password" placeholder="Enter your password" icon="lock-closed-outline" value={password} onChangeText={setPassword} secureTextEntry />
              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={Colors.status.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              <GradientButton title="Sign In" onPress={handleSignIn} loading={loading} style={{ marginTop: Spacing.lg }} />
            </AnimatedEntry>

            <AnimatedEntry delay={600} duration={600} style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </AnimatedEntry>

            <AnimatedEntry delay={700} duration={600}>
              <GlassCard>
                <Pressable
                  style={styles.googleBtn}
                  disabled={!request || loading}
                  onPress={() => promptAsync()}
                >
                  <Ionicons name="logo-google" size={22} color={Colors.text.primary} />
                  <Text style={styles.googleText}>Continue with Google</Text>
                </Pressable>
              </GlassCard>
            </AnimatedEntry>

            <AnimatedEntry delay={800} duration={600} style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </Pressable>
            </AnimatedEntry>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, safe: { flex: 1 }, flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.huge },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg, marginTop: Spacing.md },
  title: { ...Typography.displayMedium, color: Colors.text.primary, marginBottom: Spacing.sm },
  subtitle: { ...Typography.bodyLarge, color: Colors.text.secondary, marginBottom: Spacing.xxxl },
  form: { marginBottom: Spacing.xxl },
  errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.1)', padding: Spacing.md, borderRadius: BorderRadius.sm, gap: Spacing.sm, marginTop: Spacing.sm },
  errorText: { ...Typography.bodySmall, color: Colors.status.error, flex: 1 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xxl },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border.subtle },
  dividerText: { ...Typography.caption, color: Colors.text.tertiary, marginHorizontal: Spacing.md },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingVertical: Spacing.xs },
  googleText: { ...Typography.labelLarge, color: Colors.text.primary },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xxxl },
  footerText: { ...Typography.bodyMedium, color: Colors.text.secondary },
  footerLink: { ...Typography.labelMedium, color: Colors.accent.primary },
});
