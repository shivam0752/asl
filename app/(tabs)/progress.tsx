import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useCharacter } from '../../hooks/useCharacter';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, STAT_COLORS } from '../../constants/theme';
import { calculateTotalStat } from '../../utils/statAlgorithm';
import { StatName } from '../../types';

const STAT_ORDER: StatName[] = ['STR', 'INT', 'WIS', 'VIT', 'CHA', 'AGI'];
type Period = '7D' | '30D' | '90D';

export default function Progress() {
  const { user } = useAuth();
  const { character, stats, loading } = useCharacter(user?.id);
  const [period, setPeriod] = useState<Period>('30D');

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
        <Text style={styles.emptyText}>No data yet</Text>
      </View>
    );
  }

  const careerXp  = character.careerXp;
  const fitnessXp = character.fitnessXp;
  const totalXp   = character.totalXp;
  const maxXP     = Math.max(careerXp, fitnessXp, 1);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>PROGRESS</Text>

      {/* Period selector */}
      <View style={styles.periodRow}>
        {(['7D', '30D', '90D'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[
                styles.periodBtnText,
                period === p && styles.periodBtnTextActive,
              ]}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stat growth tiles */}
      <Text style={styles.sectionTitle}>STAT GROWTH</Text>
      <View style={styles.statGrid}>
        {STAT_ORDER.map((statName) => {
          const stat  = stats.find((s) => s.statName === statName);
          const value = stat ? calculateTotalStat(stat.baseScore, stat.activeScore) : 0;
          const color = STAT_COLORS[statName];

          return (
            <View key={statName} style={[styles.statTile, { borderTopColor: color }]}>
              <Text style={styles.statTileName}>{statName}</Text>
              <Text style={[styles.statTileValue, { color }]}>{value}</Text>
              <Text style={styles.statTileChange}>+0 this period</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.divider} />

      {/* XP History */}
      <Text style={styles.sectionTitle}>XP BREAKDOWN</Text>

      <View style={styles.xpBreakdown}>
        {/* Career XP */}
        <View style={styles.xpRow}>
          <Text style={styles.xpRowLabel}>Career XP</Text>
          <View style={styles.xpRowBarBg}>
            <View
              style={[
                styles.xpRowBarFill,
                {
                  width: `${(careerXp / maxXP) * 100}%`,
                  backgroundColor: COLORS.gold,
                },
              ]}
            />
          </View>
          <Text style={styles.xpRowValue}>{careerXp}</Text>
        </View>

        {/* Fitness XP */}
        <View style={styles.xpRow}>
          <Text style={styles.xpRowLabel}>Fitness XP</Text>
          <View style={styles.xpRowBarBg}>
            <View
              style={[
                styles.xpRowBarFill,
                {
                  width: `${(fitnessXp / maxXP) * 100}%`,
                  backgroundColor: COLORS.success,
                },
              ]}
            />
          </View>
          <Text style={styles.xpRowValue}>{fitnessXp}</Text>
        </View>

        {/* Total */}
        <View style={styles.totalXpRow}>
          <Text style={styles.totalXpLabel}>Total XP</Text>
          <Text style={styles.totalXpValue}>{totalXp}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  pageTitle: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    color: COLORS.gold,
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  periodRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
    justifyContent: 'center',
  },
  periodBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodBtnActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  periodBtnText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  periodBtnTextActive: {
    color: '#000000',
  },
  sectionTitle: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statTile: {
    width: '30%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderTopWidth: 3,
    gap: 4,
  },
  statTileName: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statTileValue: {
    fontFamily: FONTS.heading,
    fontSize: 28,
  },
  statTileChange: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.success,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  xpBreakdown: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  xpRowLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.textSecondary,
    width: 80,
  },
  xpRowBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  xpRowBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
    minWidth: 4,
  },
  xpRowValue: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.textPrimary,
    width: 40,
    textAlign: 'right',
  },
  totalXpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  totalXpLabel: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  totalXpValue: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    color: COLORS.gold,
  },
});