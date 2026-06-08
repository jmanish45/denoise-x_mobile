/**
 * signup.tsx — Sign Up Screen
 * ==============================
 * Premium registration with profile type selection and glass inputs.
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
import { signUp, googleAuth, saveToken, PROFESSIONAL_ROLE_LABELS } from '../../src/services/auth';
import { useAuth } from '../../src/services/AuthContext';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

type ProfileType = 'student' | 'professional';
const ROLES = Object.entries(PROFESSIONAL_ROLE_LABELS).map(([value, label]) => ({ value, label }));

export default function SignUpScreen() {
  const router = useRouter();
  const { setLoggedIn } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileType, setProfileType] = useState<ProfileType>('student');
  const [collegeName, setCollegeName] = useState('');
  const [professionalRole, setProfessionalRole] = useState('');
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
        handleGoogleSignUp(id_token);
      }
    }
  }, [response]);

  const handleGoogleSignUp = async (idToken: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await googleAuth(idToken);
      saveToken(res.token);
      setLoggedIn(true);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      setError(e.message || 'Google sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError('');
    if (!fullName.trim() || !email.trim() || !password) { setError('Please fill in all required fields.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (profileType === 'student' && !collegeName.trim()) { setError('Please enter your college name.'); return; }
    if (profileType === 'professional' && !professionalRole) { setError('Please select your professional role.'); return; }

    setLoading(true);
    try {
      await signUp({
        full_name: fullName.trim(), email: email.trim().toLowerCase(), password,
        profile_type: profileType === 'professional' ? professionalRole : 'student',
        college_name: profileType === 'student' ? collegeName.trim() : undefined,
        professional_role: profileType === 'professional' ? professionalRole : undefined,
      });
      // Clear the token so user must explicitly sign in
      const { clearToken } = await import('../../src/services/auth');
      await clearToken();
      // Show success and redirect to sign in
      Alert.alert(
        'Account Created!',
        'Your account has been created successfully. Please sign in to continue.',
        [{ text: 'Sign In', onPress: () => router.replace('/(auth)/signin') }],
      );
    } catch (e: any) {
      setError(e.message || 'Sign up failed.');
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join the clinical AI revolution</Text>
            </AnimatedEntry>

            {/* Profile Type Selector */}
            <AnimatedEntry delay={300} duration={600} style={styles.typeSelector}>
              <Pressable onPress={() => setProfileType('student')} style={[styles.typeBtn, profileType === 'student' && styles.typeBtnActive]}>
                <Ionicons name="school-outline" size={20} color={profileType === 'student' ? Colors.accent.primary : Colors.text.tertiary} />
                <Text style={[styles.typeBtnText, profileType === 'student' && styles.typeBtnTextActive]}>Student</Text>
              </Pressable>
              <Pressable onPress={() => setProfileType('professional')} style={[styles.typeBtn, profileType === 'professional' && styles.typeBtnActive]}>
                <Ionicons name="medkit-outline" size={20} color={profileType === 'professional' ? Colors.accent.primary : Colors.text.tertiary} />
                <Text style={[styles.typeBtnText, profileType === 'professional' && styles.typeBtnTextActive]}>Professional</Text>
              </Pressable>
            </AnimatedEntry>

            {/* Form */}
            <AnimatedEntry delay={400} duration={600} style={styles.form}>
              <GlassInput label="Full Name" placeholder="John Doe" icon="person-outline" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
              <GlassInput label="Email" placeholder="your@email.com" icon="mail-outline" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <GlassInput label="Password" placeholder="Min 8 characters" icon="lock-closed-outline" value={password} onChangeText={setPassword} secureTextEntry />

              {profileType === 'student' ? (
                <GlassInput label="College / Institution" placeholder="Your university name" icon="business-outline" value={collegeName} onChangeText={setCollegeName} />
              ) : (
                <View>
                  <Text style={styles.roleLabel}>Professional Role</Text>
                  <View style={styles.rolesGrid}>
                    {ROLES.map((role) => (
                      <Pressable key={role.value} onPress={() => setProfessionalRole(role.value)}
                        style={[styles.roleChip, professionalRole === role.value && styles.roleChipActive]}>
                        <Text style={[styles.roleChipText, professionalRole === role.value && styles.roleChipTextActive]}>{role.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={Colors.status.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              <GradientButton title="Create Account" onPress={handleSignUp} loading={loading} style={{ marginTop: Spacing.lg }} />
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
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/signin')}>
                <Text style={styles.footerLink}>Sign In</Text>
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
  subtitle: { ...Typography.bodyLarge, color: Colors.text.secondary, marginBottom: Spacing.xxl },
  typeSelector: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xxl },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border.subtle, backgroundColor: Colors.glass.bg },
  typeBtnActive: { borderColor: Colors.accent.primary, backgroundColor: Colors.accent.primaryDim },
  typeBtnText: { ...Typography.labelMedium, color: Colors.text.tertiary },
  typeBtnTextActive: { color: Colors.accent.primary },
  form: { marginBottom: Spacing.xxl },
  roleLabel: { ...Typography.labelMedium, color: Colors.text.secondary, marginBottom: Spacing.sm },
  rolesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  roleChip: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border.subtle, backgroundColor: Colors.glass.bg },
  roleChipActive: { borderColor: Colors.accent.primary, backgroundColor: Colors.accent.primaryDim },
  roleChipText: { ...Typography.bodySmall, color: Colors.text.tertiary },
  roleChipTextActive: { color: Colors.accent.primary },
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
