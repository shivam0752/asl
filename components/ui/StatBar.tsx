import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Easing, Platform } from 'react-native';
import type { StatName } from '../../types';
import { BORDER_RADIUS, COLORS, FONTS, STAT_COLORS, SPACING } from '../../constants/theme';

export type StatBarProps = {
  statName: StatName;
  value: number;
  showValue?: boolean;
};

export default function StatBar({ statName, value, showValue = true }: StatBarProps) {
  // Start at 0 for the "Power Up" animation effect on mount
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const normalizedValue = Math.max(0, Math.min(100, value));

  useEffect(() => {
    // FIX: Removed the .current from the end of .start()
    Animated.timing(animatedWidth, {
      toValue: normalizedValue,
      duration: 1200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const statColor = STAT_COLORS[statName] || COLORS.gold;

  return (
    <View style={styles.card}>
      {/* Decorative RPG Speed Lines */}
      <View style={styles.speedLines} pointerEvents="none">
        <View style={[styles.speedLineA, { backgroundColor: statColor }]} />
        <View style={[styles.speedLineB, { backgroundColor: statColor }]} />
      </View>

      <View style={styles.headerRow}>
        <View style={styles.labelContainer}>
          <View style={[styles.typeIndicator, { backgroundColor: statColor }]} />
          <Text style={[styles.statLabel, { color: statColor }]}>{statName}</Text>
        </View>
        
        {showValue && (
          <View style={styles.valueBadge}>
            <Text style={styles.valueText}>{Math.round(normalizedValue)}</Text>
          </View>
        )}
      </View>

      <View style={styles.barContainer}>
        <View style={styles.barTrack}>
          <Animated.View 
            style={[
              styles.barFill, 
              { 
                width: widthInterpolation, 
                backgroundColor: statColor,
              }
            ]} 
          />
          {/* Subtle highlight for a metallic/glass look */}
          <View style={styles.innerGlow} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      }
    })
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeIndicator: {
    width: 3,
    height: 14,
    borderRadius: 2,
  },
  statLabel: {
    fontFamily: FONTS.heading,
    fontSize: 14,
    letterSpacing: 1.5,
  },
  valueBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  valueText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    color: '#FFF',
  },
  barContainer: {
    width: '100%',
  },
  barTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  innerGlow: {
    position: 'absolute',
    top: 1,
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
  },
  speedLines: {
    position: 'absolute',
    right: -10,
    top: -5,
    width: 80,
    height: 30,
    opacity: 0.15,
  },
  speedLineA: {
    position: 'absolute',
    top: 10,
    right: 0,
    width: 50,
    height: 1,
    transform: [{ rotate: '-12deg' }],
  },
  speedLineB: {
    position: 'absolute',
    top: 20,
    right: 5,
    width: 35,
    height: 1,
    transform: [{ rotate: '-8deg' }],
  },
});