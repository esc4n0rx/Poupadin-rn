// TabBarBackground para iOS - removendo blur e usando fundo branco
import { COLORS } from '@/constants/Theme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function TabBarBackground() {
  return <View style={styles.background} />;
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white,
    borderRadius: 20,
  },
});