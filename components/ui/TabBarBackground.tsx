// TabBarBackground padrão para Android e Web - fundo branco sólido
import { COLORS } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function TabBarBackground() {
  return <View style={styles.background} />;
}

export function useBottomTabOverflow() {
  return 0;
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white,
    borderRadius: 20,
  },
});