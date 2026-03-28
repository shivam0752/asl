import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useCharacter } from '../../hooks/useCharacter';
import { COLORS, FONTS, SPACING, STAT_COLORS } from '../../constants/theme';
import { calculateTotalStat } from '../../utils/statAlgorithm';
import { calculatePrestigeXP } from '../../utils/xpEngine';
import { StatName } from '../../types';
import StatRadar from '../../components/ui/StatRadar';

const STAT_ORDER: StatName[] = ['STR', 'INT', 'WIS', 'VIT', 'CHA', 'AGI'];

export default function Progress() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { character, stats, loading } = useCharacter(user?.id);

  if (loading) return (
    <View style={styles.loadingContainer}><ActivityIndicator color={COLORS.gold} size="large" /></View>
  );

  if (!character) return (
    <View style={styles.loadingContainer}><Text style={styles.emptyText}>SYNC DATA TO ACTIVATE HUD</Text></View>
  );

  // ALS Prestige Logic
  const prestigeXP = calculatePrestigeXP(character.totalXp);
  const isMaxLevel = character.level >= 50;

  const radarData = STAT_ORDER.map(statName => {
    const stat = stats.find(s => s.statName === statName);
    return {
      name: statName,
      value: stat ? calculateTotalStat(stat.baseScore, stat.activeScore) : 0
    };
  });

  return (
    <View style={styles.mainWrapper}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[
          styles.contentContainer, 
          { paddingTop: insets.top + 20 } // Hardware notch clearance
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>NEURAL MAP</Text>

        {/* SYSTEM OVERLOAD / PRESTIGE HUD */}
        {isMaxLevel && (
          <View style={styles.prestigeCard}>
            <View style={styles.prestigeHeader}>
              <Text style={styles.prestigeTag}>[ STATUS: SYSTEM OVERLOAD ]</Text>
              <View style={styles.goldPulse} />
            </View>
            <Text style={styles.prestigeValue}>+{prestigeXP.toLocaleString()} PRESTIGE XP</Text>
            <Text style={styles.prestigeNote}>MAX LEVEL REACHED. ACCUMULATING AETHER DATA.</Text>
          </View>
        )}

        {/* RADAR HUD SECTION */}
        <View style={styles.radarCard}>
          <Text style={styles.radarTitle}>CHARACTER POTENTIAL</Text>
          <StatRadar data={radarData} />
        </View>

        {/* STAT GRID */}
        <View style={styles.statGrid}>
          {radarData.map((item) => (
            <View key={item.name} style={styles.statTile}>
              <View style={[styles.statDot, { backgroundColor: STAT_COLORS[item.name as StatName] }]} />
              <Text style={styles.statTileName}>{item.name}</Text>
              <Text style={[styles.statTileValue, { color: STAT_COLORS[item.name as StatName] }]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* PATH DOMINANCE */}
        <View style={styles.pathCard}>
          <Text style={styles.sectionHeader}>PATH DOMINANCE</Text>
          <View style={styles.xpRow}>
            <Text style={styles.pathLabel}>CAREER STREAM</Text>
            <Text style={styles.pathValue}>{character.careerXp.toLocaleString()} XP</Text>
          </View>
          <View style={styles.xpRow}>
            <Text style={styles.pathLabel}>FITNESS STREAM</Text>
            <Text style={styles.pathValue}>{character.fitnessXp.toLocaleString()} XP</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#0D0D0D' },
  container: { flex: 1 },
  contentContainer: { padding: SPACING.lg, paddingBottom: 100 },
  loadingContainer: { flex: 1, backgroundColor: '#0D0D0D', justifyContent: 'center', alignItems: 'center' },
  pageTitle: { 
    fontFamily: FONTS.heading, 
    fontSize: 14, 
    color: COLORS.gold, 
    letterSpacing: 4, 
    textAlign: 'center', 
    marginBottom: 20,
    includeFontPadding: false 
  },
  prestigeCard: {
    backgroundColor: 'rgba(245,197,66,0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.3)',
    marginBottom: 20,
    alignItems: 'center'
  },
  prestigeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  prestigeTag: { fontFamily: FONTS.heading, fontSize: 10, color: COLORS.gold, letterSpacing: 2 },
  goldPulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.gold },
  prestigeValue: { fontFamily: FONTS.heading, fontSize: 24, color: '#FFF', letterSpacing: 1 },
  prestigeNote: { fontFamily: FONTS.bodyBold, fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 8, letterSpacing: 1 },
  radarCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 20
  },
  radarTitle: { fontFamily: FONTS.heading, fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 10 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statTile: {
    width: '31%',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  statDot: { width: 4, height: 4, borderRadius: 2, marginBottom: 6 },
  statTileName: { fontFamily: FONTS.body, fontSize: 10, color: 'rgba(255,255,255,0.3)' },
  statTileValue: { fontFamily: FONTS.heading, fontSize: 20, paddingHorizontal: 4, includeFontPadding: false },
  pathCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sectionHeader: { fontFamily: FONTS.heading, fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 15, letterSpacing: 2 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  pathLabel: { fontFamily: FONTS.bodyBold, fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 },
  pathValue: { fontFamily: FONTS.heading, fontSize: 14, color: '#FFF' },
  emptyText: { fontFamily: FONTS.heading, color: COLORS.gold, fontSize: 12 }
});