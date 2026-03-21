import { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { DimensionValue } from 'react-native'
import type { StatName } from '../../types'
import { BORDER_RADIUS, COLORS, FONTS, STAT_COLORS, SPACING } from '../../constants/theme'

export type StatBarProps = {
  statName: StatName
  value: number
  showValue?: boolean
}

function getStatLabelStyle(statName: StatName) {
  switch (statName) {
    case 'STR':
      return styles.statLabelSTR
    case 'INT':
      return styles.statLabelINT
    case 'WIS':
      return styles.statLabelWIS
    case 'VIT':
      return styles.statLabelVIT
    case 'CHA':
      return styles.statLabelCHA
    case 'AGI':
      return styles.statLabelAGI
  }
}

function getStatFillStyle(statName: StatName) {
  switch (statName) {
    case 'STR':
      return styles.statFillSTR
    case 'INT':
      return styles.statFillINT
    case 'WIS':
      return styles.statFillWIS
    case 'VIT':
      return styles.statFillVIT
    case 'CHA':
      return styles.statFillCHA
    case 'AGI':
      return styles.statFillAGI
  }
}

export default function StatBar({ statName, value, showValue = true }: StatBarProps) {
  // Presentation-only guard; core stat math stays in utils.
  const normalized = Math.max(0, Math.min(100, value))
  const fillWidth = (`${normalized}%` as unknown) as DimensionValue

  const dynamicWidthStyle = useMemo(
    () =>
      StyleSheet.create({
        width: { width: fillWidth },
      }),
    [fillWidth]
  )

  const labelStyle = getStatLabelStyle(statName)
  const fillStyle = getStatFillStyle(statName)

  return (
    <View style={styles.card}>
      <View style={styles.speedLines} pointerEvents="none">
        <View style={styles.speedLineA} />
        <View style={styles.speedLineB} />
        <View style={styles.speedLineC} />
      </View>

      <View style={styles.headerRow}>
        <Text style={[styles.statLabelBase, labelStyle]}>{statName}</Text>
        {showValue ? <Text style={styles.valueText}>{Math.round(normalized)}</Text> : null}
      </View>

      <View style={styles.barOuter}>
        <View style={[styles.barFillBase, fillStyle, dynamicWidthStyle.width]} />
        <View style={styles.barGlow} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.gold,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    overflow: 'hidden',
    position: 'relative',
  },

  // Manga speed lines
  speedLines: {
    position: 'absolute',
    top: -20,
    right: -22,
    width: 120,
    height: 60,
    opacity: 0.18,
  },
  speedLineBase: {
    position: 'absolute',
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  speedLineA: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 88,
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    transform: [{ rotate: '-18deg' }],
  },
  speedLineB: {
    position: 'absolute',
    top: 26,
    left: 2,
    width: 96,
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    transform: [{ rotate: '10deg' }],
  },
  speedLineC: {
    position: 'absolute',
    top: 40,
    left: 18,
    width: 70,
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    transform: [{ rotate: '28deg' }],
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },

  statLabelBase: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    letterSpacing: 0.6,
  },
  statLabelSTR: { color: STAT_COLORS.STR },
  statLabelINT: { color: STAT_COLORS.INT },
  statLabelWIS: { color: STAT_COLORS.WIS },
  statLabelVIT: { color: STAT_COLORS.VIT },
  statLabelCHA: { color: STAT_COLORS.CHA },
  statLabelAGI: { color: STAT_COLORS.AGI },

  valueText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  barOuter: {
    height: 12,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    justifyContent: 'center',
  },

  barFillBase: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },

  statFillSTR: { backgroundColor: STAT_COLORS.STR },
  statFillINT: { backgroundColor: STAT_COLORS.INT },
  statFillWIS: { backgroundColor: STAT_COLORS.WIS },
  statFillVIT: { backgroundColor: STAT_COLORS.VIT },
  statFillCHA: { backgroundColor: STAT_COLORS.CHA },
  statFillAGI: { backgroundColor: STAT_COLORS.AGI },

  barGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 1,
    height: 4,
    backgroundColor: COLORS.gold,
    opacity: 0.12,
    borderRadius: BORDER_RADIUS.full,
  },
})

