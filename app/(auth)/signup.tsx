import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
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
    const success = await signUp(email, password);
    if (success) setEmailSent(true);
  }

  async function handleResend() {
    setResending(true);
    await supabase.auth.resend({ type: 'signup', email });
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
          <Text style={styles.primaryButtonText}>GO TO LOGIN</Text>
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
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Begin your journey</Text>

        {displayError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{displayError}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Min. 6 characters"
            placeholderTextColor={COLORS.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Repeat your password"
            placeholderTextColor={COLORS.textSecondary}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />
        </View>

        <Text style={styles.trustNote}>
          We connect your LinkedIn and fitness data to build your character.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.primaryButtonText}>SIGN UP</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={signInWithGoogle}
        >
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.xl,
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
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.md,
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
  trustNote: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: COLORS.gold,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
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
    marginBottom: SPACING.xl,
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