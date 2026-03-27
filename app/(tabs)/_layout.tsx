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
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {source ? (
        <Image
          source={source}
          style={{ width: 24, height: 24, opacity: focused ? 1 : 0.5 }}
          resizeMode="contain"
        />
      ) : (
        <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { session, loading, user } = useAuth();
  const { character } = useCharacter(user?.id);
  const router = useRouter();
  const previousLevelRef = useRef<number | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelJump, setLevelJump] = useState<{ from: number; to: number } | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/(auth)/splash');
    }
  }, [session, loading]);

  useEffect(() => {
    if (!character?.level) return;
    const previousLevel = previousLevelRef.current;
    if (previousLevel !== null && character.level > previousLevel) {
      setLevelJump({ from: previousLevel, to: character.level });
      setShowLevelUp(true);
    }
    previousLevelRef.current = character.level;
  }, [character?.level]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center' }}>
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
          tabBarShowLabel: false, // Hides the text completely
          tabBarBackground: () => (
            <LinearGradient
              colors={['#1A1A1A', '#0F0F0F']}
              style={{ 
                flex: 1, 
                borderRadius: 30, // Rounded corners for the gradient
                borderWidth: 1,
                borderColor: '#333'
              }}
            />
          ),
          tabBarStyle: {
            position: 'absolute',
            // Lessen the width by adding horizontal margin
            left: 20,
            right: 20,
            bottom: Platform.OS === 'ios' ? 20 : 5, // Float it off the bottom
            
            height: 44,
            borderRadius: 30,
            backgroundColor: 'transparent',
            elevation: 5, // Shadow for Android
            shadowColor: '#000', // Shadow for iOS
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            borderTopWidth: 0, // Remove default line
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
          name="progress"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} source={APP_ASSETS.tabProgress} emoji="📈" />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} source={APP_ASSETS.tabProfile} emoji="👤" />
            ),
          }}
        />
      </Tabs>

      <LevelUpModal
        visible={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        currentLevel={levelJump?.from ?? null}
        newLevel={levelJump?.to ?? null}
        totalXp={character?.totalXp ?? 0}
      />
    </>
  );
}