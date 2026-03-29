import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  Image, 
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

// Tactical Helper: Protocol Button Component
const ProtocolButton = ({ label, isPrimary, onPress, icon }: any) => (
  <TouchableOpacity 
    activeOpacity={0.85} 
    onPress={onPress} 
    style={styles.protocolBtnWrapper}
  >
    {/* The Slanted Shape */}
    <View style={[
      styles.skewContainer, 
      isPrimary ? styles.primarySkew : styles.secondarySkew
    ]}>
      <LinearGradient
        colors={isPrimary ? ['#F7D781', '#F5C542'] : ['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.8)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      
      {/* Reverse Skew for Content */}
      <View style={styles.unskewContent}>
        <Text 
          style={[
            styles.btnText, 
            isPrimary ? styles.primaryText : styles.secondaryText
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {icon && <Text style={styles.btnIcon}>{icon}</Text>}
      </View>

      {/* Glossy Top Highlight */}
      <View style={styles.glossOverlay} />
    </View>

    {/* Structural Bevel Shadow */}
    <View style={[
      styles.btnBevel, 
      isPrimary ? { backgroundColor: '#B8860B' } : { backgroundColor: 'rgba(245, 197, 66, 0.2)' }
    ]} />
  </TouchableOpacity>
);

export default function Splash() {
  const router = useRouter();
  const { user } = useAuth();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) router.replace('/(tabs)/');
  }, [user]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -12, duration: 3000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Deep Space Background */}
      <LinearGradient colors={['#050505', '#111', '#050505']} style={StyleSheet.absoluteFill} />

      {/* 1. LOGO LAYER (Watermark Centered) */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.largeLogo}
          resizeMode="contain"
        />
      </View>

      {/* 2. TEXT CONTENT LAYER */}
      <Animated.View style={[styles.headerGroup, { transform: [{ translateY: floatAnim }] }]}>
        <Text style={styles.appName}>ALS</Text>
        <Text style={styles.fullBrand}>AETHER LEVEL SYSTEM</Text>
        <View style={styles.accentLine} />
        <Text style={styles.tagline}>YOUR REAL LIFE. LEVELED UP.</Text>
      </Animated.View>

      {/* 3. BUTTONS LAYER */}
      <View style={styles.buttonGroup}>
        <ProtocolButton 
          label=" GET STARTED " 
          isPrimary={true} 
          onPress={() => router.push('/(auth)/signup')} 
          icon="⚡"
        />
        
        <ProtocolButton 
          label=" LOG IN " 
          isPrimary={true} 
          onPress={() => router.push('/(auth)/login')} 
        />
        
        <Text style={styles.versionFooter}>
          CORE ENGINE v1.0.0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#050505' 
  },
  
  // LOGO STYLING
  logoContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  largeLogo: { 
    width: width * 0.8, 
    height: width * 0.8,
    opacity: 0.2, // Subtle watermark
  },

  // HEADER STYLING
  headerGroup: { 
    alignItems: 'center', 
    marginTop: height * 0.12,
    zIndex: 2,
  },
  appName: { 
    fontFamily: FONTS.heading, 
    fontSize: 84, 
    color: COLORS.gold, 
    letterSpacing: 12,
    includeFontPadding: false,
    textShadowColor: 'rgba(245, 197, 66, 0.3)',
    textShadowRadius: 15
  },
  fullBrand: { 
    fontFamily: FONTS.bodyBold, 
    fontSize: 12, 
    color: 'rgba(255,255,255,0.4)', 
    letterSpacing: 4, 
    marginTop: -8 
  },
  accentLine: { 
    width: 40, 
    height: 2, 
    backgroundColor: COLORS.gold, 
    marginVertical: 22 
  },
  tagline: { 
    fontFamily: FONTS.body, 
    fontSize: 13, 
    color: COLORS.gold, 
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // BUTTON STYLING
  buttonGroup: { 
    position: 'absolute', 
    bottom: 50, 
    width: '100%', 
    paddingHorizontal: 40, 
    gap: 15, 
    zIndex: 3 
  },
  protocolBtnWrapper: {
    width: '100%',
    height: 62, 
    marginBottom: 5,
  },
  skewContainer: {
    flex: 1,
    transform: [{ skewX: '-15deg' }],
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  primarySkew: {
    backgroundColor: '#F5C542',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  secondarySkew: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(245, 197, 66, 0.5)', // Glowing Gold Border
  },
  unskewContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ skewX: '15deg' }],
    // THE CUT-OFF FIX: Massive padding ensures text never hits the "Guillotine" edges
    paddingHorizontal: 45, 
  },
  btnText: {
    fontFamily: FONTS.heading,
    fontSize: 16, 
    letterSpacing: 2,
    includeFontPadding: false,
    // THE MOBILE FIX: Forces line-height to give room for the letters
    lineHeight: 22,
    textAlign: 'center',
  },
  primaryText: { 
    color: '#000',
  },
  secondaryText: { 
    color: COLORS.gold,
    textShadowColor: 'rgba(245, 197, 66, 0.4)',
    textShadowRadius: 10,
  },
  btnIcon: { 
    fontSize: 18, 
    color: '#000',
    marginLeft: 8,
  },
  glossOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  btnBevel: {
    position: 'absolute',
    bottom: -4,
    left: 8,
    right: -8,
    height: 8,
    transform: [{ skewX: '-15deg' }],
    zIndex: -1,
    opacity: 0.3,
  },
  versionFooter: {
    fontFamily: FONTS.body,
    fontSize: 9,
    color: COLORS.gold,
    opacity: 0.4,
    letterSpacing: 3,
    marginTop: 15,
    textAlign: 'center',
  }
});