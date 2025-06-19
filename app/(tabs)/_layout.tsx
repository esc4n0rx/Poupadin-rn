import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground'; // 2. Importado para o efeito de blur
import { COLORS } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 3. Componente para o ícone da aba com o indicador de "fundo verde" animado.
 */
type ActiveTabIconProps = {
  focused: boolean;
  children: React.ReactNode;
};

const ActiveTabIcon: React.FC<ActiveTabIconProps> = ({ focused, children }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      // Anima a opacidade para uma transição suave
      opacity: withTiming(focused ? 1 : 0, { duration: 200 }),
    };
  }, [focused]);

  return (
    <View style={styles.iconWrapper}>
      <Animated.View style={[styles.activeIndicator, animatedStyle]} />
      {children}
    </View>
  );
};

/**
 * Botão personalizado para a ação central.
 */
interface CustomTabBarButtonProps {
  children: React.ReactNode;
  onPress: () => void;
}

const CustomTabBarButton: React.FC<CustomTabBarButtonProps> = ({ children, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.customButtonContainer,
      pressed && styles.customButtonPressed,
    ]}
  >
    <View style={styles.customButton}>
      {children}
    </View>
  </Pressable>
);

export default function TabLayout() {
  const { user, setupCompleted, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/(auth)/welcome');
      return;
    }
    if (!setupCompleted) {
      router.replace('/budget-setup');
      return;
    }
  }, [user, setupCompleted, isLoading, router]);

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
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#95A5A6',
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        // 2. Usa o componente de blur como fundo da barra
        tabBarBackground: TabBarBackground,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <ActiveTabIcon focused={focused}>
              <IconSymbol name="house.fill" size={28} color={color} />
            </ActiveTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, focused }) => (
            <ActiveTabIcon focused={focused}>
              <IconSymbol name="chart.bar.fill" size={28} color={color} />
            </ActiveTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="explore" // Botão central de Despesas
        options={{
          title: 'Despesas',
          tabBarLabel: () => null,
          tabBarIcon: () => (
             <IconSymbol name="arrow.up.arrow.down" size={32} color={COLORS.white} />
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton
              {...props}
              onPress={() => router.push('/(tabs)/explore')}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, focused }) => (
            <ActiveTabIcon focused={focused}>
              <IconSymbol name="wallet.pass.fill" size={24} color={color} />
            </ActiveTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <ActiveTabIcon focused={focused}>
              <IconSymbol name="person.fill" size={28} color={color} />
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
    bottom: 25,
    left: 20,
    right: 20,
    // 2. Fundo transparente para que o efeito de blur seja visível.
    backgroundColor: 'transparent', 
    borderRadius: 15,
    height: 70,
    borderTopWidth: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    paddingBottom: 5,
  },
  iconWrapper: {
    width: 60,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 17, // Raio para criar o formato de "pílula"
  },
  activeIndicator: {
    ...StyleSheet.absoluteFillObject,
    // 3. Estilo do "fundo verde" para a aba ativa.
    backgroundColor: COLORS.primary,
    borderRadius: 17,
    opacity: 0.2, // Uma opacidade sutil para não ofuscar o ícone.
  },
  customButtonContainer: {
    // 1. Botão central foi levemente abaixado (de -30 para -22).
    top: -22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
   customButtonPressed: {
    opacity: 0.9,
  },
});