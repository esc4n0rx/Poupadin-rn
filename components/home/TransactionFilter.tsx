// components/home/TransactionFilter.tsx
import { COLORS, SIZES } from '@/constants/Theme';
import { TransactionPeriod } from '@/services/budgetService';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TransactionFilterProps {
  selectedPeriod: TransactionPeriod;
  onSelectPeriod: (period: TransactionPeriod) => void;
}

const periods: { label: string; value: TransactionPeriod }[] = [
  { label: 'Diário', value: 'daily' },
  { label: 'Semanal', value: 'weekly' },
  { label: 'Mensal', value: 'monthly' },
];

export const TransactionFilter: React.FC<TransactionFilterProps> = ({ selectedPeriod, onSelectPeriod }) => {
  return (
    <View style={styles.container}>
      {periods.map(period => (
        <TouchableOpacity
          key={period.value}
          style={[styles.button, selectedPeriod === period.value && styles.buttonActive]}
          onPress={() => onSelectPeriod(period.value)}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedPeriod === period.value }}
        >
          <Text style={[styles.text, selectedPeriod === period.value && styles.textActive]}>
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radiusLarge,
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding * 1.5,
    padding: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: COLORS.primary,
  },
  text: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  textActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});