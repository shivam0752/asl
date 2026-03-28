import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../constants/theme';

const { width } = Dimensions.get('window');

interface LevelUpModalProps {
  visible: boolean;
  level: number;
  onClose: () => void;
}

export default function LevelUpModal({ visible, level, onClose }: LevelUpModalProps) {
  // Animation Values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // TRIGGER HAPTIC FEEDBACK HERE (e.g., Haptics.notificationAsync)
      
      Animated.parallel([
        // Main Card Pop
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        // Fade in background
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Shockwave Ring
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      ringAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.backgroundBlur, { opacity: opacityAnim }]} />
        
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
          {/* Shockwave Ring Effect */}
          <Animated.View 
            style={[
              styles.ring, 
              { 
                transform: [{ scale: ringAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.5] }) }],
                opacity: ringAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.4, 0] })
              }
            ]} 
          />

          <View style={styles.content}>
            <Text style={styles.title}>LEVEL ASCENDED</Text>
            
            <View style={styles.levelCircle}>
              <Text style={styles.levelLabel}>NEW LEVEL</Text>
              <Text style={styles.levelNumber}>{level}</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>Your neural capacity has increased.</Text>
              <Text style={styles.statBonus}>+2 STAT POINTS UNLOCKED</Text>
            </View>

            <TouchableOpacity style={styles.ctaButton} onPress={onClose}>
              <Text style={styles.ctaText}>CONTINUE JOURNEY</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  backgroundBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.gold,
    opacity: 0.1,
  },
  container: {
    width: width * 0.85,
    backgroundColor: '#1A1A1A',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.gold,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 40,
    ...Platform.select({
      android: { elevation: 20 },
      ios: { shadowColor: COLORS.gold, shadowOpacity: 0.5, shadowRadius: 30 }
    })
  },
  ring: {
    position: 'absolute',
    top: '15%',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: COLORS.gold,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.gold,
    letterSpacing: 4,
    marginBottom: 30,
  },
  levelCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  levelLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  levelNumber: {
    fontFamily: FONTS.heading,
    fontSize: 54,
    color: '#FFF',
    lineHeight: 60,
  },
  infoBox: {
    alignItems: 'center',
    marginBottom: 40,
  },
  infoText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  statBonus: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.gold,
    marginTop: 8,
    letterSpacing: 1,
  },
  ctaButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: '#000',
    letterSpacing: 1,
  },
});