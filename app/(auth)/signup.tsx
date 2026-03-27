import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function Signup() {
  const router = useRouter();
  const { signUp, signInWithGoogle, loading, error } = useAuth();

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [emailSent, setEmailSent]   = useState(false);
  const [resending, setResending]   = useState(false);
  const { height } = useWindowDimensions();
  const compact = height < 760;

  function getEmailRedirectTo(): string {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.location?.origin) {
        return `${window.location.origin}/(auth)/login`;
      }
      return 'http://localhost:8081/(auth)/login';
    }
    return 'aetherls://(auth)/login';
  }

  async function handleSignUp() {
    setLocalError(null);
    if (!email || !password || !confirm) {
      setLocalError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    const success = await signUp(normalizedEmail, password);
    if (success) setEmailSent(true);
  }

  async function handleResend() {
    setResending(true);
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: getEmailRedirectTo(),
      },
    });
    if (resendError) {
      setLocalError(resendError.message);
    }
    setResending(false);
  }

  const displayError = localError ?? error;

  // ── Email sent screen ──────────────────────────────
  if (emailSent) {
    return (
      <View style={styles.emailSentWrapper}>
        <Text style={styles.emailSentEmoji}>📬</Text>
        <Text style={styles.emailSentTitle}>Check your email</Text>
        <Text style={styles.emailSentSubtitle}>
          We sent a confirmation link to{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>
        <Text style={styles.emailSentBody}>
          Click the link in the email to confirm your account.
          Then come back here and log in.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/(auth)/login')}
        >
          <LinearGradient
            colors={['#F5C542', '#FFDA73']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.primaryButtonGradient}
          >
            <Text style={styles.primaryButtonText}>GO TO LOGIN</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResend}
          disabled={resending}
        >
          {resending ? (
            <ActivityIndicator color={COLORS.textSecondary} size="small" />
          ) : (
            <Text style={styles.resendText}>Resend confirmation email</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // ── Signup form ────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={styles.heroGlow}>
          <LinearGradient
            colors={['rgba(245,197,66,0.24)', 'rgba(245,197,66,0.08)', 'rgba(13,13,13,0)']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.heroGradient}
          />
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={[styles.title, compact && styles.titleCompact]}>Create Account</Text>
        <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>Begin your journey</Text>

        {displayError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{displayError}</Text>
          </View>
        )}

        <View style={[styles.form, compact && styles.formCompact]}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, compact && styles.inputCompact]}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, compact && styles.inputCompact]}
            placeholder="Min. 6 characters"
            placeholderTextColor={COLORS.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="next"
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={[styles.input, compact && styles.inputCompact]}
            placeholder="Repeat your password"
            placeholderTextColor={COLORS.textSecondary}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            returnKeyType="go"
            onSubmitEditing={() => {
              void handleSignUp();
            }}
          />
        </View>

        <Text style={[styles.trustNote, compact && styles.trustNoteCompact]}>
          We connect your LinkedIn and fitness data to build your character.
        </Text>

        <TouchableOpacity
          style={[styles.primaryButton, compact && styles.primaryButtonCompact]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <LinearGradient
            colors={['#F5C542', '#FFDA73']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.primaryButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.primaryButtonText}>SIGN UP</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={[styles.divider, compact && styles.dividerCompact]}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, compact && styles.googleButtonCompact]}
          onPress={signInWithGoogle}
        >
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={[styles.footer, compact && styles.footerCompact]}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingTop: 40,
    paddingBottom: SPACING.lg,
    justifyContent: 'center',
  },
  containerCompact: {
    paddingTop: 20,
    paddingBottom: SPACING.md,
  },
  heroGlow: {
    position: 'absolute',
    top: -60,
    left: -20,
    right: -20,
    height: 220,
    pointerEvents: 'none',
  },
  heroGradient: {
    flex: 1,
  },
  backButton: {
    marginBottom: SPACING.lg,
  },
  backText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 36,
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  titleCompact: {
    fontSize: 30,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  subtitleCompact: {
    marginBottom: SPACING.md,
  },
  errorBox: {
    backgroundColor: '#2D1515',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: {
    fontFamily: FONTS.body,
    color: COLORS.error,
    fontSize: 13,
  },
  form: {
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  formCompact: {
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  label: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    height: 52,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputCompact: {
    height: 46,
  },
  trustNote: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  trustNoteCompact: {
    marginBottom: SPACING.sm,
  },
  primaryButton: {
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  primaryButtonCompact: {
    height: 48,
    marginBottom: SPACING.md,
  },
  primaryButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: '#000000',
    letterSpacing: 2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  dividerCompact: {
    marginBottom: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  googleButton: {
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  googleButtonCompact: {
    height: 48,
    marginBottom: SPACING.md,
  },
  googleButtonText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  footerCompact: {
    marginTop: 0,
  },
  footerText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.gold,
    fontSize: 14,
  },
  emailSentWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  emailSentEmoji: {
    fontSize: 64,
    marginBottom: SPACING.sm,
  },
  emailSentTitle: {
    fontFamily: FONTS.heading,
    fontSize: 36,
    color: COLORS.textPrimary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  emailSentSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailHighlight: {
    color: COLORS.gold,
    fontFamily: FONTS.bodyBold,
  },
  emailSentBody: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  resendButton: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  resendText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
});