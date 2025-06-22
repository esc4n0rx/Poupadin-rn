import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CustomTabBar } from '@/components/CustomTabBar';
import { COLORS } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user, setupCompleted, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Não fazer nada se ainda estiver carregando
    if (isLoading) return;

    // Verificar se estamos nas tabs
    const inTabsGroup = segments[0] === '(tabs)';

    console.log(`🧭 [TABS_LAYOUT] Estado:`, {
      user: !!user,
      setupCompleted,
      isLoading,
      segments,
      inTabsGroup
    });

    // Se não há usuário e estamos nas tabs, redirecionar
    if (!user && inTabsGroup) {
      console.log(`🔄 [TABS_LAYOUT] Redirecionando para auth (usuário não logado)`);
      router.replace('/(auth)/welcome');
      return;
    }

    // ✅ CORREÇÃO: Só redirecionar se há usuário, setup não foi completado e estamos nas tabs
    // Agora que budget-setup está fora do grupo (tabs), não vai mais dar loop
    if (user && !setupCompleted && inTabsGroup) {
      console.log(`🔄 [TABS_LAYOUT] Redirecionando para budget-setup (setup incompleto)`);
      router.replace('/budget-setup');
      return;
    }
  }, [user, setupCompleted, isLoading, segments]);

  // Mostrar loading se ainda estiver carregando
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // ✅ CORREÇÃO: Se usuário não completou setup, mostrar loading até redirecionamento
  if (!user || !setupCompleted) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}>
      {/* 1. Início */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
        }}
      />
      {/* 2. Objetivos */}
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Objetivos',
        }}
      />
      {/* 3. Despesas (Centro) */}
      <Tabs.Screen
        name="explore"
        options={{
          title: '',
        }}
      />
      {/* 4. Categorias */}
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Categorias',
        }}
      />
      {/* 5. Perfil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});