import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
  } from 'react-native';
  import { useRouter } from 'expo-router';
  import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
  
  export default function ConnectLinkedIn() {
    const router = useRouter();
  
    return (
      <SafeAreaView style={styles.container}>
        {/* Step indicator */}
        <View style={styles.header}>
          <Text style={styles.stepText}>Step 1 of 2</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>
  
        {/* Content */}
        <View style={styles.content}>
          {/* Logo placeholder */}
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>in</Text>
          </View>
  
          <Text style={styles.heading}>Import your career story</Text>
          <Text style={styles.subheading}>
            We use your LinkedIn data to calculate your career stats
          </Text>
  
          {/* Bullet points */}
          <View style={styles.bullets}>
            {[
              'Job title and years of experience',
              'Skills and certifications',
              'Career trajectory and growth',
            ].map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.checkmark}>✦</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
  
        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(onboarding)/connect-googlefit')}
          >
            <Text style={styles.primaryButtonText}>CONNECT LINKEDIN</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            onPress={() => router.push('/(onboarding)/connect-googlefit')}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.lg,
    },
    header: {
      marginBottom: SPACING.xxl,
    },
    stepText: {
      fontFamily: FONTS.body,
      fontSize: 13,
      color: COLORS.textSecondary,
      marginBottom: SPACING.sm,
      textAlign: 'right',
    },
    progressBar: {
      height: 4,
      backgroundColor: COLORS.surface,
      borderRadius: BORDER_RADIUS.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: COLORS.gold,
      borderRadius: BORDER_RADIUS.full,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#0A66C2',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.xl,
    },
    logoText: {
      fontFamily: FONTS.heading,
      fontSize: 36,
      color: '#FFFFFF',
    },
    heading: {
      fontFamily: FONTS.heading,
      fontSize: 30,
      color: COLORS.textPrimary,
      textAlign: 'center',
      letterSpacing: 1,
      marginBottom: SPACING.sm,
    },
    subheading: {
      fontFamily: FONTS.body,
      fontSize: 14,
      color: COLORS.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: SPACING.xl,
      paddingHorizontal: SPACING.md,
    },
    bullets: {
      width: '100%',
      gap: SPACING.md,
      paddingHorizontal: SPACING.md,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    checkmark: {
      color: COLORS.gold,
      fontSize: 14,
    },
    bulletText: {
      fontFamily: FONTS.body,
      fontSize: 15,
      color: COLORS.textPrimary,
      flex: 1,
    },
    buttons: {
      paddingBottom: 48,
      gap: SPACING.md,
      alignItems: 'center',
    },
    primaryButton: {
      backgroundColor: '#0A66C2',
      height: 52,
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    primaryButtonText: {
      fontFamily: FONTS.heading,
      fontSize: 18,
      color: '#FFFFFF',
      letterSpacing: 2,
    },
    skipText: {
      fontFamily: FONTS.body,
      fontSize: 14,
      color: COLORS.textSecondary,
    },
  });