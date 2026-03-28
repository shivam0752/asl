import { useEffect, useRef, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { COLORS, FONTS } from '../../constants/theme';
import { Text, View, ActivityIndicator, Image, Platform } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useCharacter } from '../../hooks/useCharacter';
import LevelUpModal from '../../components/modals/LevelUpModal';
import { APP_ASSETS } from '../../constants/assets';
import { LinearGradient } from 'expo-linear-gradient';

function TabIcon({
  focused,
  source,
  emoji,
}: {
  focused: boolean;
  source: any;
  emoji: string;
}) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      {source ? (
        <Image
          source={source}
          style={{ 
            width: 22, // Slimmed down icon size
            height: 22, 
            opacity: focused ? 1 : 0.4,
            tintColor: focused ? COLORS.gold : '#FFF' 
          }}
          resizeMode="contain"
        />
      ) : (
        <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>
      )}
      {/* Subtle indicator dot for active tab */}
      {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.gold, marginTop: 4, position: 'absolute', bottom: -8 }} />}
    </View>
  );
}

export default function TabLayout() {
  const { session, loading, user } = useAuth();
  const { character } = useCharacter(user?.id);
  const router = useRouter();
  
  const previousLevelRef = useRef<number | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<number>(1);

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/(auth)/splash');
    }
  }, [session, loading]);

  useEffect(() => {
    if (!character?.level) return;
    const previousLevel = previousLevelRef.current;
    if (previousLevel !== null && character.level > previousLevel) {
      setCurrentLevel(character.level);
      setShowLevelUp(true);
    }
    previousLevelRef.current = character.level;
  }, [character?.level]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D0D', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.gold} />
      </View>
    );
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.gold,
          tabBarShowLabel: false,
          tabBarBackground: () => (
            <LinearGradient
              colors={['#1A1A1A', '#0A0A0A']}
              style={{ 
                flex: 1, 
                borderRadius: 25,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)'
              }}
            />
          ),
          tabBarStyle: {
            position: 'absolute',
            left: 30, // Increased margin to make it narrower
            right: 30,
            bottom: Platform.OS === 'ios' ? 30 : 15, 
            height: 50, // SLIMMED DOWN from 60
            borderRadius: 25,
            backgroundColor: 'transparent',
            elevation: 0,
            borderTopWidth: 0,
            paddingBottom: 0, // Reset padding to center icons vertically
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} source={APP_ASSETS.tabHome} emoji="🏠" />
            ),
          }}
        />
        <Tabs.Screen
          name="character"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} source={APP_ASSETS.tabCharacter} emoji="⚔️" />
            ),
          }}
        />
        <Tabs.Screen
          name="evolution"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} source={null} emoji="🧬" />
            ),
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} source={APP_ASSETS.tabProgress} emoji="📊" />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} source={APP_ASSETS.tabProfile} emoji="⚙️" />
            ),
          }}
        />
      </Tabs>

      <LevelUpModal
        visible={showLevelUp}
        level={currentLevel}
        onClose={() => setShowLevelUp(false)}
      />
    </>
  );
}