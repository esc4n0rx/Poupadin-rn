// components/goals/GoalCard.tsx
import { COLORS, SIZES } from '@/constants/Theme';
import { Goal } from '@/types/goals';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';

interface GoalCardProps {
  goal: Goal;
  onPress: () => void;
  onTransaction: () => void;
  onComplete?: () => void;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const GoalCard: React.FC<GoalCardProps> = ({ 
  goal, 
  onPress, 
  onTransaction, 
  onComplete 
}) => {
  const progressPercentage = Math.min(goal.progress || 0, 100);
  const remainingAmount = goal.target_amount - goal.current_amount;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.colorIndicator, { backgroundColor: goal.color }]} />
          <View style={styles.titleTexts}>
            <Text style={styles.goalName} numberOfLines={1}>{goal.name}</Text>
            {goal.description && (
              <Text style={styles.goalDescription} numberOfLines={1}>{goal.description}</Text>
            )}
          </View>
        </View>
        {goal.is_completed ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
          </View>
        ) : (
          <TouchableOpacity onPress={onTransaction} style={styles.addButton}>
            <Ionicons name="add" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.currentAmount}>{formatCurrency(goal.current_amount)}</Text>
        <Text style={styles.targetAmount}>de {formatCurrency(goal.target_amount)}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressPercentage}%`,
                backgroundColor: goal.color
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{progressPercentage.toFixed(1)}%</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.infoRow}>
          {goal.target_date && (
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.infoText}>Meta: {formatDate(goal.target_date)}</Text>
            </View>
          )}
          {remainingAmount > 0 && (
            <View style={styles.infoItem}>
              <Ionicons name="trending-up-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.infoText}>Faltam: {formatCurrency(remainingAmount)}</Text>
            </View>
          )}
        </View>

        {!goal.is_completed && goal.progress >= 100 && onComplete && (
          <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
            <Text style={styles.completeButtonText}>Marcar como Concluído</Text>
            <Ionicons name="flag-outline" size={16} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.padding,
    marginBottom: 16,
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
    marginBottom: 12,
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
  goalName: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  goalDescription: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    marginTop: 2,
  },
  completedBadge: {
    padding: 4,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountContainer: {
    marginBottom: 12,
  },
  currentAmount: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  targetAmount: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.grayLight,
    borderRadius: 4,
    marginRight: 12,
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
  footer: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius,
    gap: 6,
  },
  completeButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body4,
    fontWeight: '600',
  },
});