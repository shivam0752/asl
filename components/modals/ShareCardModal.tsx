import { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Character, Stat } from '../../types';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, STAT_COLORS } from '../../constants/theme';
import { getClassName } from '../../constants/classes';
import { calculateTotalStat } from '../../utils/statAlgorithm';
import { StatName } from '../../types';

const STAT_ORDER: StatName[] = ['STR', 'INT', 'WIS', 'VIT', 'CHA', 'AGI'];

interface Props {
  visible: boolean;
  character: Character | null;
  stats: Stat[];
  onClose: () => void;
}

export default function ShareCardModal({ visible, character, stats, onClose }: Props) {
  const viewShotRef = useRef<ViewShot>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to save photos.');
        return;
      }
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1,
      });
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Saved!', 'Your character card has been saved to Photos.');
    } catch (e) {
      Alert.alert('Error', 'Could not save image. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    try {
      setSaving(true);
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1,
      });
      await Sharing.shareAsync(uri);
    } catch (e) {
      Alert.alert('Error', 'Could not share image. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!character) return null;

  const className = getClassName(character.class, character.tier);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.title}>YOUR CHARACTER CARD</Text>
        <Text style={styles.subtitle}>Share your progress</Text>

        {/* Capturable card */}
        <ViewShot
          ref={viewShotRef}
          style={styles.viewShot}
          options={{ format: 'png', quality: 1 }}
        >
          <View style={styles.card}>
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>⚔️</Text>
            </View>

            {/* Class name */}
            <Text style={styles.className}>{className}</Text>

            {/* Tier + Level row */}
            <View style={styles.badgeRow}>
              <View style={styles.tierBadge}>
                <Text style={styles.tierText}>{character.tier} Tier</Text>
              </View>
              <Text style={styles.level}>LVL {character.level}</Text>
            </View>

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

            {/* Watermark */}
            <Text style={styles.watermark}>levelup app</Text>
          </View>
        </ViewShot>

        {/* Action buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save to Photos</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.gold} size="small" />
            ) : (
              <Text style={styles.shareButtonText}>Share</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: SPACING.xl,
  },
  closeText: {
    color: COLORS.textSecondary,
    fontSize: 20,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    color: COLORS.gold,
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  viewShot: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.gold,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  className: {
    fontFamily: FONTS.heading,
    fontSize: 32,
    color: COLORS.gold,
    letterSpacing: 2,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tierBadge: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
  },
  tierText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.gold,
  },
  level: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.textPrimary,
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
    fontSize: 11,
    width: 30,
  },
  statBarBg: {
    flex: 1,
    height: 7,
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
    fontSize: 11,
    color: COLORS.textPrimary,
    width: 26,
    textAlign: 'right',
  },
  watermark: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    alignSelf: 'flex-end',
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    width: '100%',
  },
  saveButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.gold,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#000000',
  },
  shareButton: {
    flex: 1,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  shareButtonText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.gold,
  },
});