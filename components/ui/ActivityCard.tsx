import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useMemo } from 'react'
import type { XPEvent, StatName } from '../../types'
import { COLORS, FONTS, SPACING, BORDER_RADIUS, STAT_COLORS } from '../../constants/theme'

export type ActivityCardProps = {
  event?: XPEvent | null
  loading?: boolean
  error?: string | null
}

function getStatNameStyle(statName: StatName | null) {
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

function formatDelta(delta: number | null) {
  if (delta === null) return 'No stat change'
  const rounded = Math.round(delta)
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded}`
}

function formatDate(iso: string | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString()
}

export default function ActivityCard({ event, loading = false, error = null }: ActivityCardProps) {
  const statNameStyle = useMemo(() => getStatNameStyle(event?.statAffected ?? null), [event?.statAffected])

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={COLORS.gold} />
        <Text style={styles.loadingText}>Loading activity…</Text>
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

  if (!event) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>No activity yet</Text>
      </View>
    )
  }

  const isPositive = (event.statDelta ?? 0) >= 0
  const statDeltaText = formatDelta(event.statDelta)

  const eventTypeLabel = event.eventType === 'career' ? 'Career' : 'Fitness'
  const dateText = formatDate(event.createdAt)

  return (
    <View style={styles.card}>
      <View style={styles.speedLines} pointerEvents="none">
        <View style={styles.speedA} />
        <View style={styles.speedB} />
        <View style={styles.speedC} />
      </View>

      <View style={styles.topRow}>
        <Text style={styles.eventType}>{eventTypeLabel}</Text>
        <Text style={styles.dateText}>{dateText}</Text>
      </View>

      <Text style={styles.eventName} numberOfLines={2}>
        {event.eventName}
      </Text>

      <View style={styles.bottomRow}>
        <View style={styles.xpBox}>
          <Text style={styles.xpLabel}>+{Math.round(event.xpGained)} XP</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Stat</Text>
          <Text style={[styles.statNameBase, statNameStyle]}>
            {event.statAffected ? event.statAffected : '—'}
          </Text>
          <Text style={[styles.deltaText, isPositive ? styles.deltaPositive : styles.deltaNegative]}>
            {statDeltaText}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    overflow: 'hidden',
  },

  speedLines: {
    position: 'absolute',
    top: -22,
    left: -22,
    width: 120,
    height: 80,
    opacity: 0.15,
  },
  speedA: {
    position: 'absolute',
    top: 22,
    left: 18,
    width: 90,
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    transform: [{ rotate: '-14deg' }],
  },
  speedB: {
    position: 'absolute',
    top: 38,
    left: 6,
    width: 110,
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    transform: [{ rotate: '6deg' }],
  },
  speedC: {
    position: 'absolute',
    top: 54,
    left: 20,
    width: 78,
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    transform: [{ rotate: '18deg' }],
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },

  eventType: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.gold,
  },

  dateText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  eventName: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },

  xpBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderColor: COLORS.gold,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    justifyContent: 'center',
  },

  xpLabel: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: COLORS.gold,
    letterSpacing: 0.5,
  },

  statBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },

  statLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  statNameBase: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    letterSpacing: 0.8,
    marginTop: 2,
  },

  statNameDefault: {
    color: COLORS.textSecondary,
  },

  statNameSTR: { color: STAT_COLORS.STR },
  statNameINT: { color: STAT_COLORS.INT },
  statNameWIS: { color: STAT_COLORS.WIS },
  statNameVIT: { color: STAT_COLORS.VIT },
  statNameCHA: { color: STAT_COLORS.CHA },
  statNameAGI: { color: STAT_COLORS.AGI },

  deltaText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    marginTop: 6,
  },
  deltaPositive: {
    color: COLORS.success,
  },
  deltaNegative: {
    color: COLORS.error,
  },

  loadingText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
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
})

