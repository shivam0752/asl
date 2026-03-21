import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const MESSAGES = [
  'Analyzing your career...',
  'Calculating your strength...',
  'Mapping your potential...',
  'Your character is awakening...',
  'Almost ready...',
];

export default function Generating() {
  const router = useRouter();
  const spinValue = useRef(new Animated.Value(0)).current;
  const [messageIndex, setMessageIndex] = useState(0);

  // Spin animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Cycle messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) =>
        prev < MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Auto navigate
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(onboarding)/class-reveal');
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Speed lines */}
      {[...Array(10)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.speedLine,
            { transform: [{ rotate: `${i * 18}deg` }] },
          ]}
        />
      ))}

      {/* Spinner ring */}
      <Animated.View
        style={[styles.ring, { transform: [{ rotate: spin }] }]}
      />

      {/* Inner ring static */}
      <View style={styles.innerRing} />

      {/* Message */}
      <Text style={styles.message}>{MESSAGES[messageIndex]}</Text>

      {/* Progress dots */}
      <View style={styles.dots}>
        {MESSAGES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i <= messageIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedLine: {
    position: 'absolute',
    width: 1.5,
    height: height * 1.5,
    backgroundColor: COLORS.gold,
    opacity: 0.05,
    top: -height * 0.25,
    left: width / 2,
  },
  ring: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.gold,
    borderTopColor: 'transparent',
    marginBottom: 20,
  },
  innerRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: COLORS.gold,
    opacity: 0.3,
  },
  message: {
    fontFamily: FONTS.body,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginTop: 24,
    letterSpacing: 0.5,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2A2A2A',
  },
  dotActive: {
    backgroundColor: COLORS.gold,
  },
});