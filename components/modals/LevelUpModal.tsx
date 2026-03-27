import { useMemo } from 'react'
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import type { DimensionValue } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, FONTS, SPACING, BORDER_RADIUS, STAT_COLORS } from '../../constants/theme'
import type { StatName } from '../../types'
import { calculateLevelThreshold, xpToNextLevel, xpProgressPercent } from '../../utils/xpEngine'

export type StatIncrease = {
  statName: StatName
  delta: number
}

export type LevelUpModalProps = {
  visible: boolean
  onClose: () => void
  currentLevel: number | null
  newLevel: number | null
  totalXp: number | null
  statIncreases?: StatIncrease[] | null
  loading?: boolean
  error?: string | null
}

function formatDelta(delta: number) {
  const rounded = Math.round(delta)
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded}`
}

function formatThreshold(level: number) {
  return calculateLevelThreshold(level)
}

function statColor(statName: StatName) {
  switch (statName) {
    case 'STR':
      return STAT_COLORS.STR
    case 'INT':
      return STAT_COLORS.INT
    case 'WIS':
      return STAT_COLORS.WIS
    case 'VIT':
      return STAT_COLORS.VIT
    case 'CHA':
      return STAT_COLORS.CHA
    case 'AGI':
      return STAT_COLORS.AGI
  }
}

function statColorStyle(statName: StatName) {
  switch (statName) {
    case 'STR':
      return styles.statNameSTR
    case 'INT':
      return styles.statNameINT
    case 'WIS':
      return styles.statNameWIS
    case 'VIT':
      return styles.statNameVIT
    case 'CHA':
      return styles.statNameCHA
    case 'AGI':
      return styles.statNameAGI
  }
}

export default function LevelUpModal({
  visible,
  onClose,
  currentLevel,
  newLevel,
  totalXp,
  statIncreases = null,
  loading = false,
  error = null,
}: LevelUpModalProps) {
  const safeTotalXp = totalXp ?? 0
  const progressPercent = useMemo(() => xpProgressPercent(safeTotalXp), [safeTotalXp])
  const xpRemaining = useMemo(() => xpToNextLevel(safeTotalXp), [safeTotalXp])
  const fillWidth = (`${progressPercent}%` as unknown) as DimensionValue

  const dynamicFillStyle = useMemo(
    () =>
      StyleSheet.create({
        width: { width: fillWidth },
      }),
    [fillWidth]
  )

  const prevLevel = currentLevel ?? null
  const nextLevel = newLevel ?? null

  const currentThreshold = prevLevel !== null ? formatThreshold(prevLevel) : null
  const nextThreshold = nextLevel !== null ? formatThreshold(nextLevel) : null

  const hasDetails = nextLevel !== null && prevLevel !== null && currentThreshold !== null && nextThreshold !== null

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.decor}>
          <View style={styles.decorLineA} />
          <View style={styles.decorLineB} />
          <View style={styles.decorLineC} />
        </View>

        <View style={styles.card}>
          <LinearGradient
            colors={['#1C1C1C', '#161616', '#111111']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          />
          <View style={styles.headerRow}>
            <Text style={styles.title}>LEVEL UP</Text>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close">
              <Text style={styles.closeBtnText}>X</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerBlock}>
              <ActivityIndicator color={COLORS.gold} />
              <Text style={styles.loadingText}>Reforging your power…</Text>
            </View>
          ) : error ? (
            <View style={styles.centerBlock}>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.hintText}>Try again later.</Text>
            </View>
          ) : nextLevel === null || prevLevel === null ? (
            <View style={styles.centerBlock}>
              <Text style={styles.errorText}>Level details are missing.</Text>
            </View>
          ) : (
            <View style={styles.body}>
              <Text style={styles.mainText}>
                You reached Lv {nextLevel}!
              </Text>

              <View style={styles.progressWrap}>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressValue}>{progressPercent}%</Text>
                </View>

                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, dynamicFillStyle.width]} />
                  <View style={styles.progressGlow} />
                </View>

                <Text style={styles.remainingText}>{xpRemaining} XP to next level</Text>
              </View>

              {hasDetails ? (
                <View style={styles.thresholdBox}>
                  <Text style={styles.thresholdText}>
                    Thresholds: {currentThreshold} → {nextThreshold}
                  </Text>
                </View>
              ) : null}

              {statIncreases && statIncreases.length > 0 ? (
                <View style={styles.statList}>
                  {statIncreases.map((inc) => (
                    <View key={inc.statName} style={styles.statRow}>
                      <Text style={[styles.statName, statColorStyle(inc.statName)]}>{inc.statName}</Text>
                      <Text style={[styles.statDelta, inc.delta >= 0 ? styles.deltaPositive : styles.deltaNegative]}>
                        {formatDelta(inc.delta)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noStatsText}>Your stats sharpened across the board.</Text>
              )}

              <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
                <LinearGradient
                  colors={['#F5C542', '#FFDA73']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8,8,8,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },

  decor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    overflow: 'hidden',
    opacity: 0.25,
    pointerEvents: 'none',
  },

  decorLineA: {
    position: 'absolute',
    top: 40,
    left: -40,
    width: 2,
    height: 140,
    backgroundColor: COLORS.gold,
    transform: [{ rotate: '-18deg' }],
  },

  decorLineB: {
    position: 'absolute',
    top: 20,
    left: 120,
    width: 2,
    height: 170,
    backgroundColor: COLORS.gold,
    transform: [{ rotate: '-6deg' }],
  },

  decorLineC: {
    position: 'absolute',
    top: 55,
    left: 240,
    width: 2,
    height: 120,
    backgroundColor: COLORS.gold,
    transform: [{ rotate: '12deg' }],
  },

  card: {
    width: '100%',
    backgroundColor: '#151515',
    borderColor: COLORS.gold,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    overflow: 'hidden',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },

  title: {
    fontFamily: FONTS.heading,
    color: COLORS.gold,
    fontSize: 22,
    letterSpacing: 1.4,
  },

  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeBtnText: {
    fontFamily: FONTS.heading,
    color: COLORS.gold,
    fontSize: 18,
    letterSpacing: 1,
  },

  centerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },

  loadingText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },

  errorText: {
    fontFamily: FONTS.body,
    color: COLORS.error,
    fontSize: 13,
    textAlign: 'center',
  },

  hintText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },

  body: {
    gap: SPACING.md,
  },

  mainText: {
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
    fontSize: 26,
    letterSpacing: 1,
    textAlign: 'center',
  },

  progressWrap: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressLabel: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  progressValue: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.gold,
    fontSize: 14,
  },

  progressBar: {
    height: 14,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },

  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gold,
  },

  progressGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 1,
    height: 6,
    backgroundColor: COLORS.gold,
    opacity: 0.14,
    borderRadius: BORDER_RADIUS.full,
  },

  remainingText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },

  thresholdBox: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },

  thresholdText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },

  statList: {
    gap: SPACING.xs,
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    paddingBottom: SPACING.xs,
  },

  statName: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    letterSpacing: 0.8,
  },
  statNameSTR: { color: STAT_COLORS.STR },
  statNameINT: { color: STAT_COLORS.INT },
  statNameWIS: { color: STAT_COLORS.WIS },
  statNameVIT: { color: STAT_COLORS.VIT },
  statNameCHA: { color: STAT_COLORS.CHA },
  statNameAGI: { color: STAT_COLORS.AGI },

  statDelta: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
  },

  deltaPositive: {
    color: COLORS.success,
  },

  deltaNegative: {
    color: COLORS.error,
  },

  noStatsText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },

  primaryButton: {
    height: 54,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    fontFamily: FONTS.heading,
    color: COLORS.background,
    fontSize: 18,
    letterSpacing: 1.2,
  },
})

