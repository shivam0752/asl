import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCharacter } from '../../hooks/useCharacter';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { getClassName } from '../../constants/classes';

const { width } = Dimensions.get('window');
const NODE_SIZE = 64; 
const CENTER = width / 2;

export default function Evolution() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { character } = useCharacter(user?.id);

  const currentLevel = character?.level || 1;
  const isUnlocked = (levelReq: number) => currentLevel >= levelReq;

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>EVOLUTION TREE</Text>

        <View style={styles.treeContainer}>
          {/* THE MAP LINES (SVG Background Layer) */}
          <Svg width={width} height={850} style={styles.svgOverlay}>
            <Path
              d={`M ${CENTER} 720 L ${CENTER} 520`}
              stroke={isUnlocked(10) ? COLORS.gold : '#1A1A1A'}
              strokeWidth="4"
            />
            <Path
              d={`M ${CENTER} 520 L ${CENTER - 95} 380 L ${CENTER - 95} 180`}
              stroke={isUnlocked(25) ? COLORS.gold : '#1A1A1A'}
              strokeWidth="4"
              fill="none"
            />
            <Path
              d={`M ${CENTER} 520 L ${CENTER + 95} 380 L ${CENTER + 95} 180`}
              stroke={isUnlocked(25) ? COLORS.gold : '#1A1A1A'}
              strokeWidth="4"
              fill="none"
            />
          </Svg>

          {/* LEVEL 50: PRESTIGE NODES */}
          <EvolutionNode 
            top={80} left={CENTER - 145} 
            label="POWER USER" 
            unlocked={isUnlocked(50)} 
            icon="⚡" 
            accent={COLORS.gold}
          />
          <EvolutionNode 
            top={80} left={CENTER + 55} 
            label="THE ABSOLUTE" 
            unlocked={isUnlocked(50)} 
            icon="💎" 
            accent="#00E6FF"
          />

          {/* LEVEL 25: SPECIALIZATION NODES */}
          <EvolutionNode 
            top={330} left={CENTER - 145} 
            label="HIGH ROLLER" 
            unlocked={isUnlocked(25)} 
            icon="🎰" 
          />
          <EvolutionNode 
            top={330} left={CENTER + 55} 
            label="THE TANK" 
            unlocked={isUnlocked(25)} 
            icon="🛡️" 
          />

          {/* LEVEL 1: STARTING NODE */}
          <EvolutionNode 
            top={680} left={CENTER - 45} 
            label={getClassName(character?.class || 'Grinder', 'Basic').toUpperCase()} 
            unlocked={true} 
            icon="🎴" 
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>[ NEURAL LINK STATUS ]</Text>
          <Text style={styles.infoText}>
            EVOLUTION PATHS DETECTED. LEVEL 25 REQUIRED FOR PROTOCOL SPLIT.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function EvolutionNode({ top, left, label, unlocked, icon, accent = COLORS.gold }: any) {
  return (
    <View style={[styles.nodeWrapper, { top, left }]}>
      {/* Label sits ABOVE the diamond now */}
      <View style={[styles.labelPlate, !unlocked && styles.plateLocked]}>
        <Text style={[styles.nodeLabel, !unlocked && styles.textLocked]}>{label}</Text>
      </View>

      <View style={[
        styles.nodeShape, 
        { borderColor: unlocked ? accent : '#1A1A1A' },
        unlocked && { shadowColor: accent, shadowOpacity: 0.6, shadowRadius: 15, elevation: 12 }
      ]}>
        <Text style={[styles.nodeIcon, !unlocked && { opacity: 0.1 }]}>{unlocked ? icon : '?'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#050505' },
  scrollContent: { paddingBottom: 150 },
  pageTitle: { 
    fontFamily: FONTS.heading, 
    fontSize: 16, 
    color: COLORS.gold, 
    letterSpacing: 8, 
    textAlign: 'center', 
    marginBottom: 20,
    textTransform: 'uppercase'
  },
  treeContainer: { height: 850, width: '100%', position: 'relative' },
  svgOverlay: { position: 'absolute', top: 0, left: 0, zIndex: 0 },
  nodeWrapper: { position: 'absolute', alignItems: 'center', width: 90, zIndex: 10 },
  labelPlate: {
    backgroundColor: '#050505', // Solid background to block the SVG lines
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginBottom: 8,
    minWidth: 110,
    alignItems: 'center',
    zIndex: 20,
  },
  plateLocked: { borderColor: '#1A1A1A', backgroundColor: '#000' },
  nodeShape: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    backgroundColor: '#000',
    borderWidth: 2.5,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  nodeIcon: { fontSize: 28, transform: [{ rotate: '-45deg' }] },
  nodeLabel: {
    fontFamily: FONTS.heading,
    fontSize: 12, // Larger
    color: '#FFF',
    letterSpacing: 1.5,
    textAlign: 'center',
    includeFontPadding: false,
  },
  textLocked: { color: '#333' },
  infoCard: {
    margin: 20,
    padding: 15,
    backgroundColor: '#0A0A0A',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
  },
  infoTitle: { fontFamily: FONTS.heading, fontSize: 11, color: COLORS.gold, marginBottom: 4, letterSpacing: 2 },
  infoText: { fontFamily: FONTS.bodyBold, fontSize: 10, color: '#444', letterSpacing: 1 },
});