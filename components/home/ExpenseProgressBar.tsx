// components/home/ExpenseProgressBar.tsx
import { COLORS, SIZES } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

interface ExpenseProgressBarProps {
  totalAmount: number;
  spentAmount: number;
}

const formatCurrency = (value: number) => {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const ExpenseProgressBar: React.FC<ExpenseProgressBarProps> = ({ totalAmount, spentAmount }) => {
  const expensePercentage = totalAmount > 0 ? (spentAmount / totalAmount) * 100 : 0;

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTexts}>
        <Text style={styles.progressLabel}>Progresso de Gastos</Text>
        <Text style={styles.progressValue}>{formatCurrency(totalAmount)}</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <Animated.View
          style={[styles.progressBarFill, { width: `${Math.min(expensePercentage, 100)}%` }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    marginTop: SIZES.padding,
    paddingHorizontal: SIZES.padding,
  },
  progressTexts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: COLORS.white,
    fontSize: SIZES.body3,
    fontWeight: '500',
    opacity: 0.9,
  },
  progressValue: {
    color: COLORS.white,
    fontSize: SIZES.body3,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 5,
  },
});