import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS } from '../../constants/theme';

export default function Signup() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSignUp = async () => {
    if (password !== confirm || !email) return;
    const success = await signUp(email.trim().toLowerCase(), password);
    if (success) setEmailSent(true);
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.logoText}>ALS</Text>
          <Text style={styles.sentTitle}>PACKET SENT</Text>
          <Text style={styles.sentSubtitle}>VERIFY AT: {email}</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(auth)/login')}>
            <LinearGradient colors={['#F5C542', '#FFDA73']} style={styles.gradient}><Text style={styles.btnText}>LOGIN</Text></LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.header}><Text style={styles.logoText}>ALS</Text><Text style={styles.brandTitle}>AETHER LEVEL SYSTEM</Text></View>
          <View style={styles.form}>
            <Text style={styles.label}>IDENTIFIER</Text>
            <TextInput style={styles.input} placeholder="EMAIL" placeholderTextColor="#333" value={email} onChangeText={setEmail} />
            <Text style={styles.label}>ACCESS KEY</Text>
            <TextInput style={styles.input} placeholder="PASSWORD" placeholderTextColor="#333" value={password} onChangeText={setPassword} secureTextEntry />
            <Text style={styles.label}>CONFIRM KEY</Text>
            <TextInput style={styles.input} placeholder="CONFIRM" placeholderTextColor="#333" value={confirm} onChangeText={setConfirm} secureTextEntry />
          </View>
          <TouchableOpacity style={styles.btn} onPress={handleSignUp} disabled={loading}>
            <LinearGradient colors={['#F5C542', '#FFDA73']} style={styles.gradient}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>SIGNUP</Text>}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.footer}>
            <Text style={styles.footerText}>ALREADY REGISTERED? <Text style={styles.footerLink}>LOGIN</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D0D0D' },
  container: { flex: 1, paddingHorizontal: 40, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoText: { fontFamily: FONTS.heading, fontSize: 60, color: COLORS.gold, letterSpacing: 8, includeFontPadding: false },
  brandTitle: { fontFamily: FONTS.bodyBold, fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 4 },
  form: { gap: 12, marginBottom: 25 },
  label: { fontFamily: FONTS.heading, fontSize: 10, color: COLORS.gold, letterSpacing: 1 },
  input: { backgroundColor: '#1A1A1A', borderRadius: 12, height: 52, paddingHorizontal: 15, color: '#FFF', borderWidth: 1, borderColor: '#333' },
  btn: { height: 56, borderRadius: 12, overflow: 'hidden' },
  gradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: FONTS.heading, fontSize: 24, color: '#000', letterSpacing: 2, paddingHorizontal: 15, includeFontPadding: false },
  footer: { marginTop: 20, alignItems: 'center' },
  footerText: { fontFamily: FONTS.body, color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  footerLink: { color: COLORS.gold, fontFamily: FONTS.bodyBold },
  sentTitle: { fontFamily: FONTS.heading, fontSize: 24, color: COLORS.gold, marginTop: 40, textAlign: 'center' },
  sentSubtitle: { fontFamily: FONTS.body, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 10, marginBottom: 30 },
});