import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useCreateCharacter } from '../../hooks/useCharacter';
import { calculateAllStats } from '../../utils/statAlgorithm';
import { ManualEntryData, EducationLevel } from '../../types';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

const EDUCATION_OPTIONS: { label: string; value: EducationLevel }[] = [
  { label: 'High School', value: 'highschool' },
  { label: "Bachelor's", value: 'bachelors' },
  { label: "Master's", value: 'masters' },
  { label: 'PhD', value: 'phd' },
];

// ── Moved OUTSIDE main component to prevent re-render issues ──
function SelectButtons({
  options,
  value,
  onChange,
}: {
  options: number[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.selectRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.selectBtn, value === opt && styles.selectBtnActive]}
          onPress={() => onChange(opt)}
        >
          <Text
            style={[
              styles.selectBtnText,
              value === opt && styles.selectBtnTextActive,
            ]}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ManualEntry() {
  const router = useRouter();
  const { user } = useAuth();
  const createCharacter = useCreateCharacter();

  const [localError, setLocalError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ManualEntryData>({
    avgDailySteps: 7000,
    workoutDaysPerWeek: 3,
    avgSleepHours: 7,
    yearsExperience: 2,
    educationLevel: 'bachelors',
    industryCount: 1,
    certCount: 0,
    endorsedSkills: 10,
    connections: 200,
    recommendations: 2,
    careerSwitches: 0,
  });

  async function handleSubmit() {
    setLocalError(null);

    if (!user) {
      setLocalError('You are not logged in. Please sign in first.');
      return;
    }

    try {
      const stats = calculateAllStats(formData);
      await createCharacter.mutateAsync({
        userId: user.id,
        statsData: stats,
      });
      router.replace('/(onboarding)/generating');
    } catch (e: any) {
      console.log('Create character error:', e);
      setLocalError(e?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>
            We'll build your character from this data
          </Text>

          {/* Daily Steps */}
          <View style={styles.field}>
            <Text style={styles.label}>Average daily steps</Text>
            <TextInput
              style={styles.input}
              value={String(formData.avgDailySteps)}
              onChangeText={(v) =>
                setFormData((p) => ({ ...p, avgDailySteps: Number(v) || 0 }))
              }
              keyboardType="numeric"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Workout days */}
          <View style={styles.field}>
            <Text style={styles.label}>Workout days per week</Text>
            <SelectButtons
              options={[0, 1, 2, 3, 4, 5, 6, 7]}
              value={formData.workoutDaysPerWeek}
              onChange={(v) =>
                setFormData((p) => ({ ...p, workoutDaysPerWeek: v }))
              }
            />
          </View>

          {/* Sleep hours */}
          <View style={styles.field}>
            <Text style={styles.label}>Average sleep hours</Text>
            <SelectButtons
              options={[5, 6, 7, 8, 9]}
              value={formData.avgSleepHours}
              onChange={(v) =>
                setFormData((p) => ({ ...p, avgSleepHours: v }))
              }
            />
          </View>

          {/* Years experience */}
          <View style={styles.field}>
            <Text style={styles.label}>Years of work experience</Text>
            <TextInput
              style={styles.input}
              value={String(formData.yearsExperience)}
              onChangeText={(v) =>
                setFormData((p) => ({ ...p, yearsExperience: Number(v) || 0 }))
              }
              keyboardType="numeric"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Certifications */}
          <View style={styles.field}>
            <Text style={styles.label}>Number of certifications</Text>
            <TextInput
              style={styles.input}
              value={String(formData.certCount)}
              onChangeText={(v) =>
                setFormData((p) => ({ ...p, certCount: Number(v) || 0 }))
              }
              keyboardType="numeric"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Connections */}
          <View style={styles.field}>
            <Text style={styles.label}>LinkedIn connections (approx)</Text>
            <TextInput
              style={styles.input}
              value={String(formData.connections)}
              onChangeText={(v) =>
                setFormData((p) => ({ ...p, connections: Number(v) || 0 }))
              }
              keyboardType="numeric"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Education */}
          <View style={styles.field}>
            <Text style={styles.label}>Highest education level</Text>
            <View style={styles.educationGrid}>
              {EDUCATION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.educationBtn,
                    formData.educationLevel === opt.value &&
                      styles.educationBtnActive,
                  ]}
                  onPress={() =>
                    setFormData((p) => ({ ...p, educationLevel: opt.value }))
                  }
                >
                  <Text
                    style={[
                      styles.educationBtnText,
                      formData.educationLevel === opt.value &&
                        styles.educationBtnTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Errors */}
          {(localError || createCharacter.isError) && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {localError ?? createCharacter.error?.message ?? 'Something went wrong'}
              </Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={createCharacter.isPending}
          >
            {createCharacter.isPending ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitButtonText}>
                BUILD MY CHARACTER →
              </Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: 48,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 32,
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  field: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  },
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  selectBtn: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectBtnActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  selectBtnText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  selectBtnTextActive: {
    color: '#000000',
  },
  educationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  educationBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  educationBtnActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  educationBtnText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  educationBtnTextActive: {
    color: '#000000',
    fontFamily: FONTS.bodyBold,
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
  submitButton: {
    backgroundColor: COLORS.gold,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  submitButtonText: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: '#000000',
    letterSpacing: 2,
  },
});