// components/home/TransactionList.tsx
import { COLORS, SIZES } from '@/constants/Theme';
import { Category, Transaction } from '@/types/budget';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[]; // Recebe a lista de categorias para pegar a cor
}

const getCategoryIcon = (categoryName?: string): keyof typeof Ionicons.glyphMap => {
  const name = categoryName?.toLowerCase() || '';
  if (name.includes('salário') || name.includes('renda')) return 'cash-outline';
  if (name.includes('mercado') || name.includes('compras')) return 'cart-outline';
  if (name.includes('aluguel') || name.includes('moradia')) return 'home-outline';
  if (name.includes('transporte') || name.includes('gasolina')) return 'car-sport-outline';
  if (name.includes('lazer') || name.includes('cinema')) return 'film-outline';
  return 'apps-outline';
};

const TransactionItem: React.FC<{ item: Transaction; index: number; categories: Category[] }> = ({ item, index, categories }) => {
  const isExpense = item.transaction_type === 'expense';
  
  // ✅ CORREÇÃO: Busca a categoria para obter a cor
  const category = categories.find(c => c.name === item.budget_categories.name);

  return (
    <Animated.View
      style={styles.itemContainer}
      entering={FadeInUp.duration(500).delay(index * 100)}
    >
      <View style={[styles.iconContainer, { backgroundColor: category?.color || COLORS.secondary }]}>
        <Ionicons
          name={getCategoryIcon(item.budget_categories.name)}
          size={24}
          color={category?.color ? COLORS.white : COLORS.primary}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.description}>{item.description}</Text>
        {/* ✅ CORREÇÃO: Acessa o nome da categoria corretamente */}
        <Text style={styles.date}>{item.budget_categories.name}</Text>
      </View>
      <Text style={[styles.amount, isExpense ? styles.expense : styles.income]}>
        {isExpense ? '-' : '+'} {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </Text>
    </Animated.View>
  );
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories }) => {
  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma transação neste período.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={item => item.id}
      renderItem={({ item, index }) => <TransactionItem item={item} index={index} categories={categories} />}
      contentContainerStyle={styles.listContent}
      scrollEnabled={false}
    />
  );
};
// ... (estilos permanecem os mesmos)
const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: SIZES.radius,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  description: {
    fontSize: SIZES.body3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  date: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    marginTop: 4,
  },
  amount: {
    fontSize: SIZES.body3,
    fontWeight: 'bold',
  },
  income: {
    color: COLORS.success,
  },
  expense: {
    color: COLORS.error,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: SIZES.padding,
  },
  emptyText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
  },
});