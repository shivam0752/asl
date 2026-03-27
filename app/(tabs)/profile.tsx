import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { useCharacter } from '../../hooks/useCharacter';
import { useSync } from '../../hooks/useSync';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { getClassName } from '../../constants/classes';
import FeedbackModal from '../../components/modals/FeedbackModal';
import { connectLinkedIn } from '../../lib/linkedin';
import { connectGoogleFit } from '../../lib/googlefit';
import { supabase } from '../../lib/supabase';
import { APP_ASSETS } from '../../constants/assets';

export default function Profile() {
  const router                                      = useRouter();
  const { user, signOut }                           = useAuth();
  const { profile, refetch: refetchProfile, updateUsername, updating: nameUpdating } =
                                                      useProfile(user?.id);
  const { character, loading, refetch }             = useCharacter(user?.id);
  const {
    syncing,
    manualSyncLinkedIn,
    manualSyncGoogleFit,
  }                                                 = useSync(user?.id);
  const [showFeedback, setShowFeedback]             = useState(false);
  const [linkedInLoading, setLinkedInLoading]       = useState(false);
  const [googleFitLoading, setGoogleFitLoading]     = useState(false);
  const [linkedInConnected, setLinkedInConnected]   = useState(false);
  const [googleFitConnected, setGoogleFitConnected] = useState(false);
  const [showNameModal, setShowNameModal]           = useState(false);
  const [nameDraft, setNameDraft]                   = useState('');

  // Refetch on focus
  useFocusEffect(
    useCallback(() => {
      refetch();
      void refetchProfile();
    }, [refetch, refetchProfile])
  );

  // Check existing connections
  useEffect(() => {
    async function checkConnections() {
      if (!user) return;
      const { data } = await supabase
        .from('connected_accounts')
        .select('provider')
        .eq('user_id', user.id);

      if (data) {
        setLinkedInConnected(
          data.some((a) => a.provider === 'linkedin' || a.provider === 'linkedin_oidc')
        );
        setGoogleFitConnected(
          data.some((a) => a.provider === 'googlefit' || a.provider === 'google')
        );
      }
    }
    checkConnections();
  }, [user]);

// app/(tabs)/profile.tsx (Partial - modifying the handlers)

async function handleConnectLinkedIn() {
  if (!user) return;
  setLinkedInLoading(true);
  try {
    // Existing connection should directly resync without forcing OAuth each time.
    if (linkedInConnected) {
      const syncResult = await manualSyncLinkedIn();
      if (syncResult.success) {
        refetch();
        Alert.alert(
          'LinkedIn Resynced! ✓',
          `Career stats updated. +${syncResult.xpGained} XP earned.`
        );
      } else {
        setLinkedInConnected(false);
        Alert.alert(
          'Sync failed',
          syncResult.error ?? 'LinkedIn session may have expired. Please reconnect.'
        );
      }
      return;
    }

    const result = await connectLinkedIn();

    if (!result.success) {
      Alert.alert('Connection failed', result.error ?? 'Could not connect LinkedIn.');
      return;
    }

    const accessToken = result.accessToken;
    if (!accessToken) {
      Alert.alert('Connection failed', 'LinkedIn token was missing. Please try again.');
      return;
    }

    const { error: upsertError } = await supabase.from('connected_accounts').upsert({
      user_id:      user.id,
      provider:     'linkedin',
      access_token: accessToken,
      created_at:   new Date().toISOString(),
    }, { onConflict: 'user_id,provider' });

    if (upsertError) throw upsertError;

    setLinkedInConnected(true);
    const syncResult = await manualSyncLinkedIn();
    refetch();
    if (syncResult.success) {
      Alert.alert('LinkedIn Connected! 🎉', `Career data synced. +${syncResult.xpGained} XP earned.`);
    } else {
      Alert.alert('LinkedIn connected', syncResult.error ?? 'Connected, but sync failed. Try resync.');
    }
  } catch (e: any) {
    Alert.alert('Error', e.message);
  } finally {
    setLinkedInLoading(false);
  }
}

async function handleSignOut() {
  const doSignOut = async () => {
    const success = await signOut();
    if (success) {
      router.replace('/(auth)/splash');
      return;
    }

    Alert.alert('Sign out failed', 'Please try again.');
  };

  if (Platform.OS === 'web') {
    const confirmed = globalThis.confirm('Log out of your account?');
    if (!confirmed) return;
    await doSignOut();
    return;
  }

  Alert.alert('Log Out', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Log Out',
      style: 'destructive',
      onPress: () => {
        void doSignOut();
      },
    },
  ]);
}
  async function handleConnectGoogleFit() {
    setGoogleFitLoading(true);
    try {
      // Already connected — just resync
      if (googleFitConnected) {
        const result = await manualSyncGoogleFit();
        if (result.success) {
          refetch();
          Alert.alert(
            'Google Fit Resynced! ✓',
            `Stats updated. +${result.xpGained} XP earned.`,
            [{
              text: 'View Character',
              onPress: () => router.push('/(tabs)/character'),
            }]
          );
        } else {
          setGoogleFitConnected(false);
          Alert.alert(
            'Sync failed',
            'Your Google Fit session expired. Please reconnect.',
          );
        }
        return;
      }

      // First time — do OAuth
      const result = await connectGoogleFit();
      if (result.success) {
        const accessToken = result.accessToken;
        if (!accessToken || !user) {
          Alert.alert('Connection failed', 'Google Fit token was missing. Please reconnect.');
          return;
        }

        const { error: upsertError } = await supabase.from('connected_accounts').upsert({
          user_id:      user.id,
          provider:     'googlefit',
          access_token: accessToken,
          created_at:   new Date().toISOString(),
        }, { onConflict: 'user_id,provider' });
        if (upsertError) throw upsertError;

        setGoogleFitConnected(true);

        const syncResult = await manualSyncGoogleFit();
        refetch();

        Alert.alert(
          'Google Fit Connected! 🎉',
          syncResult.success
            ? `Fitness data imported. +${syncResult.xpGained} XP earned.`
            : 'Connected! Stats will update on next sync.',
          [{
            text: 'View Character',
            onPress: () => router.push('/(tabs)/character'),
          }]
        );
      } else {
        Alert.alert('Failed', result.error ?? 'Could not connect Google Fit.');
      }
    } catch (e: any) {
      console.log('Google Fit connect error:', e);
      Alert.alert('Error', e?.message ?? 'Something went wrong');
    } finally {
      setGoogleFitLoading(false);
    }
  }

  const displayName =
    profile?.username?.trim() || user?.email?.split('@')[0] || 'Hero';
  const initials = (() => {
    const s = displayName.trim();
    if (s.length >= 2) return s.slice(0, 2).toUpperCase();
    if (s.length === 1) return (s + s).toUpperCase();
    return (user?.email?.slice(0, 2) ?? 'AL').toUpperCase();
  })();
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
        <TouchableOpacity
          onPress={() => {
            setNameDraft(displayName);
            setShowNameModal(true);
          }}
          accessibilityLabel="Edit display name"
        >
          <Text style={styles.username}>{displayName}</Text>
          <Text style={styles.editNameHint}>Tap to edit name</Text>
        </TouchableOpacity>
        {className && (
          <Text style={styles.className}>
            {className} · {character?.tier} Tier
          </Text>
        )}
        <Text style={styles.joinedText}>
          Joined{' '}
          {new Date(user?.created_at ?? '').toLocaleDateString('en-US', {
            month: 'long',
            year:  'numeric',
          })}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Connected accounts */}
      <Text style={styles.sectionTitle}>CONNECTED ACCOUNTS</Text>
      <View style={styles.section}>

        {/* LinkedIn */}
        <View style={styles.accountRow}>
          <View style={[styles.accountLogo, { backgroundColor: '#0A66C2' }]}>
            {APP_ASSETS.linkedinLogo ? (
              <Image source={APP_ASSETS.linkedinLogo} style={styles.accountLogoImage} resizeMode="contain" />
            ) : (
              <Text style={styles.accountLogoText}>in</Text>
            )}
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>LinkedIn</Text>
            <Text style={[
              styles.accountStatus,
              linkedInConnected && { color: COLORS.success },
            ]}>
              {linkedInConnected ? '✓ Connected' : 'Not connected'}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              linkedInConnected && styles.actionBtnConnected,
            ]}
            onPress={handleConnectLinkedIn}
            disabled={linkedInLoading || syncing}
          >
            {linkedInLoading || syncing ? (
              <ActivityIndicator color={COLORS.gold} size="small" />
            ) : (
              <Text style={[
                styles.actionBtnText,
                linkedInConnected && styles.actionBtnTextConnected,
              ]}>
                {linkedInConnected ? 'Resync' : 'Connect'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Google Fit */}
        <View style={styles.accountRow}>
          <View style={[styles.accountLogo, { backgroundColor: '#4285F4' }]}>
            {APP_ASSETS.googleFitLogo ? (
              <Image source={APP_ASSETS.googleFitLogo} style={styles.accountLogoImage} resizeMode="contain" />
            ) : (
              <Text style={styles.accountLogoText}>G</Text>
            )}
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>Google Fit</Text>
            <Text style={[
              styles.accountStatus,
              googleFitConnected && { color: COLORS.success },
            ]}>
              {googleFitConnected ? '✓ Connected' : 'Not connected'}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              googleFitConnected && styles.actionBtnConnected,
            ]}
            onPress={handleConnectGoogleFit}
            disabled={googleFitLoading || syncing}
          >
            {googleFitLoading || syncing ? (
              <ActivityIndicator color={COLORS.gold} size="small" />
            ) : (
              <Text style={[
                styles.actionBtnText,
                googleFitConnected && styles.actionBtnTextConnected,
              ]}>
                {googleFitConnected ? 'Resync' : 'Connect'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Settings */}
      <Text style={styles.sectionTitle}>APP</Text>
      <View style={styles.section}>
        {[
          {
            label:   'Display name',
            icon:    '✏️',
            subtitle: displayName,
            onPress: () => {
              setNameDraft(displayName);
              setShowNameModal(true);
            },
          },
          {
            label:   'Give Feedback',
            icon:    '💬',
            onPress: () => setShowFeedback(true),
          },
          {
            label:   'Privacy & Data',
            icon:    '🔒',
            onPress: () => Alert.alert('Coming soon'),
          },
          {
            label:   'Help & FAQ',
            icon:    '❓',
            onPress: () => Alert.alert('Coming soon'),
          },
        ].map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.settingsRow}
            onPress={item.onPress}
          >
            <Text style={styles.settingsIcon}>{item.icon}</Text>
            <View style={styles.settingsLabelCol}>
              <Text style={styles.settingsLabel}>{item.label}</Text>
              {'subtitle' in item && item.subtitle ? (
                <Text style={styles.settingsSubtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              ) : null}
            </View>
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

      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Display name</Text>
            <TextInput
              style={styles.modalInput}
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="Your name"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="words"
              maxLength={40}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnGhost}
                onPress={() => setShowNameModal(false)}
              >
                <Text style={styles.modalBtnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnPrimary}
                onPress={async () => {
                  if (!user || !nameDraft.trim()) return;
                  try {
                    await updateUsername({
                      userId: user.id,
                      username: nameDraft,
                    });
                    setShowNameModal(false);
                  } catch (e: unknown) {
                    const msg =
                      e instanceof Error ? e.message : 'Could not update name.';
                    Alert.alert('Error', msg);
                  }
                }}
                disabled={nameUpdating || !nameDraft.trim()}
              >
                {nameUpdating ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={styles.modalBtnPrimaryText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  avatarSection: {
    alignItems:   'center',
    marginBottom: SPACING.lg,
    gap:          SPACING.sm,
  },
  avatar: {
    width:           72,
    height:          72,
    borderRadius:    36,
    backgroundColor: COLORS.gold,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    SPACING.sm,
  },
  avatarText: {
    fontFamily: FONTS.heading,
    fontSize:   28,
    color:      '#000000',
  },
  username: {
    fontFamily:    FONTS.bodyBold,
    fontSize:      20,
    color:         COLORS.textPrimary,
    textAlign:     'center',
  },
  editNameHint: {
    fontFamily: FONTS.body,
    fontSize:   11,
    color:      COLORS.textSecondary,
    marginTop:  4,
    textAlign:  'center',
  },
  className: {
    fontFamily: FONTS.body,
    fontSize:   14,
    color:      COLORS.gold,
  },
  joinedText: {
    fontFamily: FONTS.body,
    fontSize:   12,
    color:      COLORS.textSecondary,
  },
  divider: {
    height:          1,
    backgroundColor: COLORS.border,
    marginVertical:  SPACING.lg,
  },
  sectionTitle: {
    fontFamily:    FONTS.heading,
    fontSize:      14,
    color:         COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom:  SPACING.md,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius:    BORDER_RADIUS.lg,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  accountRow: {
    flexDirection:     'row',
    alignItems:        'center',
    padding:           SPACING.md,
    gap:               SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  accountLogo: {
    width:          40,
    height:         40,
    borderRadius:   20,
    alignItems:     'center',
    justifyContent: 'center',
  },
  accountLogoText: {
    fontFamily: FONTS.heading,
    fontSize:   18,
    color:      '#FFFFFF',
  },
  accountLogoImage: {
    width: 24,
    height: 24,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontFamily: FONTS.bodyBold,
    fontSize:   14,
    color:      COLORS.textPrimary,
  },
  accountStatus: {
    fontFamily: FONTS.body,
    fontSize:   12,
    color:      COLORS.textSecondary,
  },
  actionBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    borderRadius:      BORDER_RADIUS.sm,
    borderWidth:       1,
    borderColor:       COLORS.gold,
    minWidth:          70,
    alignItems:        'center',
  },
  actionBtnConnected: {
    borderColor: COLORS.success,
  },
  actionBtnText: {
    fontFamily: FONTS.bodyBold,
    fontSize:   12,
    color:      COLORS.gold,
  },
  actionBtnTextConnected: {
    color: COLORS.success,
  },
  settingsRow: {
    flexDirection:     'row',
    alignItems:        'center',
    padding:           SPACING.md,
    gap:               SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsIcon: {
    fontSize: 18,
  },
  settingsLabelCol: {
    flex: 1,
    gap: 2,
  },
  settingsLabel: {
    fontFamily: FONTS.body,
    fontSize:   15,
    color:      COLORS.textPrimary,
  },
  settingsSubtitle: {
    fontFamily: FONTS.body,
    fontSize:   12,
    color:      COLORS.textSecondary,
  },
  settingsChevron: {
    fontFamily: FONTS.body,
    fontSize:   20,
    color:      COLORS.textSecondary,
  },
  logoutBtn: {
    alignItems:      'center',
    paddingVertical: SPACING.md,
  },
  logoutText: {
    fontFamily: FONTS.bodyBold,
    fontSize:   15,
    color:      COLORS.error,
  },
  modalOverlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent:  'center',
    paddingHorizontal: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius:    BORDER_RADIUS.lg,
    borderWidth:     1,
    borderColor:     COLORS.border,
    padding:         SPACING.lg,
    gap:             SPACING.md,
  },
  modalTitle: {
    fontFamily: FONTS.heading,
    fontSize:   20,
    color:      COLORS.gold,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius:    BORDER_RADIUS.md,
    borderWidth:     1,
    borderColor:     COLORS.border,
    paddingHorizontal: SPACING.md,
    height:          48,
    color:           COLORS.textPrimary,
    fontFamily:      FONTS.body,
    fontSize:        16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap:            SPACING.md,
    marginTop:      SPACING.sm,
  },
  modalBtnGhost: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  modalBtnGhostText: {
    fontFamily: FONTS.bodyBold,
    fontSize:   14,
    color:      COLORS.textSecondary,
  },
  modalBtnPrimary: {
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnPrimaryText: {
    fontFamily: FONTS.bodyBold,
    fontSize:   14,
    color:      '#000000',
  },
});