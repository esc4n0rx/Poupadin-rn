// components/home/RecentGoalsCard.tsx
import { COLORS, SIZES } from '@/constants/Theme';
import { useGoals } from '@/hooks/useGoals';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const getGoalIcon = (goalName: string) => {
  const name = goalName.toLowerCase();
  if (name.includes('casa') || name.includes('apartamento')) return 'home-outline';
  if (name.includes('carro') || name.includes('moto')) return 'car-sport-outline';
  if (name.includes('viagem') || name.includes('férias')) return 'airplane-outline';
  if (name.includes('emergência') || name.includes('reserva')) return 'shield-outline';
  if (name.includes('educação') || name.includes('curso')) return 'school-outline';
  return 'flag-outline';
};

export const RecentGoalsCard = () => {
  const { goals, statistics, isLoading } = useGoals();
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);

  // Filtrar apenas objetivos ativos
  const activeGoals = goals.filter(goal => goal.is_active && !goal.is_completed);

  // Rotacionar entre os objetivos a cada 4 segundos
  useEffect(() => {
    if (activeGoals.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentGoalIndex((prevIndex) => 
        (prevIndex + 1) % activeGoals.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [activeGoals.length]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.leftColumn}>
          <View style={styles.iconContainer}>
            <Ionicons name="flag-outline" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Carregando...</Text>
          <Text style={styles.subtitle}>Objetivos</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.rightColumn}>
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      </View>
    );
  }

  if (activeGoals.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.leftColumn}>
          <View style={styles.iconContainer}>
            <Ionicons name="flag-outline" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Meus Objetivos</Text>
          <Text style={styles.subtitle}>Sem objetivos ativos</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.rightColumn}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Crie seu primeiro objetivo</Text>
            <Text style={styles.emptySubtext}>e comece a poupar!</Text>
          </View>
        </View>
      </View>
    );
  }

  const currentGoal = activeGoals[currentGoalIndex];
  const remainingAmount = currentGoal.target_amount - currentGoal.current_amount;

  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <View style={[styles.iconContainer, { backgroundColor: `${currentGoal.color}20` }]}>
          <Ionicons 
            name={getGoalIcon(currentGoal.name)} 
            size={32} 
            color={currentGoal.color} 
          />
        </View>
        <Text style={styles.title} numberOfLines={1}>{currentGoal.name}</Text>
        <Text style={styles.subtitle}>
          {activeGoals.length > 1 && `${currentGoalIndex + 1}/${activeGoals.length} • `}
          {currentGoal.progress.toFixed(1)}% concluído
        </Text>
      </View>
      
      <View style={styles.separator} />
      
      <View style={styles.rightColumn}>
        <View style={styles.itemRow}>
          <Ionicons name="wallet-outline" size={22} color={COLORS.success} />
          <View style={styles.itemTextContainer}>
            <Text style={styles.itemTitle}>Valor Atual</Text>
            <Text style={styles.itemValue}>{formatCurrency(currentGoal.current_amount)}</Text>
          </View>
        </View>
        
        <View style={styles.itemRow}>
          <Ionicons name="trending-up-outline" size={22} color={COLORS.primary} />
          <View style={styles.itemTextContainer}>
            <Text style={styles.itemTitle}>
              {remainingAmount > 0 ? 'Falta Alcançar' : 'Meta Atingida!'}
            </Text>
            <Text style={[
              styles.itemValue, 
              { color: remainingAmount > 0 ? COLORS.primary : COLORS.success }
            ]}>
              {remainingAmount > 0 ? formatCurrency(remainingAmount) : '🎉'}
            </Text>
          </View>
        </View>

        {/* Barra de progresso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(currentGoal.progress, 100)}%`,
                  backgroundColor: currentGoal.color
                }
              ]} 
            />
          </View>
        </View>

        {/* Estatísticas gerais quando há apenas um objetivo */}
        {activeGoals.length === 1 && statistics && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{statistics.completed_goals}</Text>
              <Text style={styles.statLabel}>Concluídos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(statistics.total_saved)}</Text>
              <Text style={styles.statLabel}>Total Poupado</Text>
            </View>
          </View>
        )}
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
    minHeight: 120,
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 2,
  },
  separator: {
    width: 1,
    backgroundColor: COLORS.inputBorder,
    marginHorizontal: 16,
  },
  rightColumn: {
    flex: 1.5,
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTextContainer: {
    marginLeft: 8,
    flex: 1,
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
  progressContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  progressBackground: {
    height: 6,
    backgroundColor: COLORS.grayLight,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.body4,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  loadingText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
});