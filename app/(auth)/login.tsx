import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS } from '../../constants/theme';

export default function Login() {
  const router = useRouter();
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return;
    const success = await signIn(email.trim().toLowerCase(), password);
    if (success) router.replace('/(tabs)/');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D0D' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.logoText}>ALS</Text>
            <Text style={styles.brandTitle}>AETHER LEVEL SYSTEM</Text>
          </View>

          {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

          <View style={styles.form}>
            <Text style={styles.label}>IDENTIFIER</Text>
            <TextInput style={styles.input} placeholder="EMAIL" placeholderTextColor="#333" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <Text style={styles.label}>ACCESS KEY</Text>
            <TextInput style={styles.input} placeholder="PASSWORD" placeholderTextColor="#333" value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            <LinearGradient colors={['#F5C542', '#FFDA73']} style={styles.gradient}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>LOGIN</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={styles.footer}>
            <Text style={styles.footerText}>NEW IDENTITY? <Text style={styles.footerLink}>SIGNUP</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 40, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 50 },
  logoText: { fontFamily: FONTS.heading, fontSize: 60, color: COLORS.gold, letterSpacing: 8, includeFontPadding: false },
  brandTitle: { fontFamily: FONTS.bodyBold, fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 4 },
  errorBox: { backgroundColor: 'rgba(255,94,94,0.1)', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: COLORS.error },
  errorText: { color: COLORS.error, fontFamily: FONTS.body, fontSize: 12, textAlign: 'center' },
  form: { gap: 15, marginBottom: 30 },
  label: { fontFamily: FONTS.heading, fontSize: 10, color: COLORS.gold, letterSpacing: 1 },
  input: { backgroundColor: '#1A1A1A', borderRadius: 12, height: 56, paddingHorizontal: 15, color: '#FFF', borderWidth: 1, borderColor: '#333' },
  btn: { height: 56, borderRadius: 12, overflow: 'hidden' },
  gradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: FONTS.heading, fontSize: 24, color: '#000', letterSpacing: 2, paddingHorizontal: 15, includeFontPadding: false },
  footer: { marginTop: 25, alignItems: 'center' },
  footerText: { fontFamily: FONTS.body, color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  footerLink: { color: COLORS.gold, fontFamily: FONTS.bodyBold },
});