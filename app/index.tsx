// app/index.tsx
import { CustomStatusBar } from '@/components/CustomStatusBar';
import { COLORS } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const { user, setupCompleted, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (user) {
        if (setupCompleted) {
          router.replace('/(tabs)');
        } else {
          router.replace('/budget-setup');
        }
      } else {
        router.replace('/(auth)/welcome');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, setupCompleted, isLoading, router]);

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: COLORS.primary 
    }}>
      <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <ActivityIndicator size="large" color={COLORS.white} />
    </View>
  );
}