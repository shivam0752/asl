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
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function Login() {
  const router = useRouter();
  const { signIn, signInWithGoogle, loading, error } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { height } = useWindowDimensions();
  const compact = height < 760;

  async function handleLogin() {
    if (!email || !password) return;
    const success = await signIn(email, password);
    if (success) router.replace('/(tabs)/');
  }

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

        {/* Header */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={[styles.title, compact && styles.titleCompact]}>Welcome Back</Text>
        <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>Continue your journey</Text>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            {error.toLowerCase().includes('confirm') ||
             error.toLowerCase().includes('email') ? (
              <Text style={styles.errorHint}>
                Please check your inbox and click the confirmation link first.
              </Text>
            ) : null}
          </View>
        )}

        {/* Inputs */}
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

          <View style={styles.passwordHeader}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, compact && styles.inputCompact]}
            placeholder="Your password"
            placeholderTextColor={COLORS.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="go"
            onSubmitEditing={() => {
              void handleLogin();
            }}
          />
        </View>

        {/* Login button */}
        <TouchableOpacity
          style={[styles.primaryButton, compact && styles.primaryButtonCompact]}
          onPress={handleLogin}
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
              <Text style={styles.primaryButtonText}>LOG IN</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View style={[styles.divider, compact && styles.dividerCompact]}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google */}
        <TouchableOpacity
          style={[styles.googleButton, compact && styles.googleButtonCompact]}
          onPress={signInWithGoogle}
        >
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={[styles.footer, compact && styles.footerCompact]}>
          <Text style={styles.footerText}>New here? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.footerLink}>Create Account</Text>
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
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    justifyContent: 'center',
  },
  containerCompact: {
    paddingTop: 24,
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
    gap: SPACING.xs,
  },
  errorText: {
    fontFamily: FONTS.body,
    color: COLORS.error,
    fontSize: 13,
  },
  errorHint: {
    fontFamily: FONTS.body,
    color: COLORS.gold,
    fontSize: 13,
    marginTop: 4,
  },
  form: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  formCompact: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  forgotText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.gold,
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
    height: 48,
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
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  dividerCompact: {
    marginBottom: SPACING.md,
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
    marginTop: SPACING.sm,
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
});