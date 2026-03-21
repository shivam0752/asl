import { useMemo } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { calculateTotalStat } from '../../utils/statAlgorithm'
import type { Character, Stat, StatName } from '../../types'
import { getClassDescription, getClassName } from '../../constants/classes'
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme'
import StatBar from './StatBar'

export type CharacterCardProps = {
  character?: Character | null
  stats?: Stat[] | null
  loading?: boolean
  error?: string | null
}

const STAT_ORDER: StatName[] = ['STR', 'INT', 'WIS', 'VIT', 'CHA', 'AGI']

export default function CharacterCard({
  character,
  stats,
  loading = false,
  error = null,
}: CharacterCardProps) {
  const statsByName = useMemo(() => {
    const next: Partial<Record<StatName, number>> = {}

    for (const s of stats ?? []) {
      next[s.statName] = calculateTotalStat(s.baseScore, s.activeScore)
    }

    return next
  }, [stats])

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={COLORS.gold} />
        <Text style={styles.loadingText}>Powering up…</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  if (!character) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>No character yet</Text>
      </View>
    )
  }

  const classLabel = getClassName(character.class, character.tier)
  const classDescription = getClassDescription(character.class)

  return (
    <View style={styles.card}>
      <View style={styles.glow} />

      <View style={styles.speedLines} pointerEvents="none">
        <View style={styles.speedLineA} />
        <View style={styles.speedLineB} />
        <View style={styles.speedLineC} />
      </View>

      <View style={styles.headerRow}>
        <View style={styles.levelBlock}>
          <Text style={styles.levelLabel}>Level</Text>
          <Text style={styles.levelValue}>Lv {character.level}</Text>
        </View>

        <View style={styles.classBlock}>
          <Text style={styles.classTier}>{character.tier}</Text>
          <Text style={styles.className}>{classLabel}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {classDescription}
      </Text>

      <View style={styles.statsGrid}>
        {STAT_ORDER.map((statName) => (
          <View key={statName} style={styles.statItem}>
            <StatBar statName={statName} value={statsByName[statName] ?? 0} />
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.gold,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: COLORS.gold,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  glow: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gold,
    opacity: 0.08,
  },

  // Manga speed lines
  speedLines: {
    position: 'absolute',
    top: -30,
    right: -40,
    width: 160,
    height: 120,
    opacity: 0.18,
  },
  speedLineA: {
    position: 'absolute',
    top: 14,
    left: 40,
    width: 120,
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    transform: [{ rotate: '-22deg' }],
  },
  speedLineB: {
    position: 'absolute',
    top: 46,
    left: 10,
    width: 140,
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    transform: [{ rotate: '-8deg' }],
  },
  speedLineC: {
    position: 'absolute',
    top: 74,
    left: 36,
    width: 100,
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    transform: [{ rotate: '12deg' }],
  },

  headerRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },

  levelBlock: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },

  levelLabel: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  levelValue: {
    marginTop: SPACING.xs,
    fontFamily: FONTS.heading,
    color: COLORS.gold,
    fontSize: 32,
    letterSpacing: 1,
  },

  classBlock: {
    flex: 1.4,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },

  classTier: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },

  className: {
    marginTop: SPACING.xs,
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
    fontSize: 26,
    letterSpacing: 1,
  },

  description: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },

  statItem: {
    width: '48%',
  },

  loadingText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  errorText: {
    fontFamily: FONTS.body,
    color: COLORS.error,
    fontSize: 13,
    textAlign: 'center',
  },

  emptyText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
})

