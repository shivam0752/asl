import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useCharacter } from '../../hooks/useCharacter';
import { useState } from 'react';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { getClassName } from '../../constants/classes';
import FeedbackModal from '../../components/modals/FeedbackModal';

export default function Profile() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { character, loading } = useCharacter(user?.id);
  const [showFeedback, setShowFeedback] = useState(false);

  async function handleSignOut() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/splash');
        },
      },
    ]);
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'LU';
  const username  = user?.email?.split('@')[0] ?? 'Hero';
  const className = character
    ? getClassName(character.class, character.tier)
    : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.username}>{username}</Text>
        {className && (
          <Text style={styles.className}>
            {className} · {character?.tier} Tier
          </Text>
        )}
        <Text style={styles.joinedText}>
          Joined {new Date(user?.created_at ?? '').toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Connected accounts */}
      <Text style={styles.sectionTitle}>CONNECTED ACCOUNTS</Text>
      <View style={styles.section}>
        <View style={styles.accountRow}>
          <View style={[styles.accountLogo, { backgroundColor: '#0A66C2' }]}>
            <Text style={styles.accountLogoText}>in</Text>
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>LinkedIn</Text>
            <Text style={styles.accountStatus}>Not connected</Text>
          </View>
          <TouchableOpacity style={styles.resyncBtn}>
            <Text style={styles.resyncBtnText}>Connect</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.accountRow}>
          <View style={[styles.accountLogo, { backgroundColor: '#4285F4' }]}>
            <Text style={styles.accountLogoText}>G</Text>
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>Google Fit</Text>
            <Text style={styles.accountStatus}>Not connected</Text>
          </View>
          <TouchableOpacity style={styles.resyncBtn}>
            <Text style={styles.resyncBtnText}>Connect</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Settings list */}
      <Text style={styles.sectionTitle}>APP</Text>
      <View style={styles.section}>
        {[
          {
            label: 'Give Feedback',
            icon: '💬',
            onPress: () => setShowFeedback(true),
          },
          {
            label: 'Privacy & Data',
            icon: '🔒',
            onPress: () => Alert.alert('Coming soon'),
          },
          {
            label: 'Help & FAQ',
            icon: '❓',
            onPress: () => Alert.alert('Coming soon'),
          },
        ].map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.settingsRow}
            onPress={item.onPress}
          >
            <Text style={styles.settingsIcon}>{item.icon}</Text>
            <Text style={styles.settingsLabel}>{item.label}</Text>
            <Text style={styles.settingsChevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.divider} />

      {/* Log out */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <FeedbackModal
        visible={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    color: '#000000',
  },
  username: {
    fontFamily: FONTS.bodyBold,
    fontSize: 20,
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  className: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.gold,
  },
  joinedText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.heading,
    fontSize: 14,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  accountLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountLogoText: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: '#FFFFFF',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  accountStatus: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  resyncBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  resyncBtnText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.gold,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsIcon: {
    fontSize: 18,
  },
  settingsLabel: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
  },
  settingsChevron: {
    fontFamily: FONTS.body,
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  logoutText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
    color: COLORS.error,
  },
});