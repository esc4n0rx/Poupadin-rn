// components/home/BalanceSummary.tsx
import { COLORS, SIZES } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

interface BalanceSummaryProps {
  totalBalance: number;
  totalExpense: number;
}

const formatCurrency = (value: number) => {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({ totalBalance, totalExpense }) => {
  return (
    <Animated.View style={styles.container}>
      <View style={styles.cardsContainer}>
        <View style={[styles.card, styles.balanceCard]}>
          <Ionicons name="wallet-outline" size={24} color={COLORS.primaryDark} />
          <Text style={styles.cardTitle}>Renda Total</Text>
          <Text style={styles.cardAmount}>{formatCurrency(totalBalance)}</Text>
        </View>
        <View style={[styles.card, styles.expenseCard]}>
          <Ionicons name="trending-down-outline" size={24} color={COLORS.primaryDark} />
          <Text style={styles.cardTitle}>Total de Despesas</Text>
          <Text style={styles.cardAmount}>{formatCurrency(totalExpense)}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: SIZES.radiusLarge,
  },
  balanceCard: {
    backgroundColor: '#E8F8F5',
  },
  expenseCard: {
    backgroundColor: '#E8F8F5',
  },
  cardTitle: {
    color: COLORS.textLight,
    fontSize: SIZES.body3,
    marginTop: 8,
  },
  cardAmount: {
    color: COLORS.text,
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginTop: 4,
  },
});