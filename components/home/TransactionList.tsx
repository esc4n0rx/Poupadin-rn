// components/home/TransactionList.tsx
import { COLORS, SIZES } from '@/constants/Theme';
import { Category, Transaction } from '@/types/budget';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
}

const getCategoryIcon = (categoryName?: string): keyof typeof Ionicons.glyphMap => {
  const name = categoryName?.toLowerCase() || '';
  if (name.includes('salário') || name.includes('renda')) return 'cash-outline';
  if (name.includes('mercado') || name.includes('compras') || name.includes('alimentação')) return 'cart-outline';
  if (name.includes('aluguel') || name.includes('moradia')) return 'home-outline';
  if (name.includes('transporte') || name.includes('gasolina') || name.includes('carro')) return 'car-sport-outline';
  if (name.includes('lazer') || name.includes('cinema')) return 'film-outline';
  if (name.includes('educação') || name.includes('curso')) return 'school-outline';
  return 'apps-outline';
};

const TransactionItem: React.FC<{ item: Transaction; index: number; categories: Category[] }> = ({ item, index, categories }) => {
  const isExpense = item.transaction_type === 'expense';
  const isIncome = item.transaction_type === 'income';
  
  const categoryName = item.budget_categories?.name || 'Categoria não informada';
  const category = categories.find(c => c.name === categoryName);

  // ✅ CORREÇÃO: Verificação simplificada - apenas dados válidos
  if (!item || !item.id) {
    console.warn('⚠️ Item inválido filtrado:', item);
    return null;
  }

  // ✅ ADIÇÃO: Log para debug de tipos inesperados
  if (!isExpense && !isIncome) {
    console.warn('⚠️ Tipo de transação inesperado passou pelo filtro:', {
      id: item.id,
      type: item.transaction_type,
      description: item.description
    });
    return null;
  }

  return (
    <Animated.View
      style={styles.itemContainer}
      entering={FadeInUp.duration(500).delay(index * 100)}
    >
      <View style={[styles.iconContainer, { backgroundColor: category?.color || COLORS.secondary }]}>
        <Ionicons
          name={getCategoryIcon(categoryName)}
          size={24}
          color={category?.color ? COLORS.white : COLORS.primary}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.description} numberOfLines={1}>
          {item.description || 'Transação sem descrição'}
        </Text>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryName} numberOfLines={1}>
            {categoryName}
          </Text>
          {/* ✅ ADIÇÃO: Badge do tipo de transação */}
          <View style={[styles.typeBadge, isExpense ? styles.expenseBadge : styles.incomeBadge]}>
            <Text style={[styles.typeText, isExpense ? styles.expenseText : styles.incomeText]}>
              {isExpense ? 'Despesa' : 'Receita'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, isExpense ? styles.expense : styles.income]}>
          {isExpense ? '-' : '+'} {(item.amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
        <Text style={styles.dateText}>
          {new Date(item.created_at).toLocaleDateString('pt-BR')}
        </Text>
      </View>
    </Animated.View>
  );
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories }) => {
  // ✅ CORREÇÃO: Filtro final simplificado - apenas verificar se são income/expense
  const validTransactions = (transactions || []).filter(transaction => {
    const isValid = transaction && transaction.id && typeof transaction.id === 'string';
    const isRealTransaction = transaction.transaction_type === 'income' || transaction.transaction_type === 'expense';
    return isValid && isRealTransaction;
  });
  
  const validCategories = categories || [];

  console.log('📋 TransactionList renderizando:', {
    totalReceived: transactions.length,
    afterFiltering: validTransactions.length,
    categoriesCount: validCategories.length
  });

  if (validTransactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={48} color={COLORS.grayLight} />
        <Text style={styles.emptyTitle}>Nenhuma transação encontrada</Text>
        <Text style={styles.emptyText}>
          Suas receitas e despesas aparecerão aqui.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>💰 Transações Recentes</Text>
        <Text style={styles.listSubtitle}>
          {validTransactions.length} {validTransactions.length === 1 ? 'transação' : 'transações'}
        </Text>
      </View>
      
      <FlatList
        data={validTransactions}
        keyExtractor={(item, index) => item?.id || `transaction-${index}`}
        renderItem={({ item, index }) => (
          <TransactionItem item={item} index={index} categories={validCategories} />
        )}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  listHeader: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: SIZES.body2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  listSubtitle: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
  },
  listContent: {
    paddingHorizontal: SIZES.padding,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    marginBottom: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryName: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    flex: 1,
  },
  // ✅ ADIÇÃO: Estilos para o badge de tipo
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  expenseBadge: {
    backgroundColor: `${COLORS.error}15`,
  },
  incomeBadge: {
    backgroundColor: `${COLORS.success}15`,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  expenseText: {
    color: COLORS.error,
  },
  incomeText: {
    color: COLORS.success,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: SIZES.body2,
    fontWeight: 'bold',
  },
  income: {
    color: COLORS.success,
  },
  expense: {
    color: COLORS.error,
  },
  dateText: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: SIZES.padding,
  },
  emptyTitle: {
    fontSize: SIZES.body2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});