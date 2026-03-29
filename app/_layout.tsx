import '../global.css';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Bangers_400Regular } from '@expo-google-fonts/bangers';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { colorScheme } from 'nativewind';
import { useAuth } from '../hooks/useAuth';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

export default function RootLayout() {
  const { session, loading: authLoading } = useAuth();
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Bangers_400Regular,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    colorScheme.set('dark');
  }, []);

  useEffect(() => {
    if (fontsLoaded && !authLoading) {
      setAppIsReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authLoading]);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D0D', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F5C542" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0D0D0D' },
          animation: 'slide_from_right',
        }}
      >
        {/* Static Screens for the Nav Tree to clear warnings */}
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" redirect={!!session} />
        <Stack.Screen name="(tabs)" redirect={!session} />
        <Stack.Screen name="(onboarding)" redirect={!session} />
        <Stack.Screen 
          name="xp-log" 
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }} 
        />
      </Stack>
    </QueryClientProvider>
  );
}