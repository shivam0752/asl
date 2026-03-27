import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { useCharacter } from '../../hooks/useCharacter';
import { useXPEvents } from '../../hooks/useStats';
import { useSync } from '../../hooks/useSync';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, STAT_COLORS } from '../../constants/theme';
import { xpProgressPercent, xpToNextLevel } from '../../utils/xpEngine';
import { calculateTotalStat } from '../../utils/statAlgorithm';
import { getClassName } from '../../constants/classes';
import { StatName } from '../../types';

const STAT_ORDER: StatName[] = ['STR', 'INT', 'WIS', 'VIT', 'CHA', 'AGI'];

export default function Home() {
  const router                          = useRouter();
  const { user }                        = useAuth();
  const { profile }                     = useProfile(user?.id);
  const { character, stats, loading }   = useCharacter(user?.id);
  const { events }                      = useXPEvents(user?.id);
  const { syncing, lastSyncResult }     = useSync(user?.id);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.gold} size="large" />
        <Text style={styles.loadingText}>Summoning your character...</Text>
      </View>
    );
  }

  if (!character) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.noCharEmoji}>⚔️</Text>
        <Text style={styles.noCharTitle}>No character yet</Text>
        <Text style={styles.noCharSubtitle}>
          Complete setup to build your character
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.replace('/(onboarding)/connect-linkedin')}
        >
          <Text style={styles.ctaButtonText}>BUILD MY CHARACTER</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const level         = character.level;
  const totalXp       = character.totalXp;
  const percent       = xpProgressPercent(totalXp);
  const toNext        = xpToNextLevel(totalXp);
  const className     = getClassName(character.class, character.tier);
  const recentEvents  = events.slice(0, 5);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.username}>
            {profile?.username?.trim() || user?.email?.split('@')[0] || 'Hero'}
          </Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>LVL {level}</Text>
        </View>
      </View>

      {/* Class name */}
      <Text style={styles.className}>{className}</Text>

      {/* XP Bar */}
      <View style={styles.xpContainer}>
        <View style={styles.xpLabels}>
          <Text style={styles.xpLabel}>XP Progress</Text>
          <Text style={styles.xpValue}>
            {toNext} to next level
          </Text>
        </View>
        <View style={styles.xpBarBg}>
          <View style={[styles.xpBarFill, { width: `${percent}%` }]} />
        </View>
      </View>

      <View style={styles.divider} />

      {/* Stats at a glance */}
      <Text style={styles.sectionTitle}>STATS AT A GLANCE</Text>
      <View style={styles.statsGrid}>
        {STAT_ORDER.map((statName) => {
          const stat  = stats.find((s) => s.statName === statName);
          const value = stat
            ? calculateTotalStat(stat.baseScore, stat.activeScore)
            : 0;
          const color = STAT_COLORS[statName];
          return (
            <View key={statName} style={styles.statChip}>
              <View style={[styles.statDot, { backgroundColor: color }]} />
              <Text style={styles.statChipName}>{statName}</Text>
              <Text style={[styles.statChipValue, { color }]}>{value}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.divider} />

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
      {recentEvents.length === 0 ? (
        <View style={styles.emptyActivity}>
          <Text style={styles.emptyActivityText}>No activity yet</Text>
          <Text style={styles.emptyActivitySub}>
            Connect LinkedIn or Google Fit to start earning XP
          </Text>
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.connectBtnText}>Connect accounts →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        recentEvents.map((event) => {
          const color = event.statAffected
            ? STAT_COLORS[event.statAffected as StatName]
            : COLORS.gold;
          return (
            <View
              key={event.id}
              style={[styles.activityCard, { borderLeftColor: color }]}
            >
              <Text style={styles.activityIcon}>
                {event.eventType === 'career' ? '💼' : '⚡'}
              </Text>
              <View style={styles.activityCenter}>
                <Text style={styles.activityName}>{event.eventName}</Text>
                {event.statAffected && (
                  <View
                    style={[
                      styles.statBadge,
                      { backgroundColor: color + '22' },
                    ]}
                  >
                    <Text style={[styles.statBadgeText, { color }]}>
                      {event.statAffected} +{event.statDelta}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.activityRight}>
                <Text style={styles.activityXP}>+{event.xpGained} XP</Text>
              </View>
            </View>
          );
        })
      )}

      {/* Sync status */}
      <Text style={styles.syncStatus}>
        {syncing
          ? '⟳ Syncing your data...'
          : lastSyncResult
          ? `✓ ${lastSyncResult}`
          : 'Auto-syncs daily when accounts are connected'}
      </Text>
    </ScrollView>
  );
}

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
    gap:             SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    fontFamily: FONTS.body,
    color:      COLORS.textSecondary,
    fontSize:   15,
  },
  noCharEmoji: {
    fontSize:     64,
    marginBottom: SPACING.sm,
  },
  noCharTitle: {
    fontFamily:    FONTS.heading,
    fontSize:      28,
    color:         COLORS.textPrimary,
    letterSpacing: 1,
  },
  noCharSubtitle: {
    fontFamily: FONTS.body,
    fontSize:   14,
    color:      COLORS.textSecondary,
    textAlign:  'center',
  },
  ctaButton: {
    backgroundColor: COLORS.gold,
    height:          52,
    borderRadius:    BORDER_RADIUS.md,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: SPACING.xl,
    marginTop:       SPACING.md,
  },
  ctaButtonText: {
    fontFamily:    FONTS.heading,
    fontSize:      18,
    color:         '#000000',
    letterSpacing: 2,
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   SPACING.xs,
  },
  greeting: {
    fontFamily: FONTS.body,
    fontSize:   14,
    color:      COLORS.textSecondary,
  },
  username: {
    fontFamily:    FONTS.bodyBold,
    fontSize:      22,
    color:         COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  levelBadge: {
    borderWidth:       1,
    borderColor:       COLORS.gold,
    borderRadius:      BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical:   6,
  },
  levelBadgeText: {
    fontFamily:    FONTS.heading,
    fontSize:      16,
    color:         COLORS.gold,
    letterSpacing: 1,
  },
  className: {
    fontFamily:    FONTS.heading,
    fontSize:      20,
    color:         COLORS.gold,
    letterSpacing: 1,
    marginBottom:  SPACING.lg,
  },
  xpContainer: {
    marginBottom: SPACING.lg,
  },
  xpLabels: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   SPACING.sm,
  },
  xpLabel: {
    fontFamily:    FONTS.bodyBold,
    fontSize:      12,
    color:         COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  xpValue: {
    fontFamily: FONTS.body,
    fontSize:   12,
    color:      COLORS.textSecondary,
  },
  xpBarBg: {
    height:          10,
    backgroundColor: COLORS.surface,
    borderRadius:    BORDER_RADIUS.full,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     COLORS.gold + '44',
  },
  xpBarFill: {
    height:          '100%',
    backgroundColor: COLORS.gold,
    borderRadius:    BORDER_RADIUS.full,
  },
  divider: {
    height:          1,
    backgroundColor: COLORS.border,
    marginBottom:    SPACING.lg,
  },
  sectionTitle: {
    fontFamily:    FONTS.heading,
    fontSize:      18,
    color:         COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom:  SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           SPACING.sm,
    marginBottom:  SPACING.lg,
  },
  statChip: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             6,
    backgroundColor: COLORS.surface,
    borderRadius:    BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth:     1,
    borderColor:     COLORS.border,
    minWidth:        '30%',
  },
  statDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
  statChipName: {
    fontFamily: FONTS.bodyBold,
    fontSize:   12,
    color:      COLORS.textSecondary,
  },
  statChipValue: {
    fontFamily:  FONTS.heading,
    fontSize:    16,
    marginLeft:  'auto',
  },
  emptyActivity: {
    alignItems:    'center',
    paddingVertical: SPACING.xl,
    gap:           SPACING.sm,
  },
  emptyActivityText: {
    fontFamily: FONTS.bodyBold,
    fontSize:   15,
    color:      COLORS.textSecondary,
  },
  emptyActivitySub: {
    fontFamily: FONTS.body,
    fontSize:   13,
    color:      COLORS.textSecondary,
    textAlign:  'center',
    lineHeight: 20,
  },
  connectBtn: {
    marginTop: SPACING.sm,
  },
  connectBtnText: {
    fontFamily: FONTS.bodyBold,
    fontSize:   14,
    color:      COLORS.gold,
  },
  activityCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.surface,
    borderRadius:    BORDER_RADIUS.md,
    padding:         SPACING.md,
    marginBottom:    SPACING.sm,
    borderLeftWidth: 3,
    gap:             SPACING.sm,
  },
  activityIcon: {
    fontSize: 20,
  },
  activityCenter: {
    flex: 1,
    gap:  4,
  },
  activityName: {
    fontFamily: FONTS.bodyBold,
    fontSize:   14,
    color:      COLORS.textPrimary,
  },
  statBadge: {
    alignSelf:         'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical:   2,
    borderRadius:      BORDER_RADIUS.sm,
  },
  statBadgeText: {
    fontFamily: FONTS.bodyBold,
    fontSize:   11,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityXP: {
    fontFamily: FONTS.heading,
    fontSize:   16,
    color:      COLORS.gold,
  },
  syncStatus: {
    fontFamily: FONTS.body,
    fontSize:   12,
    color:      COLORS.textSecondary,
    textAlign:  'center',
    marginTop:  SPACING.lg,
  },
});