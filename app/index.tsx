// app/index.tsx
import { CustomStatusBar } from '@/components/CustomStatusBar';
import { COLORS } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const segments = useSegments();
  const { user, setupCompleted, isLoading } = useAuth();

  useEffect(() => {
    // Não fazer nada se ainda estiver carregando
    if (isLoading) return;

    // Verificar se já estamos navegando para evitar loops
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inBudgetSetup = segments[0] === 'budget-setup';

    console.log(`🧭 [INDEX] Estado atual:`, {
      user: !!user,
      setupCompleted,
      isLoading,
      segments,
      inAuthGroup,
      inTabsGroup,
      inBudgetSetup
    });

    // Se não há usuário logado e não estamos no grupo de auth
    if (!user && !inAuthGroup) {
      console.log(`🔄 [INDEX] Redirecionando para welcome (não logado)`);
      router.replace('/(auth)/welcome');
      return;
    }

    // Se há usuário mas setup não foi completado e não estamos no budget-setup
    if (user && !setupCompleted && !inBudgetSetup) {
      console.log(`🔄 [INDEX] Redirecionando para budget-setup (setup incompleto)`);
      router.replace('/budget-setup');
      return;
    }

    // Se há usuário e setup foi completado mas não estamos nas tabs
    if (user && setupCompleted && !inTabsGroup) {
      console.log(`🔄 [INDEX] Redirecionando para tabs (logado e setup completo)`);
      router.replace('/(tabs)');
      return;
    }

    console.log(`✅ [INDEX] Navegação já está no lugar correto`);
  }, [user, setupCompleted, isLoading, segments]);

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