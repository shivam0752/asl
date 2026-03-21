import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function Splash() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) router.replace('/(tabs)/');
  }, [user]);

  return (
    <View style={styles.container}>
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
      <View style={styles.center}>
        <Text style={styles.appName}>LEVELUP</Text>
        <Text style={styles.tagline}>Your real life. Leveled up.</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/signup')}
        >
          <Text style={styles.primaryButtonText}>GET STARTED</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.secondaryButtonText}>LOG IN</Text>
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
    backgroundColor: COLORS.gold,
    height: 52,
    borderRadius: 10,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  secondaryButtonText: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.gold,
    letterSpacing: 2,
  },
});