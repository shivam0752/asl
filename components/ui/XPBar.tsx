import { useMemo } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import type { DimensionValue } from 'react-native'
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme'
import { calculateLevel, xpProgressPercent, xpToNextLevel } from '../../utils/xpEngine'

export type XPBarProps = {
  totalXp: number
  loading?: boolean
  error?: string | null
  showNumbers?: boolean
}

export default function XPBar({
  totalXp,
  loading = false,
  error = null,
  showNumbers = true,
}: XPBarProps) {
  const currentLevel = useMemo(() => calculateLevel(totalXp), [totalXp])
  const percent = useMemo(() => xpProgressPercent(totalXp), [totalXp])
  const xpRemaining = useMemo(() => xpToNextLevel(totalXp), [totalXp])

  const normalizedPercent = Math.max(0, Math.min(100, percent))
  const fillWidth = (`${normalizedPercent}%` as unknown) as DimensionValue

  const dynamicFillStyle = useMemo(
    () =>
      StyleSheet.create({
        fillWidth: { width: fillWidth },
      }),
    [fillWidth]
  )

  return (
    <View style={styles.card}>
      <View style={styles.speedLines} pointerEvents="none">
        <View style={styles.lineA} />
        <View style={styles.lineB} />
        <View style={styles.lineC} />
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.label}>XP</Text>
        <View style={styles.levelRow}>
          {showNumbers ? <Text style={styles.levelText}>Lv {currentLevel}</Text> : null}
          {showNumbers ? <Text style={styles.remainingText}>{xpRemaining} to next</Text> : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={COLORS.gold} />
          <Text style={styles.loadingText}>Updating</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.barOuter}>
          <View style={[styles.barFill, dynamicFillStyle.fillWidth]} />
          <View style={styles.barGlow} />
          {showNumbers ? <Text style={styles.percentText}>{normalizedPercent}%</Text> : null}
        </View>
      )}
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
  },

  speedLines: {
    position: 'absolute',
    top: -18,
    left: -26,
    width: 140,
    height: 64,
    opacity: 0.18,
  },
  lineA: {
    position: 'absolute',
    top: 14,
    left: 18,
    width: 120,
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    transform: [{ rotate: '-16deg' }],
  },
  lineB: {
    position: 'absolute',
    top: 30,
    left: 2,
    width: 132,
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    transform: [{ rotate: '6deg' }],
  },
  lineC: {
    position: 'absolute',
    top: 44,
    left: 22,
    width: 102,
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    transform: [{ rotate: '18deg' }],
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },

  label: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.textPrimary,
    letterSpacing: 0.6,
  },

  levelRow: {
    alignItems: 'flex-end',
  },

  levelText: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.gold,
    letterSpacing: 1,
    marginBottom: 2,
  },

  remainingText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },

  loadingText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  errorText: {
    fontFamily: FONTS.body,
    color: COLORS.error,
    fontSize: 13,
    paddingTop: SPACING.xs,
  },

  barOuter: {
    height: 16,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    justifyContent: 'center',
  },

  barFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gold,
  },

  barGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 1,
    height: 6,
    backgroundColor: COLORS.gold,
    opacity: 0.14,
    borderRadius: BORDER_RADIUS.full,
  },

  percentText: {
    position: 'absolute',
    right: 8,
    top: -3,
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.textPrimary,
    letterSpacing: 0.4,
  },
})

