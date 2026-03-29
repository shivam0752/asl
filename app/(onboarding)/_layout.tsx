import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="set-display-name" />
      <Stack.Screen name="connect-linkedin" />
      <Stack.Screen name="connect-googlefit" />
      <Stack.Screen name="generating" />
      <Stack.Screen name="class-reveal" />
      <Stack.Screen name="manual-entry" />
    </Stack>
  );
}