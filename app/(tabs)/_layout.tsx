import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { COLORS, SIZES } from '@/constants/Theme';
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

    // Se há usuário mas setup não foi completado e estamos nas tabs
    if (user && !setupCompleted && inTabsGroup) {
      console.log(`🔄 [TABS_LAYOUT] Redirecionando para budget-setup (setup incompleto)`);
      router.replace('/budget-setup');
      return;
    }
  }, [user, setupCompleted, isLoading, segments]);

  // Mostrar loading se ainda estiver carregando ou se está redirecionando
  if (isLoading || !user || !setupCompleted) {
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
      <Tabs.Screen
        name="budget-setup"
        options={{
          href: null,
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
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    height: 70,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    paddingBottom: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  activeIndicator: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    opacity: 0.15,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButtonWrapper: {
    top: -15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  customButtonInner: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});