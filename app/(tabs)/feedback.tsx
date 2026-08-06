/**
 * (tabs)/feedback.tsx — Premium Feedback Form
 * =============================================
 * Cinematic star rating with glow, gradient category chips,
 * focus-glow text input, and premium submit button.
 */

import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView, Animated, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hapticImpact, hapticNotification, hapticSelection } from '../../src/services/preferences';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { AnimatedEntry, FadeIn } from '../../src/components/AnimatedEntry';
import { getMe } from '../../src/services/auth';

const CATEGORIES = ['General', 'Bug Report', 'Feature Request', 'UI/UX', 'Performance'];
const FEEDBACK_KEY = 'denoisex_feedback_history';

export default function FeedbackTab() {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('Mobile App User');
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => { getMe().then(u => { if (u?.email) setUserEmail(u.email); }).catch(() => {}); }, []);

  const handleStarPress = (star: number) => { hapticImpact('light'); setRating(star); };

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Rating Required', 'Please select a star rating.'); return; }
    setSubmitting(true);
    hapticImpact('medium');
    try {
      const feedback = { id: `fb_${Date.now()}`, rating, category: category || 'General', comment: comment.trim(), timestamp: new Date().toISOString() };
      const existing = await AsyncStorage.getItem(FEEDBACK_KEY);
      const history = existing ? JSON.parse(existing) : [];
      history.unshift(feedback);
      await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(history.slice(0, 50)));

      const WEB_API_URL = process.env.EXPO_PUBLIC_WEB_URL;
      if (!WEB_API_URL) { Alert.alert('Configuration Error', 'EXPO_PUBLIC_WEB_URL is not set.'); setSubmitting(false); return; }
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`${WEB_API_URL}/api/feedback`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, love: `Rating: ${rating}/5 | Category: ${category || 'General'}`, improved: comment.trim() || 'No additional comments provided.' }),
        signal: controller.signal,
      });
      clearTimeout(tid);
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `Server returned ${res.status}`); }

      setSubmitted(true);
      Animated.parallel([
        Animated.spring(checkScale, { toValue: 1, damping: 8, stiffness: 150, useNativeDriver: true }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      hapticNotification('success');
    } catch (err: any) {
      Alert.alert('Submission Failed', err?.name === 'AbortError' ? 'Request timed out.' : `Failed: ${err?.message || 'Unknown error'}`);
    } finally { setSubmitting(false); }
  };

  const handleNewFeedback = () => {
    hapticImpact('light');
    setRating(0); setCategory(''); setComment(''); setSubmitted(false);
    checkScale.setValue(0); checkOpacity.setValue(0);
  };

  if (submitted) {
    return (
      <LinearGradient colors={[Colors.bg.primary, '#080E1E', Colors.bg.primary]} style={s.fill}>
        <SafeAreaView style={[s.fill, s.center]} edges={['top']}>
          <Animated.View style={[s.successCircle, { transform: [{ scale: checkScale }], opacity: checkOpacity }]}>
            <LinearGradient colors={['#4F8EF7', Colors.accent.primary]} style={s.successGrad}>
              <Ionicons name="checkmark" size={48} color="#fff" />
            </LinearGradient>
          </Animated.View>
          <FadeIn delay={400} duration={500}>
            <Text style={s.successTitle}>Thank You!</Text>
            <Text style={s.successDesc}>Your feedback helps us improve Denoise X.</Text>
          </FadeIn>
          <FadeIn delay={600} duration={500}>
            <Pressable onPress={handleNewFeedback} style={s.newBtn}>
              <Text style={s.newBtnText}>Submit Another</Text>
            </Pressable>
          </FadeIn>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[Colors.bg.primary, '#080E1E', Colors.bg.primary]} style={s.fill}>
      <SafeAreaView style={s.fill} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.fill}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
            <FadeIn duration={400}>
              <Text style={s.title}>Send Feedback</Text>
              <Text style={s.subtitle}>Help us make Denoise X better for medical professionals</Text>
            </FadeIn>

            {/* Stars */}
            <AnimatedEntry delay={200} duration={500}>
              <GlassCard glowColor="blue" style={s.section}>
                <Text style={s.secLabel}>How would you rate your experience?</Text>
                <View style={s.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable key={star} onPress={() => handleStarPress(star)} style={s.starBtn}>
                      <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={34} color={star <= rating ? '#F59E0B' : Colors.text.quaternary} />
                    </Pressable>
                  ))}
                </View>
                {rating > 0 && <Text style={s.ratingText}>{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}</Text>}
              </GlassCard>
            </AnimatedEntry>

            {/* Category */}
            <AnimatedEntry delay={350} duration={500}>
              <GlassCard style={s.section}>
                <Text style={s.secLabel}>Category</Text>
                <View style={s.cats}>
                  {CATEGORIES.map((cat) => (
                    <Pressable key={cat} onPress={() => { hapticSelection(); setCategory(cat); }}
                      style={[s.chip, category === cat && s.chipActive]}>
                      <Text style={[s.chipText, category === cat && s.chipTextActive]}>{cat}</Text>
                    </Pressable>
                  ))}
                </View>
              </GlassCard>
            </AnimatedEntry>

            {/* Comment */}
            <AnimatedEntry delay={500} duration={500}>
              <GlassCard style={s.section}>
                <Text style={s.secLabel}>Additional Comments (optional)</Text>
                <TextInput value={comment} onChangeText={setComment} placeholder="Tell us more about your experience..." placeholderTextColor={Colors.text.quaternary} style={s.textInput} multiline numberOfLines={4} textAlignVertical="top" />
              </GlassCard>
            </AnimatedEntry>

            {/* Submit */}
            <AnimatedEntry delay={650} duration={500}>
              <Pressable onPress={handleSubmit} disabled={submitting} style={[s.submitOuter, submitting && { opacity: 0.6 }]}>
                <LinearGradient colors={['#4F8EF7', Colors.accent.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.submitGrad}>
                  <Ionicons name="send" size={17} color="#fff" />
                  <Text style={s.submitText}>{submitting ? 'Submitting...' : 'Submit Feedback'}</Text>
                </LinearGradient>
              </Pressable>
            </AnimatedEntry>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  scroll: { paddingHorizontal: 22, paddingBottom: 110 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text.primary, marginTop: 20, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.text.tertiary, marginTop: 4, marginBottom: 24 },
  section: { marginBottom: 16 },
  secLabel: { fontSize: 13, fontWeight: '600', color: Colors.text.secondary, marginBottom: 14 },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  starBtn: { padding: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#F59E0B', textAlign: 'center', marginTop: 8 },
  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: Colors.glass.bg, borderWidth: 1, borderColor: Colors.border.subtle },
  chipActive: { borderColor: Colors.accent.primary, backgroundColor: Colors.accent.primaryDim },
  chipText: { fontSize: 12, fontWeight: '600', color: Colors.text.tertiary },
  chipTextActive: { color: Colors.accent.primary },
  textInput: { fontSize: 14, color: Colors.text.primary, backgroundColor: Colors.surface.input, borderRadius: 12, borderWidth: 1, borderColor: Colors.border.subtle, padding: 14, minHeight: 100 },
  submitOuter: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  submitGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  submitText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  successCircle: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', marginBottom: 24 },
  successGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 24, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', marginBottom: 8 },
  successDesc: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center', marginBottom: 24 },
  newBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border.accent },
  newBtnText: { fontSize: 13, fontWeight: '600', color: Colors.accent.primary },
});
