import '../global.css';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Bangers_400Regular } from '@expo-google-fonts/bangers';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import { colorScheme } from 'nativewind';
import { useAuth } from '../hooks/useAuth'; // Importing your existing auth hook

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
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
    // Aether Standard: Force dark mode globally
    colorScheme.set('dark');
  }, []);

  useEffect(() => {
    // Only hide splash screen when fonts are loaded AND auth state is determined
    if (fontsLoaded && !authLoading) {
      setAppIsReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authLoading]);

  // Initial loading state to prevent UI flicker
  if (!appIsReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D0D', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00E6FF" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          // Optimization: Ensure background stays dark during transitions
          contentStyle: { backgroundColor: '#0D0D0D' },
          // Android: Use standard slide from right animation
          animation: 'slide_from_right',
        }}
      >
        {/* NAVIGATION LOGIC:
            If user has a session, they are locked into the (tabs) and (onboarding) groups.
            If no session, they are locked into (auth).
            This prevents the 'Back to Login' bug on Android.
        */}
        {session ? (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="xp-log" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            {/* Index is usually our entry point which redirects to /splash or /login */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </>
        )}
      </Stack>
    </QueryClientProvider>
  );
}