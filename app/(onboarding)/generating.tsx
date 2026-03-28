import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const MESSAGES = [
  'INITIALIZING ALS CORE...',
  'SYNCING CAREER DATA...',
  'MEASURING BIOMETRIC STRENGTH...',
  'MAPPING NEURAL POTENTIAL...',
  'MANIFESTING IDENTITY...',
];

export default function Generating() {
  const router = useRouter();
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0.8)).current;
  const [messageIndex, setMessageIndex] = useState(0);

  // Rotate Animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Pulse Animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0.8,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Cycle Messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev < MESSAGES.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  // Auto Navigate
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(onboarding)/class-reveal');
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const counterSpin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D0D0D', '#151515']} style={StyleSheet.absoluteFill} />

      {/* BACKGROUND LOGO - Faint brand presence */}
      <View style={styles.logoBgWrapper}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logoBg}
          resizeMode="contain"
        />
      </View>

      <View style={styles.visualizerContainer}>
        {/* OUTER ROTATING RING */}
        <Animated.View style={[styles.outerRing, { transform: [{ rotate: spin }] }]} />

        {/* INNER COUNTER-ROTATING RING */}
        <Animated.View style={[styles.innerRing, { transform: [{ rotate: counterSpin }, { scale: pulseValue }] }]} />

        <View style={styles.centerPoint}>
          <Text style={styles.centerText}>ALS</Text>
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.messageText}>{MESSAGES[messageIndex]}</Text>
        
        {/* PROGRESS BAR (Tactical style) */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${((messageIndex + 1) / MESSAGES.length) * 100}%` }]} />
        </View>

        <Text style={styles.statusText}>[ ENCRYPTING NEURAL LINK... ]</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBgWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.1,
  },
  logoBg: {
    width: width * 0.8,
    height: width * 0.8,
  },
  visualizerContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  outerRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  innerRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  centerPoint: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderWidth: 1,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  centerText: {
    fontFamily: FONTS.heading,
    color: COLORS.gold,
    fontSize: 14,
    letterSpacing: 2,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  messageText: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: '#FFF',
    letterSpacing: 2,
    marginBottom: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
  progressBarBg: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
  },
  statusText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 10,
    color: COLORS.gold,
    opacity: 0.5,
    letterSpacing: 4,
  },
});