import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useCharacter } from '../../hooks/useCharacter';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, STAT_COLORS } from '../../constants/theme';
import { calculateTotalStat } from '../../utils/statAlgorithm';
import { xpProgressPercent, xpToNextLevel } from '../../utils/xpEngine';
import { getClassName } from '../../constants/classes';
import { StatName } from '../../types';

const STAT_ORDER: StatName[] = ['STR', 'INT', 'WIS', 'VIT', 'CHA', 'AGI'];

export default function Character() {
  const router                              = useRouter();
  const { user }                            = useAuth();
  const { character, stats, loading, refetch } = useCharacter(user?.id);
  const [selectedStat, setSelectedStat]     = useState<StatName | null>(null);

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.gold} size="large" />
      </View>
    );
  }

  if (!character) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.noCharText}>No character found</Text>
      </View>
    );
  }

  const className = getClassName(character.class, character.tier);
  const percent   = xpProgressPercent(character.totalXp);
  const toNext    = xpToNextLevel(character.totalXp);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>CHARACTER</Text>

      {/* Character Card */}
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>⚔️</Text>
        </View>

        <Text style={styles.className}>{className}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>{character.tier} Tier</Text>
          </View>
          <Text style={styles.level}>LVL {character.level}</Text>
        </View>

        {/* XP Bar */}
        <View style={styles.xpContainer}>
          <View style={styles.xpLabels}>
            <Text style={styles.xpLabel}>LVL {character.level}</Text>
            <Text style={styles.xpValue}>
              {character.totalXp} / {character.totalXp + toNext} XP
            </Text>
          </View>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${percent}%` }]} />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Stats */}
        <View style={styles.statsContainer}>
          {STAT_ORDER.map((statName) => {
            const stat       = stats.find((s) => s.statName === statName);
            const value      = stat
              ? calculateTotalStat(stat.baseScore, stat.activeScore)
              : 0;
            const color      = STAT_COLORS[statName];
            const isSelected = selectedStat === statName;

            return (
              <TouchableOpacity
                key={statName}
                style={[
                  styles.statRow,
                  isSelected && { backgroundColor: color + '11' },
                ]}
                onPress={() => setSelectedStat(isSelected ? null : statName)}
              >
                <Text style={[styles.statLabel, { color }]}>{statName}</Text>
                <View style={styles.statBarBg}>
                  <View
                    style={[
                      styles.statBarFill,
                      { width: `${value}%`, backgroundColor: color },
                    ]}
                  />
                </View>
                <Text style={styles.statValue}>{value}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Inline stat detail */}
        {selectedStat && (
          <View style={[styles.statDetail, { borderColor: STAT_COLORS[selectedStat] }]}>
            <Text style={[styles.statDetailName, { color: STAT_COLORS[selectedStat] }]}>
              {selectedStat}
            </Text>
            <Text style={styles.statDetailDesc}>
              {STAT_DESCRIPTIONS[selectedStat]}
            </Text>
            <Text style={styles.statDetailTip}>
              💡 {STAT_TIPS[selectedStat]}
            </Text>
          </View>
        )}
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => router.push('/xp-log')}
        >
          <Text style={styles.outlineButtonText}>View XP Log</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const STAT_DESCRIPTIONS: Record<StatName, string> = {
  STR: 'Physical strength and workout consistency.',
  INT: 'Knowledge depth and learning velocity.',
  WIS: 'Experience and accumulated knowledge.',
  VIT: 'Health, energy and physical wellbeing.',
  CHA: 'Network strength and professional influence.',
  AGI: 'Adaptability and career momentum.',
};

const STAT_TIPS: Record<StatName, string> = {
  STR: 'Log 3+ workouts this week to boost STR.',
  INT: 'Add a new certification to boost INT by up to +8.',
  WIS: 'Gain experience in a new industry to increase WIS.',
  VIT: 'Hit your daily step goal 5 days in a row.',
  CHA: 'Ask a colleague for a LinkedIn recommendation.',
  AGI: 'Start a 7-day cardio streak to raise AGI.',
};

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop:        60,
    paddingBottom:     40,
  },
  loadingContainer: {
    flex:            1,
    backgroundColor: COLORS.background,
    alignItems:      'center',
    justifyContent:  'center',
  },
  noCharText: {
    fontFamily: FONTS.body,
    color:      COLORS.textSecondary,
    fontSize:   15,
  },
  pageTitle: {
    fontFamily:    FONTS.heading,
    fontSize:      28,
    color:         COLORS.gold,
    letterSpacing: 4,
    textAlign:     'center',
    marginBottom:  SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius:    BORDER_RADIUS.lg,
    borderWidth:     2,
    borderColor:     COLORS.gold,
    padding:         SPACING.xl,
    alignItems:      'center',
    shadowColor:     COLORS.gold,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.2,
    shadowRadius:    20,
    elevation:       8,
    marginBottom:    SPACING.lg,
  },
  avatar: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: COLORS.background,
    borderWidth:     2,
    borderColor:     COLORS.gold,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    SPACING.md,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  className: {
    fontFamily:    FONTS.heading,
    fontSize:      34,
    color:         COLORS.gold,
    letterSpacing: 2,
    textAlign:     'center',
  },
  badgeRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            SPACING.sm,
    marginTop:      SPACING.sm,
    marginBottom:   SPACING.md,
  },
  tierBadge: {
    borderWidth:       1,
    borderColor:       COLORS.gold,
    borderRadius:      BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical:   3,
  },
  tierText: {
    fontFamily: FONTS.body,
    fontSize:   12,
    color:      COLORS.gold,
  },
  level: {
    fontFamily: FONTS.heading,
    fontSize:   20,
    color:      COLORS.textPrimary,
  },
  xpContainer: {
    width:        '100%',
    marginBottom: SPACING.md,
  },
  xpLabels: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   6,
  },
  xpLabel: {
    fontFamily: FONTS.heading,
    fontSize:   14,
    color:      COLORS.gold,
  },
  xpValue: {
    fontFamily: FONTS.body,
    fontSize:   12,
    color:      COLORS.textSecondary,
  },
  xpBarBg: {
    height:          10,
    backgroundColor: COLORS.background,
    borderRadius:    BORDER_RADIUS.full,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     COLORS.gold + '44',
  },
  xpBarFill: {
    height:       '100%',
    backgroundColor: COLORS.gold,
    borderRadius: BORDER_RADIUS.full,
  },
  divider: {
    width:           '100%',
    height:          1,
    backgroundColor: COLORS.border,
    marginBottom:    SPACING.md,
  },
  statsContainer: {
    width: '100%',
    gap:   SPACING.sm,
  },
  statRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.sm,
    padding:       SPACING.sm,
    borderRadius:  BORDER_RADIUS.sm,
  },
  statLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize:   12,
    width:      32,
  },
  statBarBg: {
    flex:            1,
    height:          8,
    backgroundColor: COLORS.background,
    borderRadius:    BORDER_RADIUS.full,
    overflow:        'hidden',
  },
  statBarFill: {
    height:       '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  statValue: {
    fontFamily: FONTS.bodyBold,
    fontSize:   12,
    color:      COLORS.textPrimary,
    width:      28,
    textAlign:  'right',
  },
  statDetail: {
    width:           '100%',
    marginTop:       SPACING.md,
    padding:         SPACING.md,
    borderRadius:    BORDER_RADIUS.md,
    borderWidth:     1,
    backgroundColor: COLORS.background,
    gap:             SPACING.sm,
  },
  statDetailName: {
    fontFamily:    FONTS.heading,
    fontSize:      18,
    letterSpacing: 2,
  },
  statDetailDesc: {
    fontFamily:  FONTS.body,
    fontSize:    13,
    color:       COLORS.textSecondary,
    lineHeight:  20,
  },
  statDetailTip: {
    fontFamily: FONTS.body,
    fontSize:   13,
    color:      COLORS.gold,
    lineHeight: 20,
  },
  buttonRow: {
    gap: SPACING.md,
  },
  outlineButton: {
    height:         48,
    borderRadius:   BORDER_RADIUS.md,
    alignItems:     'center',
    justifyContent: 'center',
    borderWidth:    1,
    borderColor:    COLORS.gold,
  },
  outlineButtonText: {
    fontFamily: FONTS.bodyBold,
    fontSize:   14,
    color:      COLORS.gold,
  },
});