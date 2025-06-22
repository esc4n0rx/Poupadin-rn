import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { COLORS } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Componente para o ícone da aba com indicador circular verde animado
 */
type ActiveTabIconProps = {
  focused: boolean;
  children: React.ReactNode;
};

const ActiveTabIcon: React.FC<ActiveTabIconProps> = ({ focused, children }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(focused ? 1 : 0, { duration: 300 }),
      transform: [
        {
          scale: withTiming(focused ? 1 : 0.8, { duration: 300 }),
        },
      ],
    };
  }, [focused]);

  return (
    <View style={styles.iconWrapper}>
      <Animated.View style={[styles.activeIndicator, animatedStyle]} />
      <View style={styles.iconContainer}>
        {children}
      </View>
    </View>
  );
};

/**
 * Botão personalizado para a ação central (Despesas)
 */
interface CustomTabBarButtonProps {
  children: React.ReactNode;
  onPress: () => void;
}

const CustomTabBarButton: React.FC<CustomTabBarButtonProps> = ({ children, onPress }) => (
  <View style={styles.customButtonWrapper}>
    <View style={styles.customButton}>
      <View style={styles.customButtonInner} onTouchEnd={onPress}>
        {children}
      </View>
    </View>
  </View>
);

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
      screenOptions={{
        tabBarActiveTintColor: COLORS.text,
        tabBarInactiveTintColor: COLORS.grayDark,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarBackground: TabBarBackground,
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <ActiveTabIcon focused={focused}>
              <IconSymbol size={24} name="house" color={color} />
            </ActiveTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Orçamento',
          tabBarIcon: ({ color, focused }) => (
            <ActiveTabIcon focused={focused}>
              <IconSymbol size={24} name="chart.pie" color={color} />
            </ActiveTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '',
          tabBarButton: (props) => (
            <CustomTabBarButton onPress={() => router.push('/explore')}>
              <IconSymbol size={28} name="plus" color={COLORS.white} />
            </CustomTabBarButton>
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Metas',
          tabBarIcon: ({ color, focused }) => (
            <ActiveTabIcon focused={focused}>
              <IconSymbol size={24} name="target" color={color} />
            </ActiveTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <ActiveTabIcon focused={focused}>
              <IconSymbol size={24} name="person" color={color} />
            </ActiveTabIcon>
          ),
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
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    top: -2,
    right: -2,
  },
  iconContainer: {
    padding: 4,
  },
  customButtonWrapper: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  customButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    height: 85,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 35,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});