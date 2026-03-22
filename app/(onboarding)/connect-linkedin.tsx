import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { connectLinkedIn, fetchLinkedInProfile } from '../../lib/linkedin';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function ConnectLinkedIn() {
  const router   = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    try {
      const result = await connectLinkedIn();

      if (result.success) {
        // Get the session to access the token
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.provider_token;

        if (accessToken && user) {
          // Fetch LinkedIn profile data
          const profile = await fetchLinkedInProfile(accessToken);

          // Store connected account
          await supabase.from('connected_accounts').upsert({
            user_id:      user.id,
            provider:     'linkedin',
            access_token: accessToken,
            created_at:   new Date().toISOString(),
          });

          // Store profile data for stat calculation later
          await supabase.from('profiles').upsert({
            id:       user.id,
            username: user.email?.split('@')[0],
          });

          Alert.alert(
            'LinkedIn Connected! 🎉',
            `Welcome! We found your profile data.`,
            [{ text: 'Continue', onPress: () => router.push('/(onboarding)/connect-googlefit') }]
          );
        } else {
          router.push('/(onboarding)/connect-googlefit');
        }
      } else {
        Alert.alert('Connection Failed', result.error ?? 'Please try again.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Step indicator */}
      <View style={styles.header}>
        <Text style={styles.stepText}>Step 1 of 2</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>in</Text>
        </View>

        <Text style={styles.heading}>Import your career story</Text>
        <Text style={styles.subheading}>
          We use your LinkedIn data to calculate your career stats
        </Text>

        <View style={styles.bullets}>
          {[
            'Job title and years of experience',
            'Skills and certifications',
            'Career trajectory and growth',
          ].map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.checkmark}>✦</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleConnect}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>CONNECT LINKEDIN</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(onboarding)/connect-googlefit')}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xxl,
  },
  stepText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textAlign: 'right',
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: BORDER_RADIUS.full,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0A66C2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  logoText: {
    fontFamily: FONTS.heading,
    fontSize: 36,
    color: '#FFFFFF',
  },
  heading: {
    fontFamily: FONTS.heading,
    fontSize: 30,
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  subheading: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  bullets: {
    width: '100%',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  checkmark: {
    color: COLORS.gold,
    fontSize: 14,
  },
  bulletText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
  },
  buttons: {
    paddingBottom: 48,
    gap: SPACING.md,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#0A66C2',
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonText: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  skipText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});