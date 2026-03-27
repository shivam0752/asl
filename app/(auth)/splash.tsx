import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function Splash() {
  const router = useRouter();
  const { user } = useAuth();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (user) router.replace('/(tabs)/');
  }, [user]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: -10,
            duration: 1800,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.85,
            duration: 1800,
            useNativeDriver: false,
          }),
        ]),
      ])
    ).start();
  }, [floatAnim, glowAnim]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#151515', '#0D0D0D', '#050505']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bgGradient}
      />

      <Animated.View style={[styles.topGlow, { opacity: glowAnim }]}>
        <LinearGradient
          colors={['rgba(245,197,66,0.35)', 'rgba(245,197,66,0.06)', 'rgba(13,13,13,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.topGlowGradient}
        />
      </Animated.View>

      {/* Speed lines decoration */}
      {[...Array(8)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.speedLine,
            {
              transform: [{ rotate: `${i * 22.5}deg` }],
              opacity: 0.06,
            },
          ]}
        />
      ))}

      {/* Center content */}
      <Animated.View style={[styles.center, { transform: [{ translateY: floatAnim }] }]}>
        <Text style={styles.appName}>LEVELUP</Text>
        <Text style={styles.tagline}>Your real life. Leveled up.</Text>
      </Animated.View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/signup')}
        >
          <LinearGradient
            colors={['#F5C542', '#FFDA73']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.primaryButtonGradient}
          >
            <Text style={styles.primaryButtonText}>GET STARTED</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <LinearGradient
            colors={['rgba(245,197,66,0.22)', 'rgba(245,197,66,0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.secondaryButtonGradient}
          >
            <Text style={styles.secondaryButtonText}>LOG IN</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  topGlow: {
    position: 'absolute',
    top: -40,
    left: -40,
    right: -40,
    height: 260,
    pointerEvents: 'none',
  },
  topGlowGradient: {
    flex: 1,
  },
  speedLine: {
    position: 'absolute',
    width: 2,
    height: height * 1.5,
    backgroundColor: COLORS.gold,
    top: -height * 0.25,
    left: width / 2,
  },
  center: {
    alignItems: 'center',
    marginBottom: 80,
  },
  appName: {
    fontFamily: FONTS.heading,
    fontSize: 72,
    color: COLORS.gold,
    letterSpacing: 4,
  },
  tagline: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  buttons: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    paddingHorizontal: 32,
    gap: 12,
  },
  primaryButton: {
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
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
  secondaryButton: {
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(245,197,66,0.45)',
  },
  secondaryButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.gold,
    letterSpacing: 2,
  },
});