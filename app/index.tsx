import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
      }}>
        <ActivityIndicator color={COLORS.gold} size="large" />
      </View>
    );
  }

  if (user) return <Redirect href="/(tabs)/" />;
  return <Redirect href="/(auth)/splash" />;
}