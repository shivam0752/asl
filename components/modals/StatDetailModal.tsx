import { useMemo } from 'react'
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import type { StatName } from '../../types'
import { calculateTotalStat } from '../../utils/statAlgorithm'
import { COLORS, FONTS, BORDER_RADIUS, SPACING, STAT_COLORS } from '../../constants/theme'

export type StatDetailModalProps = {
  visible: boolean
  onClose: () => void
  statName: StatName | null
  baseScore?: number
  activeScore?: number
  lastUpdated?: string
  loading?: boolean
  error?: string | null
}

function formatDate(iso: string | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString()
}

function statColorStyle(statName: StatName | null) {
  if (!statName) return styles.statNameDefault
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

export default function StatDetailModal({
  visible,
  onClose,
  statName,
  baseScore = 0,
  activeScore = 0,
  lastUpdated,
  loading = false,
  error = null,
}: StatDetailModalProps) {
  const total = useMemo(() => calculateTotalStat(baseScore, activeScore), [baseScore, activeScore])
  const updatedText = useMemo(() => formatDate(lastUpdated), [lastUpdated])
  const nameColor = useMemo(() => statColorStyle(statName), [statName])

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.decor} pointerEvents="none">
          <View style={styles.decorLineA} />
          <View style={styles.decorLineB} />
          <View style={styles.decorLineC} />
        </View>

        <View style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>Stat Detail</Text>
              {statName ? <Text style={[styles.statName, nameColor]}>{statName}</Text> : null}
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close">
              <Text style={styles.closeBtnText}>X</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerBlock}>
              <ActivityIndicator color={COLORS.gold} />
              <Text style={styles.loadingText}>Calculating…</Text>
            </View>
          ) : error ? (
            <View style={styles.centerBlock}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : statName ? (
            <View style={styles.content}>
              <View style={styles.metricsRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Base</Text>
                  <Text style={[styles.metricValue, styles.metricValueGold]}>{Math.round(baseScore)}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Active</Text>
                  <Text style={[styles.metricValue, styles.metricValueGold]}>{Math.round(activeScore)}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Total</Text>
                  <Text style={[styles.metricValue, styles.metricValueMain]}>{Math.round(total)}</Text>
                </View>
              </View>

              {updatedText ? <Text style={styles.updatedText}>Updated: {updatedText}</Text> : null}

              <View style={styles.hintBox}>
                <Text style={styles.hintText}>
                  Total = base (70%) + active (30%) and is capped at 100.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.centerBlock}>
              <Text style={styles.emptyText}>No stat selected.</Text>
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
    backgroundColor: COLORS.background,
    opacity: 0.85,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },

  decor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  decorLineA: {
    position: 'absolute',
    top: 40,
    left: 30,
    width: 2,
    height: 120,
    backgroundColor: COLORS.gold,
    opacity: 0.08,
    transform: [{ rotate: '-18deg' }],
  },
  decorLineB: {
    position: 'absolute',
    top: 20,
    left: 140,
    width: 2,
    height: 140,
    backgroundColor: COLORS.gold,
    opacity: 0.06,
    transform: [{ rotate: '-10deg' }],
  },
  decorLineC: {
    position: 'absolute',
    top: 35,
    left: 240,
    width: 2,
    height: 110,
    backgroundColor: COLORS.gold,
    opacity: 0.04,
    transform: [{ rotate: '6deg' }],
  },

  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.gold,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    overflow: 'hidden',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },

  titleWrap: {
    flex: 1,
  },

  title: {
    fontFamily: FONTS.heading,
    color: COLORS.gold,
    fontSize: 20,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },

  statName: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    letterSpacing: 1.2,
  },
  statNameDefault: {
    color: COLORS.textPrimary,
  },
  statNameSTR: { color: STAT_COLORS.STR },
  statNameINT: { color: STAT_COLORS.INT },
  statNameWIS: { color: STAT_COLORS.WIS },
  statNameVIT: { color: STAT_COLORS.VIT },
  statNameCHA: { color: STAT_COLORS.CHA },
  statNameAGI: { color: STAT_COLORS.AGI },

  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
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

  emptyText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },

  content: {
    gap: SPACING.md,
  },

  metricsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  metricBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
    alignItems: 'flex-start',
  },

  metricLabel: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },

  metricValue: {
    fontFamily: FONTS.bodyBold,
    fontSize: 18,
    letterSpacing: 0.8,
  },

  metricValueGold: {
    color: COLORS.gold,
  },

  metricValueMain: {
    color: COLORS.textPrimary,
  },

  updatedText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 12,
  },

  hintBox: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },

  hintText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
})

