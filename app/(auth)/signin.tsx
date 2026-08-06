/**
 * signin.tsx — focused clinical workspace sign-in.
 *
 * Authentication behavior is unchanged; only the startup visual system and
 * tactile/accessibility details are upgraded.
 */

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { AnimatedEntry } from '../../src/components/AnimatedEntry';
import { GlassCard } from '../../src/components/GlassCard';
import { GlassInput } from '../../src/components/GlassInput';
import { GradientButton } from '../../src/components/GradientButton';
import { StartupBrandMark } from '../../src/components/StartupBrandMark';
import { hapticSelection } from '../../src/services/preferences';
import { signIn, googleAuth, saveToken } from '../../src/services/auth';
import { useAuth } from '../../src/services/AuthContext';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/theme';

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
    redirectUri: 'https://auth.expo.io',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) handleGoogleSignIn(id_token);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await googleAuth(idToken);
      saveToken(res.token);
      setLoggedIn(true);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      setError(e.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
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
    <LinearGradient colors={[Colors.startup.bg, '#07100E', Colors.startup.bg]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.fill}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topBar}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => { hapticSelection(); router.back(); }}
                style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              >
                <Ionicons name="chevron-back" size={23} color={Colors.startup.text} />
              </Pressable>
              <StartupBrandMark compact />
              <View style={styles.topBarSpacer} />
            </View>

            <AnimatedEntry delay={150} duration={600} style={styles.intro}>
              <Text style={styles.eyebrow}>SECURE CLINICAL WORKSPACE</Text>
              <Text style={styles.title}>Welcome back.</Text>
              <Text style={styles.subtitle}>Sign in to continue your X-ray analysis workflow.</Text>
            </AnimatedEntry>

            <AnimatedEntry delay={300} duration={600} style={styles.form}>
              <GlassInput
                tone="startup"
                label="Email"
                placeholder="your@email.com"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel="Email address"
              />
              <GlassInput
                tone="startup"
                label="Password"
                placeholder="Enter your password"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                accessibilityLabel="Password"
              />

              {error ? (
                <View style={styles.errorContainer} accessibilityRole="alert">
                  <Ionicons name="alert-circle-outline" size={17} color={Colors.status.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <GradientButton
                title="Sign In"
                onPress={handleSignIn}
                loading={loading}
                gradientColors={[Colors.startup.tealBright, Colors.startup.teal]}
                textColor={Colors.startup.bg}
                accessibilityLabel="Sign in to Denoise-X"
                style={styles.signInButton}
              />
            </AnimatedEntry>

            <AnimatedEntry delay={480} duration={600} style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </AnimatedEntry>

            <AnimatedEntry delay={560} duration={600}>
              <GlassCard tone="startup" intensity={44} noPadding>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Continue with Google"
                  accessibilityState={{ disabled: !request || loading, busy: loading }}
                  style={({ pressed }) => [styles.googleBtn, pressed && styles.pressed]}
                  disabled={!request || loading}
                  onPress={() => { hapticSelection(); promptAsync(); }}
                >
                  <View style={styles.googleIcon}><Ionicons name="logo-google" size={18} color={Colors.startup.tealBright} /></View>
                  <Text style={styles.googleText}>Continue with Google</Text>
                  <Ionicons name="arrow-forward" size={17} color={Colors.startup.quiet} />
                </Pressable>
              </GlassCard>
            </AnimatedEntry>

            <AnimatedEntry delay={680} duration={600} style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create a Denoise-X account"
                onPress={() => { hapticSelection(); router.push('/(auth)/signup'); }}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <Text style={styles.footerLink}>Create one</Text>
              </Pressable>
            </AnimatedEntry>

            <View style={styles.secureNote}>
              <Ionicons name="shield-checkmark-outline" size={14} color={Colors.startup.quiet} />
              <Text style={styles.secureText}>Encrypted session · Your images stay private</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl },
  topBar: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.startup.border,
    borderRadius: 15,
    backgroundColor: Colors.startup.surface,
  },
  topBarSpacer: { width: 86 },
  intro: { marginTop: 42, marginBottom: 28 },
  eyebrow: { ...Typography.labelSmall, fontSize: 9, letterSpacing: 1.4, color: Colors.startup.tealBright, marginBottom: 12 },
  title: { ...Typography.displayLarge, fontSize: 38, lineHeight: 42, letterSpacing: -1.4, color: Colors.startup.text },
  subtitle: { ...Typography.bodyLarge, maxWidth: 310, marginTop: 12, fontSize: 15, lineHeight: 23, color: Colors.startup.muted },
  form: { marginBottom: 28 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, marginTop: -4, marginBottom: 6, borderRadius: BorderRadius.md, backgroundColor: Colors.status.errorDim },
  errorText: { ...Typography.bodySmall, flex: 1, color: Colors.status.error },
  signInButton: { marginTop: 4, borderRadius: BorderRadius.lg },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.startup.border },
  dividerText: { ...Typography.captionSmall, marginHorizontal: 12, fontSize: 10, color: Colors.startup.quiet },
  googleBtn: { minHeight: 58, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  googleIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.startup.tealDim },
  googleText: { ...Typography.labelMedium, flex: 1, color: Colors.startup.text },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 28 },
  footerText: { ...Typography.bodyMedium, color: Colors.startup.muted },
  footerLink: { ...Typography.labelMedium, color: Colors.startup.tealBright },
  secureNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 28 },
  secureText: { ...Typography.captionSmall, fontSize: 9, color: Colors.startup.quiet },
  pressed: { opacity: 0.68, transform: [{ scale: 0.985 }] },
});
