// components/home/HomeHeader.tsx
import { COLORS, SIZES } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HomeHeaderProps {
  name: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ name }) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>Olá, Bem-vindo de Volta</Text>
        <Text style={styles.userName}>{name}</Text>
      </View>
      <TouchableOpacity
        style={styles.notificationButton}
        accessibilityRole="button"
        accessibilityLabel="Notificações"
      >
        <Ionicons name="notifications-outline" size={26} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
  },
  greeting: {
    fontSize: SIZES.body3,
    color: COLORS.white,
    opacity: 0.8,
  },
  userName: {
    fontSize: SIZES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});