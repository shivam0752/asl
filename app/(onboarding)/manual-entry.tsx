import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useCreateCharacter } from '../../hooks/useCharacter';
import { calculateAllStats } from '../../utils/statAlgorithm';
import { ManualEntryData, EducationLevel } from '../../types';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

const EDUCATION_OPTIONS: { label: string; value: EducationLevel }[] = [
  { label: 'High School', value: 'highschool' },
  { label: "Bachelor's",  value: 'bachelors'  },
  { label: "Master's",    value: 'masters'    },
  { label: 'PhD',         value: 'phd'        },
];

export default function ManualEntry() {
  const router = useRouter();
  const { user } = useAuth();
  const createCharacter = useCreateCharacter();
  const [localError, setLocalError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ManualEntryData & { jobTitle: string }>({
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
    jobTitle: '', 
  });

  async function handleSubmit() {
    if (!user) return;
    try {
      const stats = calculateAllStats(formData);
      await createCharacter.mutateAsync({ userId: user.id, statsData: stats });
      await supabase.from('sync_data').upsert({
        user_id: user.id,
        linkedin_raw: { jobTitle: formData.jobTitle, yearsExperience: formData.yearsExperience, educationLevel: formData.educationLevel },
        updated_at: new Date().toISOString(),
      });
      router.replace('/(onboarding)/set-display-name');
    } catch (e: any) {
      setLocalError(e?.message ?? 'Error saving data');
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.background }} behavior="padding">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Boost Your Profile</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Job Title</Text>
            <TextInput style={styles.input} placeholder="e.g. Designer" placeholderTextColor="#666" value={formData.jobTitle} onChangeText={(v) => setFormData(p => ({ ...p, jobTitle: v }))} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Years of Experience</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={String(formData.yearsExperience)} onChangeText={(v) => setFormData(p => ({ ...p, yearsExperience: Number(v) || 0 }))} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Education</Text>
            <View style={styles.selectRow}>
              {EDUCATION_OPTIONS.map((opt) => (
                <TouchableOpacity key={opt.value} style={[styles.selectBtn, formData.educationLevel === opt.value && styles.activeBtn]} onPress={() => setFormData(p => ({ ...p, educationLevel: opt.value }))}>
                  <Text style={{ color: formData.educationLevel === opt.value ? '#000' : '#fff' }}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>BUILD CHARACTER →</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontFamily: FONTS.heading, fontSize: 28, color: COLORS.gold, marginBottom: 20 },
  field: { marginBottom: 20 },
  label: { color: COLORS.textSecondary, marginBottom: 8, textTransform: 'uppercase', fontSize: 12 },
  input: { backgroundColor: COLORS.surface, borderRadius: 8, height: 50, paddingHorizontal: 15, color: '#fff', borderWidth: 1, borderColor: COLORS.border },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  selectBtn: { padding: 10, borderRadius: 8, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  activeBtn: { backgroundColor: COLORS.gold },
  submitButton: { backgroundColor: COLORS.gold, height: 55, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  submitButtonText: { fontFamily: FONTS.heading, fontSize: 18 }
});