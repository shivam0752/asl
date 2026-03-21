import { useMemo } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../hooks/useAuth'
import { useXPEvents } from '../hooks/useStats'
import { COLORS, FONTS, SPACING } from '../constants/theme'
import ActivityCard from '../components/ui/ActivityCard'

const EVENT_SLICE = 50

export default function XPLogScreen() {
  const { user, loading: authLoading, error: authError } = useAuth()
  const { events, loading, error } = useXPEvents(user?.id)

  const list = useMemo(() => events.slice(0, EVENT_SLICE), [events])

  if (authLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={COLORS.gold} size="large" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    )
  }

  if (authError) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.errorText}>{authError}</Text>
      </View>
    )
  }

  if (!user) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.errorText}>Please sign in.</Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={COLORS.gold} size="large" />
        <Text style={styles.loadingText}>Fetching XP log…</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>XP LOG</Text>

      <View style={styles.list}>
        {list.length === 0 ? (
          <ActivityCard event={null} />
        ) : (
          list.map((e) => <ActivityCard key={e.id} event={e} />)
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },

  list: {
    gap: SPACING.sm,
  },

  loadingWrap: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },

  title: {
    fontFamily: FONTS.heading,
    color: COLORS.gold,
    fontSize: 30,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  loadingText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },

  errorText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.error,
    fontSize: 13,
    textAlign: 'center',
  },
})

