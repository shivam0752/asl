import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function Splash() {
  const router = useRouter();
  const { user } = useAuth();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) router.replace('/(tabs)/');
  }, [user]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -15, duration: 3000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D0D0D', '#151515', '#0D0D0D']} style={StyleSheet.absoluteFill} />

      {/* CENTRAL LOGO - Larger & Centered */}
      <View style={styles.logoBgWrapper}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.largeLogo}
          resizeMode="contain"
        />
      </View>

      {/* TEXT CONTENT - Elevated Above Logo */}
      <Animated.View style={[styles.headerGroup, { transform: [{ translateY: floatAnim }] }]}>
        <Text style={styles.appName}>ALS</Text>
        <Text style={styles.fullBrand}>AETHER LEVEL SYSTEM</Text>
        <View style={styles.accentLine} />
        <Text style={styles.tagline}>YOUR REAL LIFE. LEVELED UP.</Text>
      </Animated.View>

      {/* BUTTONS */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/signup')}>
          <LinearGradient colors={['#F5C542', '#FFDA73']} style={styles.btnGradient}>
            <Text style={styles.primaryBtnText}>SIGNUP</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.secondaryBtnText}>LOGIN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center' },
  logoBgWrapper: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 1
  },
  largeLogo: { 
    width: width * 1.3, // Increase this for even larger logo
    height: width * 1.3,
    opacity: 0.42, // Adjusted for visibility
  },
  headerGroup: { 
    alignItems: 'center', 
    marginTop: height * 0.12, // High elevation
    zIndex: 2 
  },
  appName: { fontFamily: FONTS.heading, fontSize: 84, color: COLORS.gold, letterSpacing: 10, includeFontPadding: false },
  fullBrand: { fontFamily: FONTS.bodyBold, fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 4, marginTop: -10 },
  accentLine: { width: 40, height: 2, backgroundColor: COLORS.gold, marginVertical: 20 },
  tagline: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.gold, letterSpacing: 1 },
  buttonGroup: { position: 'absolute', bottom: 60, width: '100%', paddingHorizontal: 40, gap: 15, zIndex: 2 },
  primaryBtn: { height: 58, borderRadius: 12, overflow: 'hidden' },
  btnGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontFamily: FONTS.heading, fontSize: 24, color: '#000', letterSpacing: 2, paddingHorizontal: 15, includeFontPadding: false },
  secondaryBtn: { height: 58, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { fontFamily: FONTS.heading, fontSize: 24, color: COLORS.gold, letterSpacing: 2, paddingHorizontal: 15, includeFontPadding: false },
});