import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function SetDisplayName() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading, updateUsername, updating } = useProfile(user?.id);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!user) return;
    const fromProfile = profile?.username?.trim();
    const fromEmail = user.email?.split('@')[0] ?? '';
    setName(fromProfile || fromEmail);
  }, [user, profile?.username]);

  async function handleContinue() {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await updateUsername({ userId: user.id, username: trimmed });
      router.replace('/(onboarding)/generating');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not save your name.';
      Alert.alert('Error', msg);
    }
  }

  if (!user || loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={COLORS.gold} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.heroGlow}>
          <LinearGradient
            colors={['rgba(245,197,66,0.22)', 'rgba(245,197,66,0.06)', 'rgba(13,13,13,0)']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.step}>Almost there</Text>
          <Text style={styles.title}>Your hero name</Text>
          <Text style={styles.subtitle}>
            This is how you appear in LevelUp. You can change it anytime in Profile.
          </Text>

          <Text style={styles.label}>Display name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Shivam"
            placeholderTextColor={COLORS.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect
            returnKeyType="done"
            onSubmitEditing={() => {
              void handleContinue();
            }}
            maxLength={40}
          />

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              void handleContinue();
            }}
            disabled={!name.trim() || updating}
          >
            <LinearGradient
              colors={['#F5C542', '#FFDA73']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.primaryGradient}
            >
              {updating ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.primaryText}>CONTINUE</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safe: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    left: -20,
    right: -20,
    height: 200,
    pointerEvents: 'none',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    justifyContent: 'center',
  },
  step: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 32,
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  label: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    height: 52,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  primaryBtn: {
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  primaryGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: '#000000',
    letterSpacing: 2,
  },
});
