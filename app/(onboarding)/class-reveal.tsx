import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useCharacter } from '../../hooks/useCharacter';
import { getClassName, getClassDescription } from '../../constants/classes';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, STAT_COLORS } from '../../constants/theme';
import { calculateTotalStat } from '../../utils/statAlgorithm';
import { StatName } from '../../types';

const { width, height } = Dimensions.get('window');

const STAT_ORDER: StatName[] = ['STR', 'INT', 'WIS', 'VIT', 'CHA', 'AGI'];

export default function ClassReveal() {
  const router = useRouter();
  const { user } = useAuth();
  const { character, stats, loading } = useCharacter(user?.id);

  const scaleAnim   = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading && character) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, character]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.gold} size="large" />
        <Text style={styles.loadingText}>Preparing your character...</Text>
      </View>
    );
  }

  if (!character) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Something went wrong.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: COLORS.gold, fontFamily: FONTS.body }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const className = getClassName(character.class, character.tier);
  const classDesc = getClassDescription(character.class);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Speed lines */}
      {[...Array(12)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.burstLine,
            { transform: [{ rotate: `${i * 30}deg` }] },
          ]}
        />
      ))}

      {/* Label */}
      <Text style={styles.topLabel}>YOUR CHARACTER</Text>

      {/* Animated card */}
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>⚔️</Text>
        </View>

        {/* Class name */}
        <Text style={styles.className}>{className}</Text>

        {/* Tier badge */}
        <View style={styles.tierBadge}>
          <Text style={styles.tierText}>{character.tier} Tier</Text>
        </View>

        {/* Level */}
        <Text style={styles.level}>LVL {character.level}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Stats */}
        <View style={styles.statsContainer}>
          {STAT_ORDER.map((statName) => {
            const stat = stats.find((s) => s.statName === statName);
            const value = stat
              ? calculateTotalStat(stat.baseScore, stat.activeScore)
              : 0;
            const color = STAT_COLORS[statName];

            return (
              <View key={statName} style={styles.statRow}>
                <Text style={[styles.statLabel, { color }]}>{statName}</Text>
                <View style={styles.statBarBg}>
                  <View
                    style={[
                      styles.statBarFill,
                      { width: `${value}%`, backgroundColor: color },
                    ]}
                  />
                </View>
                <Text style={styles.statValue}>{value}</Text>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* Description */}
      <Text style={styles.description}>{classDesc}</Text>

      {/* CTA */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => router.replace('/(tabs)/')}
      >
        <Text style={styles.ctaText}>BEGIN YOUR JOURNEY →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 48,
    paddingHorizontal: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  burstLine: {
    position: 'absolute',
    width: 1,
    height: height,
    backgroundColor: COLORS.gold,
    opacity: 0.04,
    top: 0,
    left: width / 2,
  },
  topLabel: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 4,
    marginBottom: SPACING.lg,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.gold,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  className: {
    fontFamily: FONTS.heading,
    fontSize: 36,
    color: COLORS.gold,
    letterSpacing: 2,
    textAlign: 'center',
  },
  tierBadge: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tierText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.gold,
  },
  level: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  statsContainer: {
    width: '100%',
    gap: SPACING.sm,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    width: 32,
  },
  statBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  statValue: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.textPrimary,
    width: 28,
    textAlign: 'right',
  },
  description: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  ctaButton: {
    backgroundColor: COLORS.gold,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  ctaText: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: '#000000',
    letterSpacing: 2,
  },
});