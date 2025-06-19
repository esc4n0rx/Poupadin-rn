// components/home/RecentGoalsCard.tsx
import { COLORS, SIZES } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const RecentGoalsCard = () => {
  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <View style={styles.iconContainer}>
          <Ionicons name="car-sport-outline" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Metas e Economia</Text>
        <Text style={styles.subtitle}>On Goals</Text>
      </View>
      <View style={styles.separator} />
      <View style={styles.rightColumn}>
        <View style={styles.itemRow}>
          <Ionicons name="arrow-up-circle-outline" size={22} color={COLORS.success} />
          <View style={styles.itemTextContainer}>
            <Text style={styles.itemTitle}>Renda Semana Passada</Text>
            <Text style={styles.itemValue}>R$ 1.500,00</Text>
          </View>
        </View>
        <View style={styles.itemRow}>
          <Ionicons name="fast-food-outline" size={22} color={COLORS.error} />
          <View style={styles.itemTextContainer}>
            <Text style={styles.itemTitle}>Comida Semana Passada</Text>
            <Text style={[styles.itemValue, { color: COLORS.error }]}>- R$ 100,00</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginTop: 20,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: SIZES.body3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
  },
  separator: {
    width: 1,
    backgroundColor: COLORS.inputBorder,
    marginHorizontal: 16,
  },
  rightColumn: {
    flex: 1.5,
    justifyContent: 'space-around',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTextContainer: {
    marginLeft: 8,
  },
  itemTitle: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
  },
  itemValue: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.text,
  },
});