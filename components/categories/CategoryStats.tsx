// components/categories/CategoryStats.tsx
import { COLORS, SIZES } from '@/constants/Theme';
import { BudgetCategory } from '@/types/category';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface CategoryStatsProps {
  categories: BudgetCategory[];
  totalAllocated: number;
  totalUsed: number;
  totalAvailable: number;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const { width } = Dimensions.get('window');

export const CategoryStats: React.FC<CategoryStatsProps> = ({
  categories,
  totalAllocated,
  totalUsed,
  totalAvailable,
}) => {
  const usagePercentage = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${Math.min(usagePercentage, 100)}%`, { damping: 15, stiffness: 200 }),
    };
  });

  const topSpendingCategories = categories
    .map(cat => ({
      ...cat,
      spent: cat.allocated_amount - cat.current_balance,
      spentPercentage: cat.allocated_amount > 0 ? ((cat.allocated_amount - cat.current_balance) / cat.allocated_amount) * 100 : 0,
    }))
    .filter(cat => cat.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📊 Resumo Financeiro</Text>
      
      {/* Cards de estatísticas */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.totalCard]}>
          <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>{formatCurrency(totalAllocated)}</Text>
          <Text style={styles.statLabel}>Total Orçado</Text>
        </View>
        
        <View style={[styles.statCard, styles.usedCard]}>
          <Ionicons name="trending-down-outline" size={24} color={COLORS.error} />
          <Text style={styles.statValue}>{formatCurrency(totalUsed)}</Text>
          <Text style={styles.statLabel}>Total Gasto</Text>
        </View>
        
        <View style={[styles.statCard, styles.availableCard]}>
          <Ionicons name="cash-outline" size={24} color={COLORS.success} />
          <Text style={styles.statValue}>{formatCurrency(totalAvailable)}</Text>
          <Text style={styles.statLabel}>Disponível</Text>
        </View>
      </View>

      {/* Barra de progresso geral */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Progresso de Gastos</Text>
          <Text style={styles.progressPercentage}>{usagePercentage.toFixed(1)}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBarFill, progressStyle]} />
        </View>
        <Text style={styles.progressDescription}>
          {usagePercentage < 50 
            ? '🟢 Você está no controle!' 
            : usagePercentage < 80 
              ? '🟡 Atenção aos gastos' 
              : '🔴 Quase no limite!'
          }
        </Text>
      </View>

      {/* Top categorias que mais gastaram */}
      {topSpendingCategories.length > 0 && (
        <View style={styles.topSpendingSection}>
          <Text style={styles.topSpendingTitle}>🔥 Categorias com Mais Gastos</Text>
          {topSpendingCategories.map((category, index) => (
            <View key={category.id} style={styles.topSpendingItem}>
              <View style={styles.topSpendingRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={[styles.categoryColorDot, { backgroundColor: category.color }]} />
              <View style={styles.topSpendingInfo}>
                <Text style={styles.topSpendingName}>{category.name}</Text>
                <Text style={styles.topSpendingAmount}>
                  {formatCurrency(category.spent)} ({category.spentPercentage.toFixed(1)}%)
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Dicas */}
      <View style={styles.tipsSection}>
        <View style={styles.tipsHeader}>
          <Ionicons name="bulb-outline" size={20} color={COLORS.primary} />
          <Text style={styles.tipsTitle}>Dica</Text>
        </View>
        <Text style={styles.tipsText}>
          {totalAvailable > totalUsed * 0.5 
            ? 'Você tem um bom controle de gastos! Continue assim.'
            : totalAvailable > 0
              ? 'Considere transferir saldo entre categorias para otimizar seu orçamento.'
              : 'Alguns orçamentos estão esgotados. Revise seus gastos ou faça transferências.'
          }
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  totalCard: {
    backgroundColor: `${COLORS.primary}15`,
  },
  usedCard: {
    backgroundColor: `${COLORS.error}15`,
  },
  availableCard: {
    backgroundColor: `${COLORS.success}15`,
  },
  statValue: {
    fontSize: SIZES.body2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
  progressSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 20,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressPercentage: {
    fontSize: SIZES.body2,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: COLORS.grayLight,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  progressDescription: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  topSpendingSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 20,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  topSpendingTitle: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  topSpendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  topSpendingRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: SIZES.body4,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  topSpendingInfo: {
    flex: 1,
  },
  topSpendingName: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.text,
  },
  topSpendingAmount: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
  },
  tipsSection: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: SIZES.radius,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tipsTitle: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  tipsText: {
    fontSize: SIZES.body3,
    color: COLORS.text,
    lineHeight: 20,
  },
});