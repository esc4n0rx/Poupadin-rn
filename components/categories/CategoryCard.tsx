// components/categories/CategoryCard.tsx
import { COLORS, SIZES } from '@/constants/Theme';
import { BudgetCategory } from '@/types/category';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface CategoryCardProps {
  category: BudgetCategory;
  onPress: () => void;
  onTransfer: () => void;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress, onTransfer }) => {
  const usedAmount = category.allocated_amount - category.current_balance;
  const usagePercentage = category.allocated_amount > 0 ? (usedAmount / category.allocated_amount) * 100 : 0;
  
  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(1, { damping: 20, stiffness: 300 }),
        },
      ],
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${Math.min(usagePercentage, 100)}%`, { damping: 15, stiffness: 200 }),
    };
  });

  return (
    <Animated.View style={[styles.container, cardStyle]}>
      <TouchableOpacity style={styles.cardContent} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={[styles.colorIndicator, { backgroundColor: category.color }]} />
            <View style={styles.titleTexts}>
              <Text style={styles.categoryName} numberOfLines={1}>{category.name}</Text>
              <Text style={styles.balanceText}>
                Disponível: {formatCurrency(category.current_balance)}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onTransfer} style={styles.transferButton}>
            <Ionicons name="swap-horizontal" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.amountContainer}>
          <View style={styles.amountRow}>
            <Text style={styles.label}>Orçado:</Text>
            <Text style={styles.allocatedAmount}>{formatCurrency(category.allocated_amount)}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.label}>Gasto:</Text>
            <Text style={[styles.usedAmount, { color: usedAmount > 0 ? COLORS.error : COLORS.textLight }]}>
              {formatCurrency(usedAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { backgroundColor: category.color },
                progressStyle
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{usagePercentage.toFixed(1)}%</Text>
        </View>

        {usagePercentage > 90 && category.current_balance > 0 && (
          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={16} color={COLORS.error} />
            <Text style={styles.warningText}>Quase sem saldo!</Text>
          </View>
        )}

        {category.current_balance <= 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle" size={16} color={COLORS.error} />
            <Text style={styles.emptyText}>Saldo esgotado</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  cardContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.padding,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 12,
  },
  titleTexts: {
    flex: 1,
  },
  categoryName: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  balanceText: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    marginTop: 2,
  },
  transferButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountContainer: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
  },
  allocatedAmount: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.text,
  },
  usedAmount: {
    fontSize: SIZES.body3,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.grayLight,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: SIZES.body4,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 40,
    textAlign: 'right',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.error}15`,
    padding: 8,
    borderRadius: SIZES.radiusSmall,
    gap: 6,
  },
  warningText: {
    fontSize: SIZES.body4,
    color: COLORS.error,
    fontWeight: '500',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.error}20`,
    padding: 8,
    borderRadius: SIZES.radiusSmall,
    gap: 6,
  },
  emptyText: {
    fontSize: SIZES.body4,
    color: COLORS.error,
    fontWeight: '600',
  },
});