import React, { useState, useEffect, useCallback } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Dynamic notch/camera handling
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { useCharacter } from '../../hooks/useCharacter';
import { useSync } from '../../hooks/useSync';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { getClassName } from '../../constants/classes';
import FeedbackModal from '../../components/modals/FeedbackModal';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, refetch: refetchProfile, updateUsername, updating: nameUpdating } = useProfile(user?.id);
  const { character, refetch } = useCharacter(user?.id);
  const { syncing } = useSync(user?.id);

  const [showFeedback, setShowFeedback] = useState(false);
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [googleFitConnected, setGoogleFitConnected] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  useFocusEffect(
    useCallback(() => {
      refetch();
      void refetchProfile();
    }, [refetch, refetchProfile])
  );

  useEffect(() => {
    async function checkConnections() {
      if (!user) return;
      const { data } = await supabase.from('connected_accounts').select('provider').eq('user_id', user.id);
      if (data) {
        setLinkedInConnected(data.some((a) => a.provider === 'linkedin' || a.provider === 'linkedin_oidc'));
        setGoogleFitConnected(data.some((a) => a.provider === 'googlefit' || a.provider === 'google'));
      }
    }
    checkConnections();
  }, [user]);

  const handleSignOut = async () => {
    Alert.alert('SYSTEM LOGOUT', 'Disconnect neural link and exit?', [
      { text: 'CANCEL', style: 'cancel' },
      { 
        text: 'EXIT', 
        style: 'destructive', 
        onPress: async () => {
          const success = await signOut();
          if (success) router.replace('/(auth)/splash');
        } 
      },
    ]);
  };

  const displayName = profile?.username?.trim() || user?.email?.split('@')[0] || 'Hero';
  const className = character ? getClassName(character.class, character.tier) : null;

  return (
    <View style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[
            styles.contentContainer, 
            { paddingTop: insets.top + 20 } // Push content below camera
        ]} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>SYSTEM SETTINGS</Text>

        {/* IDENTITY CARD */}
        <View style={styles.identityCard}>
          <View style={styles.avatarGlow}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.nameRow}
            onPress={() => { setNameDraft(displayName); setShowNameModal(true); }}
          >
            <Text style={styles.username}>{displayName}</Text>
            {/* LOGO PLACEHOLDER */}
            <Image 
                source={require('../../assets/branding/pen.png')} 
                style={styles.editLogo}
                resizeMode="contain"
            />
          </TouchableOpacity>

          {className && <Text style={styles.classTier}>{className.toUpperCase()} · {character?.tier} TIER</Text>}
        </View>

        {/* CONNECTION STATUS */}
        <Text style={styles.sectionHeader}>NEURAL DATA LINKS</Text>
        <View style={styles.linkList}>
          <View style={styles.linkRow}>
            <View style={[styles.linkIcon, { backgroundColor: '#0A66C2' }]}>
              <Text style={styles.linkIconText}>in</Text>
            </View>
            <View style={styles.linkInfo}>
              <Text style={styles.linkTitle}>Career Stream</Text>
              <Text style={[styles.linkStatus, linkedInConnected && { color: '#00E6FF' }]}>
                {linkedInConnected ? 'ACTIVE' : 'DISCONNECTED'}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.linkAction, linkedInConnected && styles.linkActionActive]} 
              disabled={syncing}
            >
              <Text style={styles.linkActionText}>{linkedInConnected ? 'RESYNC' : 'LINK'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.linkRow}>
            <View style={[styles.linkIcon, { backgroundColor: '#4285F4' }]}>
              <Text style={styles.linkIconText}>G</Text>
            </View>
            <View style={styles.linkInfo}>
              <Text style={styles.linkTitle}>Fitness Stream</Text>
              <Text style={[styles.linkStatus, googleFitConnected && { color: '#00E6FF' }]}>
                {googleFitConnected ? 'ACTIVE' : 'DISCONNECTED'}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.linkAction, googleFitConnected && styles.linkActionActive]} 
              disabled={syncing}
            >
              <Text style={styles.linkActionText}>{googleFitConnected ? 'RESYNC' : 'LINK'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* APP SETTINGS */}
        <Text style={styles.sectionHeader}>CORE CONFIGURATION</Text>
        <View style={styles.settingsGroup}>
          {[
            { label: 'Privacy Protocol', icon: '🔒' },
            { label: 'Neural Feedback', icon: '💬', onPress: () => setShowFeedback(true) },
            { label: 'System Documentation', icon: '❓' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.settingItem} onPress={item.onPress}>
              <Text style={styles.settingIcon}>{item.icon}</Text>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <Text style={styles.settingChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Text style={styles.logoutText}>TERMINATE SESSION</Text>
        </TouchableOpacity>
      </ScrollView>

      <FeedbackModal visible={showFeedback} onClose={() => setShowFeedback(false)} />
      
      <Modal visible={showNameModal} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior="padding">
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>REWRITE IDENTITY</Text>
            <TextInput 
              style={styles.modalInput} 
              value={nameDraft} 
              onChangeText={setNameDraft} 
              placeholderTextColor="rgba(255,255,255,0.3)"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowNameModal(false)}><Text style={styles.cancelText}>ABORT</Text></TouchableOpacity>
              <TouchableOpacity 
                onPress={async () => {
                    if (!user || !nameDraft.trim()) return;
                    await updateUsername({ userId: user.id, username: nameDraft });
                    setShowNameModal(false);
                }}
              >
                <Text style={styles.saveText}>{nameUpdating ? '...' : 'CONFIRM'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D0D0D' },
  container: { flex: 1 },
  contentContainer: { padding: SPACING.lg, paddingBottom: 50 },
  pageTitle: { fontFamily: FONTS.heading, fontSize: 14, color: COLORS.gold, letterSpacing: 4, textAlign: 'center', marginBottom: 30, opacity: 0.6 },
  identityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 35,
  },
  avatarGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 10,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  avatarText: { fontFamily: FONTS.heading, fontSize: 32, color: '#000' },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editLogo: {
    width: 20,
    height: 20,
    tintColor: COLORS.gold, // Optional: makes the logo match the gold theme
  },
  username: { fontFamily: FONTS.heading, fontSize: 24, color: '#FFF', letterSpacing: 1 },
  classTier: { fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.gold, marginTop: 5, opacity: 0.8 },
  sectionHeader: { fontFamily: FONTS.heading, fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 15, marginLeft: 5 },
  linkList: { gap: 12, marginBottom: 35 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  linkIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  linkIconText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  linkInfo: { flex: 1 },
  linkTitle: { fontFamily: FONTS.bodyBold, fontSize: 14, color: '#FFF' },
  linkStatus: { fontFamily: FONTS.body, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  linkAction: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.gold },
  linkActionActive: { borderColor: '#00E6FF' },
  linkActionText: { fontFamily: FONTS.heading, fontSize: 10, color: COLORS.gold },
  settingsGroup: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, overflow: 'hidden', marginBottom: 40 },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  settingIcon: { fontSize: 18, marginRight: 15 },
  settingLabel: { flex: 1, fontFamily: FONTS.body, fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  settingChevron: { color: 'rgba(255,255,255,0.3)', fontSize: 20 },
  logoutBtn: { alignItems: 'center', padding: 20 },
  logoutText: { fontFamily: FONTS.heading, fontSize: 14, color: '#FF4B4B', letterSpacing: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 25 },
  modalContent: { backgroundColor: '#1A1A1A', padding: 30, borderRadius: 24, borderWidth: 1, borderColor: COLORS.gold },
  modalTitle: { fontFamily: FONTS.heading, fontSize: 18, color: COLORS.gold, marginBottom: 20, textAlign: 'center' },
  modalInput: { backgroundColor: '#000', color: '#FFF', padding: 15, borderRadius: 12, fontFamily: FONTS.body, fontSize: 18, marginBottom: 25 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelText: { fontFamily: FONTS.heading, color: 'rgba(255,255,255,0.4)' },
  saveText: { fontFamily: FONTS.heading, color: COLORS.gold },
});