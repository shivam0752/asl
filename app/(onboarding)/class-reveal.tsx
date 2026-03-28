import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useCharacter } from '../../hooks/useCharacter';
import { getClassName, getClassDescription } from '../../constants/classes';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, STAT_COLORS } from '../../constants/theme';
import { calculateTotalStat } from '../../utils/statAlgorithm';
import { StatName, ClassArchetype, Tier } from '../../types';

const { width, height } = Dimensions.get('window');
const STAT_ORDER: StatName[] = ['STR', 'INT', 'WIS', 'VIT', 'CHA', 'AGI'];

export default function ClassReveal() {
  const router = useRouter();
  const { user } = useAuth();
  const { character, stats, loading } = useCharacter(user?.id);

  // Animation Controllers
  const cardScale = useRef(new Animated.Value(0.5)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const burstAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading && character) {
      Animated.sequence([
        Animated.timing(burstAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.spring(cardScale, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(cardOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, character]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.gold} size="large" />
        <Text style={styles.loadingText}>ANALYZING NEURAL DATA...</Text>
      </View>
    );
  }

  // --- TYPE FIX START ---
  // Casting to 'as ClassArchetype' ensures TS knows these are valid keys
  const characterClass = (character?.class as ClassArchetype) || ('WARRIOR' as ClassArchetype);
  const characterTier = (character?.tier as Tier) || ('Basic' as Tier);

  const className = getClassName(characterClass, characterTier);
  const classDesc = getClassDescription(characterClass);
  // --- TYPE FIX END ---

  return (
    <View style={styles.mainWrapper}>
      <Animated.View 
        style={[
          styles.burstContainer, 
          { opacity: burstAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.15, 0] }) }
        ]}
      >
        {[...Array(16)].map((_, i) => (
          <View key={i} style={[styles.burstLine, { transform: [{ rotate: `${i * 22.5}deg` }] }]} />
        ))}
      </Animated.View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Animated.Text style={[styles.topLabel, { opacity: textOpacity }]}>
          CHARACTER MANIFESTED
        </Animated.Text>

        <Animated.View style={[styles.card, { transform: [{ scale: cardScale }], opacity: cardOpacity }]}>
          <View style={styles.avatarGlow}>
            <Text style={styles.avatarEmoji}>⚔️</Text>
          </View>

          <Text style={styles.classNameText}>{className.toUpperCase()}</Text>
          
          <View style={styles.tierContainer}>
            <Text style={styles.tierText}>{characterTier.toUpperCase()} TIER</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsGrid}>
            {STAT_ORDER.map((statName) => {
              const stat = stats.find((s) => s.statName === statName);
              const value = stat ? calculateTotalStat(stat.baseScore, stat.activeScore) : 0;
              const color = STAT_COLORS[statName];

              return (
                <View key={statName} style={styles.statRow}>
                  <Text style={[styles.statLabel, { color }]}>{statName}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${value}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={styles.statValue}>{value}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: textOpacity, alignItems: 'center', width: '100%' }}>
          <Text style={styles.description}>{classDesc}</Text>
          <TouchableOpacity 
            style={styles.ctaButton} 
            onPress={() => router.replace('/(tabs)/')}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>BEGIN YOUR JOURNEY</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#0D0D0D' },
  contentContainer: { alignItems: 'center', paddingTop: 80, paddingBottom: 50, paddingHorizontal: 25 },
  loadingContainer: { flex: 1, backgroundColor: '#0D0D0D', justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: FONTS.heading, color: COLORS.gold, letterSpacing: 2, marginTop: 20 },
  burstContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  burstLine: { position: 'absolute', width: 2, height: height * 1.5, backgroundColor: COLORS.gold },
  topLabel: { fontFamily: FONTS.bodyBold, fontSize: 10, color: COLORS.gold, letterSpacing: 5, marginBottom: 30 },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.gold,
    padding: 25,
    alignItems: 'center',
    marginBottom: 30,
    ...Platform.select({
      android: { elevation: 10 },
      ios: { shadowColor: COLORS.gold, shadowOpacity: 0.3, shadowRadius: 20 }
    })
  },
  avatarGlow: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  avatarEmoji: { fontSize: 40 },
  classNameText: { fontFamily: FONTS.heading, fontSize: 30, color: '#FFF', letterSpacing: 2, textAlign: 'center' },
  tierContainer: { backgroundColor: COLORS.gold, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, marginTop: 10 },
  tierText: { fontFamily: FONTS.heading, fontSize: 11, color: '#000' },
  divider: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 25 },
  statsGrid: { width: '100%', gap: 10 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statLabel: { fontFamily: FONTS.bodyBold, fontSize: 11, width: 35 },
  barTrack: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  statValue: { fontFamily: FONTS.bodyBold, fontSize: 11, color: '#FFF', width: 30, textAlign: 'right' },
  description: { fontFamily: FONTS.body, fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 20, marginBottom: 40, paddingHorizontal: 10 },
  ctaButton: { backgroundColor: COLORS.gold, paddingVertical: 18, borderRadius: 12, width: '100%', alignItems: 'center' },
  ctaText: { fontFamily: FONTS.heading, fontSize: 18, color: '#000', letterSpacing: 2 },
});