import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useCharacter } from '../../hooks/useCharacter';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, STAT_COLORS } from '../../constants/theme';
import { calculateTotalStat } from '../../utils/statAlgorithm';
import { xpProgressPercent, xpToNextLevel } from '../../utils/xpEngine';
import { getClassName } from '../../constants/classes';
import { StatName } from '../../types';
import StatBar from '../../components/ui/StatBar'; // Using our newly animated StatBar

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STAT_ORDER: StatName[] = ['STR', 'INT', 'WIS', 'VIT', 'CHA', 'AGI'];

const STAT_DESCRIPTIONS: Record<StatName, string> = {
  STR: 'Physical strength and workout consistency derived from Google Fit.',
  INT: 'Knowledge depth and learning velocity based on LinkedIn certifications.',
  WIS: 'Experience and professional seniority levels.',
  VIT: 'Health, recovery, and overall physical wellbeing.',
  CHA: 'Network strength and social influence within your industry.',
  AGI: 'Adaptability and career momentum speed.',
};

export default function Character() {
  const router = useRouter();
  const { user } = useAuth();
  const { character, stats, loading, refetch } = useCharacter(user?.id);
  const [selectedStat, setSelectedStat] = useState<StatName | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleStatPress = (statName: StatName) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedStat(selectedStat === statName ? null : statName);
  };

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
        <Text style={styles.noCharText}>NEURAL LINK SEVERED: NO CHARACTER FOUND</Text>
      </View>
    );
  }

  const className = getClassName(character.class, character.tier);
  const percent = xpProgressPercent(character.totalXp);
  const toNext = xpToNextLevel(character.totalXp);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>CHARACTER PROFILE</Text>

        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>⚔️</Text>
            <View style={styles.tierTag}>
              <Text style={styles.tierTagText}>{character.tier.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.className}>{className}</Text>
          <Text style={styles.levelText}>LEVEL {character.level}</Text>

          {/* XP PROGRESS */}
          <View style={styles.xpWrapper}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpLabel}>PROGRESSION</Text>
              <Text style={styles.xpValue}>{toNext} XP TO ASCEND</Text>
            </View>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${percent}%` }]} />
            </View>
          </View>
        </View>

        {/* STATS CONSOLE */}
        <View style={styles.consoleHeader}>
          <Text style={styles.consoleTitle}>STATISTICS CONSOLE</Text>
          <Text style={styles.consoleSubtitle}>TAP STAT FOR NEURAL DATA</Text>
        </View>

        <View style={styles.statsList}>
          {STAT_ORDER.map((statName) => {
            const stat = stats.find((s) => s.statName === statName);
            const value = stat ? calculateTotalStat(stat.baseScore, stat.activeScore) : 0;
            const isSelected = selectedStat === statName;

            return (
              <View key={statName}>
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => handleStatPress(statName)}
                >
                  <StatBar 
                    statName={statName} 
                    value={value} 
                    showValue={true} 
                  />
                </TouchableOpacity>

                {isSelected && (
                  <View style={[styles.detailBox, { borderLeftColor: STAT_COLORS[statName] }]}>
                    <Text style={styles.detailDesc}>{STAT_DESCRIPTIONS[statName]}</Text>
                    <View style={styles.dataPoint}>
                      <Text style={styles.dataLabel}>SOURCE:</Text>
                      <Text style={styles.dataValue}>
                        {['STR', 'VIT', 'AGI'].includes(statName) ? 'GOOGLE FIT' : 'LINKEDIN'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.logButton}
          onPress={() => router.push('/xp-log')}
        >
          <Text style={styles.logButtonText}>ACCESS EXPERIENCE LOGS</Text>
        </TouchableOpacity>
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
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCharText: {
    fontFamily: FONTS.heading,
    color: COLORS.gold,
    textAlign: 'center',
  },
  pageTitle: {
    fontFamily: FONTS.heading,
    fontSize: 14,
    color: COLORS.gold,
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.6,
  },
  heroSection: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  tierTag: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierTagText: {
    fontFamily: FONTS.heading,
    fontSize: 10,
    color: '#000',
  },
  className: {
    fontFamily: FONTS.heading,
    fontSize: 32,
    color: '#FFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  levelText: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.gold,
    marginTop: 5,
    letterSpacing: 2,
  },
  xpWrapper: {
    width: '100%',
    marginTop: 25,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  xpValue: {
    fontFamily: FONTS.bodyBold,
    fontSize: 10,
    color: COLORS.gold,
  },
  xpBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
  },
  consoleHeader: {
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  consoleTitle: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: '#FFF',
    letterSpacing: 2,
  },
  consoleSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.gold,
    letterSpacing: 1,
    marginTop: 4,
  },
  statsList: {
    gap: 4,
    marginBottom: 30,
  },
  detailBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 15,
    marginHorizontal: 10,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 12,
    borderTopRightRadius: 0,
    marginBottom: 15,
    marginTop: -5, // Connect to the bar above
  },
  detailDesc: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  dataPoint: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  dataLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
  },
  dataValue: {
    fontFamily: FONTS.bodyBold,
    fontSize: 11,
    color: COLORS.gold,
  },
  logButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  logButtonText: {
    fontFamily: FONTS.heading,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
  },
});