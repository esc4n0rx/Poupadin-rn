// components/CustomTabBar.tsx
import { COLORS, SIZES } from '@/constants/Theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './ui/IconSymbol';

const ICON_MAPPING: { [key: string]: string } = {
  index: 'house.fill',
  stats: 'chart.bar.xaxis',
  explore: 'arrow.up.arrow.down',
  wallet: 'wallet.pass.fill',
  profile: 'person.fill',
};

export const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  const TabBarComponent = Platform.OS === 'ios' ? BlurView : View;
  const tabBarProps = Platform.OS === 'ios' 
    ? { tint: 'light' as const, intensity: 90 } 
    : { style: { backgroundColor: 'rgba(255, 255, 255, 0.95)' } };

  return (
    <View style={styles.tabBarContainer}>
      <TabBarComponent {...tabBarProps} style={[styles.tabBar, { paddingBottom: insets.bottom / 2 }]}>
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
          const color = isFocused ? COLORS.primary : COLORS.gray;

          if (isCenterButton) {
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel || label}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.centerButtonWrapper}
              >
                <View style={styles.centerButton}>
                  <IconSymbol name={iconName} size={30} color={COLORS.white} />
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
              <IconSymbol name={iconName} size={24} color={color} />
              <Text style={[styles.tabLabel, { color }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </TabBarComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    borderRadius: SIZES.radiusLarge,
    overflow: 'hidden',
    alignItems: 'center',
    borderWidth: Platform.OS === 'android' ? 1 : 0,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -15 }],
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});