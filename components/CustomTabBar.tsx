import { COLORS, SIZES } from '@/constants/Theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './ui/IconSymbol';

const { width } = Dimensions.get('window');

const ICON_MAPPING: { [key: string]: string } = {
  index: 'house.fill',           // Início
  goals: 'chart.bar.xaxis',      // Objetivos
  explore: 'arrow.up.arrow.down', // Despesas (centro)
  budget: 'wallet.pass.fill',     // Categorias  
  profile: 'person.fill',        // Perfil
};

export const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  
  // Altura responsiva baseada na tela
  const tabBarHeight = Math.max(70, width * 0.20);
  const horizontalMargin = width * 0.05; // 5% da largura da tela
  const bottomMargin = Math.max(20, insets.bottom * 0.8);

  return (
    <View style={[
      styles.tabBarContainer,
      {
        bottom: bottomMargin,
        left: horizontalMargin,
        right: horizontalMargin,
      }
    ]}>
      <View style={[
        styles.tabBar,
        {
          height: tabBarHeight,
          paddingBottom: Math.max(8, insets.bottom * 0.3),
        }
      ]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const isCenterButton = route.name === 'explore';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconName = ICON_MAPPING[route.name] || 'help-outline';
          const iconColor = isFocused ? COLORS.primary : COLORS.black;
          const textColor = isFocused ? COLORS.primary : COLORS.black;

          if (isCenterButton) {
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel || 'Registrar Despesa'}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.centerButtonWrapper}
              >
                <View style={[
                  styles.centerButton,
                  {
                    width: tabBarHeight * 0.85,
                    height: tabBarHeight * 0.85,
                    borderRadius: (tabBarHeight * 0.85) / 2,
                  }
                ]}>
                  <IconSymbol 
                    name={iconName} 
                    size={Math.min(30, tabBarHeight * 0.4)} 
                    color={COLORS.white} 
                  />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              <IconSymbol 
                name={iconName} 
                size={Math.min(24, tabBarHeight * 0.32)} 
                color={iconColor} 
              />
              <Text style={[
                styles.tabLabel, 
                { 
                  color: textColor,
                  fontSize: Math.min(10, tabBarHeight * 0.14),
                }
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 1000,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: Platform.OS === 'android' ? 0.5 : 0,
    borderColor: 'rgba(0,0,0,0.08)',
    opacity: 0.98,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -12 }],
  },
  centerButton: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  tabLabel: {
    marginTop: 2,
    fontWeight: '600',
    textAlign: 'center',
  },
});