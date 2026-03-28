import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Platform,
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
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { character, stats, loading } = useCharacter(user?.id);
  const { events } = useXPEvents(user?.id);
  const { syncing, lastSyncResult } = useSync(user?.id);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.gold} size="large" />
        <Text style={styles.loadingText}>SUMMONING CHARACTER...</Text>
      </View>
    );
  }

  if (!character) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.noCharContainer}>
          <Text style={styles.noCharEmoji}>⚔️</Text>
          <Text style={styles.noCharTitle}>AWAKENING NEEDED</Text>
          <Text style={styles.noCharSubtitle}>
            Your legend hasn't started yet. Connect your digital footprint to manifest your stats.
          </Text>
          <TouchableOpacity
            style={styles.mainCta}
            onPress={() => router.replace('/(onboarding)/connect-linkedin')}
          >
            <Text style={styles.mainCtaText}>INITIALIZE SYSTEM</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const level = character.level;
  const totalXp = character.totalXp;
  const percent = xpProgressPercent(totalXp);
  const toNext = xpToNextLevel(totalXp);
  const className = getClassName(character.class, character.tier);
  const recentEvents = events.slice(0, 4);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* MOBILE HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>SYSTEM ACTIVE</Text>
            <Text style={styles.username}>
              {profile?.username?.trim() || user?.email?.split('@')[0] || 'Hero'}
            </Text>
          </View>
          <View style={styles.levelHexagon}>
            <Text style={styles.levelLabel}>LVL</Text>
            <Text style={styles.levelNumber}>{level}</Text>
          </View>
        </View>

        {/* CHARACTER CARD */}
        <View style={styles.heroCard}>
          <Text style={styles.heroClass}>{className.toUpperCase()}</Text>
          
          <View style={styles.xpSection}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpTitle}>EXPERIENCE POINTS</Text>
              <Text style={styles.xpValue}>{toNext} XP TO NEXT LVL</Text>
            </View>
            <View style={styles.xpBarTrack}>
              <View style={[styles.xpBarFill, { width: `${percent}%` }]} />
            </View>
          </View>
        </View>

        {/* STATS GRID - 2 COLUMNS */}
        <Text style={styles.sectionHeader}>CORE STATISTICS</Text>
        <View style={styles.statsGrid}>
          {STAT_ORDER.map((statName) => {
            const stat = stats.find((s) => s.statName === statName);
            const value = stat ? calculateTotalStat(stat.baseScore, stat.activeScore) : 0;
            const color = STAT_COLORS[statName];
            return (
              <TouchableOpacity 
                key={statName} 
                style={styles.statBox}
                onPress={() => router.push('/(tabs)/character')}
              >
                <View style={[styles.statIndicator, { backgroundColor: color }]} />
                <View>
                  <Text style={styles.statName}>{statName}</Text>
                  <Text style={[styles.statValue, { color }]}>{value}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* RECENT LOGS */}
        <View style={styles.activityHeader}>
          <Text style={styles.sectionHeader}>RECENT LOGS</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/progress')}>
            <Text style={styles.viewAll}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        {recentEvents.length === 0 ? (
          <View style={styles.emptyActivityBox}>
            <Text style={styles.emptyText}>No data streams detected.</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <Text style={styles.linkText}>Link Accounts</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentEvents.map((event) => (
            <View key={event.id} style={styles.logCard}>
              <View style={styles.logIconBox}>
                <Text style={styles.logEmoji}>{event.eventType === 'career' ? '💼' : '⚡'}</Text>
              </View>
              <View style={styles.logMain}>
                <Text style={styles.logTitle} numberOfLines={1}>{event.eventName}</Text>
                <Text style={styles.logSubtext}>{event.statAffected} +{event.statDelta}</Text>
              </View>
              <Text style={styles.logXP}>+{event.xpGained} XP</Text>
            </View>
          ))
        )}

        {/* SYNC FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.syncText}>
            {syncing ? '⟳ NEURAL SYNC IN PROGRESS...' : `LAST SYNC: ${lastSyncResult || 'READY'}`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONTS.heading,
    color: COLORS.gold,
    marginTop: 20,
    letterSpacing: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  greeting: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.gold,
    letterSpacing: 2,
  },
  username: {
    fontFamily: FONTS.heading,
    fontSize: 26,
    color: '#FFF',
    textTransform: 'uppercase',
  },
  levelHexagon: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.gold,
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 65,
  },
  levelLabel: {
    fontFamily: FONTS.body,
    fontSize: 9,
    color: COLORS.gold,
  },
  levelNumber: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.gold,
  },
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 30,
  },
  heroClass: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 4,
  },
  xpSection: {
    width: '100%',
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  xpValue: {
    fontFamily: FONTS.bodyBold,
    fontSize: 10,
    color: COLORS.gold,
  },
  xpBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
  },
  sectionHeader: {
    fontFamily: FONTS.heading,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 30,
  },
  statBox: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statIndicator: {
    width: 3,
    height: 25,
    borderRadius: 2,
  },
  statName: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  statValue: {
    fontFamily: FONTS.heading,
    fontSize: 18,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAll: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.gold,
    marginBottom: 15,
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  logIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logEmoji: {
    fontSize: 18,
  },
  logMain: {
    flex: 1,
  },
  logTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#FFF',
  },
  logSubtext: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  logXP: {
    fontFamily: FONTS.heading,
    fontSize: 14,
    color: COLORS.gold,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  syncText: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
  },
  noCharContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noCharEmoji: { fontSize: 60, marginBottom: 20 },
  noCharTitle: { fontFamily: FONTS.heading, fontSize: 24, color: '#FFF', textAlign: 'center' },
  noCharSubtitle: { fontFamily: FONTS.body, fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 10 },
  mainCta: { backgroundColor: COLORS.gold, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12, marginTop: 30 },
  mainCtaText: { fontFamily: FONTS.heading, fontSize: 16, color: '#000' },
  emptyActivityBox: { padding: 20, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16 },
  emptyText: { fontFamily: FONTS.body, color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  linkText: { fontFamily: FONTS.bodyBold, color: COLORS.gold, fontSize: 13, marginTop: 5 },
});