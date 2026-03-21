import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type WouldUse = 'yes' | 'maybe' | 'no' | null;

export default function FeedbackModal({ visible, onClose }: Props) {
  const { user } = useAuth();

  const [liked, setLiked]           = useState('');
  const [confusing, setConfusing]   = useState('');
  const [wouldUse, setWouldUse]     = useState<WouldUse>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  async function handleSubmit() {
    if (!wouldUse) return;
    setSubmitting(true);
    setError(null);

    try {
      const { error: dbError } = await supabase.from('feedback').insert({
        user_id:    user?.id ?? null,
        liked:      liked,
        confusing:  confusing,
        would_use:  wouldUse,
      });

      if (dbError) throw dbError;
      setSubmitted(true);
    } catch (e) {
      setError('Could not submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    // Reset state on close
    setLiked('');
    setConfusing('');
    setWouldUse(null);
    setSubmitted(false);
    setError(null);
    onClose();
  }

  const WOULD_USE_OPTIONS: { label: string; value: WouldUse }[] = [
    { label: 'Yes 👍', value: 'yes' },
    { label: 'Maybe 🤔', value: 'maybe' },
    { label: 'Not yet 👎', value: 'no' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {submitted ? (
            // Thank you state
            <View style={styles.thankYouContainer}>
              <Text style={styles.thankYouEmoji}>🙌</Text>
              <Text style={styles.thankYouTitle}>Thank you!</Text>
              <Text style={styles.thankYouSubtitle}>
                Your feedback helps us build a better app.
              </Text>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Text style={styles.closeBtnText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <Text style={styles.title}>Quick Feedback</Text>
              <Text style={styles.subtitle}>Help us improve your experience</Text>

              {/* Q1 */}
              <View style={styles.question}>
                <Text style={styles.questionLabel}>What did you like most?</Text>
                <TextInput
                  style={styles.textInput}
                  value={liked}
                  onChangeText={setLiked}
                  placeholder="Tell us what's working..."
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Q2 */}
              <View style={styles.question}>
                <Text style={styles.questionLabel}>What felt off or confusing?</Text>
                <TextInput
                  style={styles.textInput}
                  value={confusing}
                  onChangeText={setConfusing}
                  placeholder="Tell us what needs work..."
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Q3 */}
              <View style={styles.question}>
                <Text style={styles.questionLabel}>
                  Would you use this regularly?
                </Text>
                <View style={styles.optionsRow}>
                  {WOULD_USE_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.optionBtn,
                        wouldUse === opt.value && styles.optionBtnActive,
                      ]}
                      onPress={() => setWouldUse(opt.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          wouldUse === opt.value && styles.optionTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Error */}
              {error && <Text style={styles.errorText}>{error}</Text>}

              {/* Submit */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  !wouldUse && styles.submitBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!wouldUse || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.submitBtnText}>SUBMIT FEEDBACK</Text>
                )}
              </TouchableOpacity>

              {/* Skip */}
              <TouchableOpacity onPress={handleClose} style={styles.skipBtn}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.xl,
    paddingBottom: 40,
    paddingTop: SPACING.md,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 26,
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  question: {
    marginBottom: SPACING.lg,
  },
  questionLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  optionBtn: {
    flex: 1,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  optionBtnActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  optionText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  optionTextActive: {
    color: '#000000',
    fontFamily: FONTS.bodyBold,
  },
  errorText: {
    fontFamily: FONTS.body,
    color: COLORS.error,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  submitBtn: {
    backgroundColor: COLORS.gold,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: '#000000',
    letterSpacing: 2,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  skipText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  thankYouContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.md,
  },
  thankYouEmoji: {
    fontSize: 48,
  },
  thankYouTitle: {
    fontFamily: FONTS.heading,
    fontSize: 32,
    color: COLORS.gold,
    letterSpacing: 1,
  },
  thankYouSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  closeBtn: {
    backgroundColor: COLORS.gold,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: SPACING.md,
  },
  closeBtnText: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: '#000000',
    letterSpacing: 2,
  },
});