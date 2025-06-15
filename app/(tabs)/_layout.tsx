// app/(tabs)/_layout.tsx
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, setupCompleted, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Aguardar o carregamento dos dados
    if (isLoading) return;

    if (!user) {
      router.replace('/(auth)/welcome');
      return;
    }

    // Se o usuário está logado mas não fez o setup inicial
    if (!setupCompleted) {
      router.replace('/budget-setup');
      return;
    }
  }, [user, setupCompleted, isLoading, router]);

  // Mostrar loading enquanto verifica o status
  if (isLoading || !user) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: COLORS.background 
      }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Se setup não foi feito, não renderizar as tabs
  if (!setupCompleted) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="budget-setup"
        options={{
          href: null, // Ocultar da tab bar
        }}
      />
    </Tabs>
  );
}