// components/goals/GoalStatistics.tsx
import { COLORS, SIZES } from '@/constants/Theme';
import { GoalStatistics as GoalStatsType } from '@/types/goals';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface GoalStatisticsProps {
  statistics: GoalStatsType | null;
}

const formatCurrency = (value: number) => {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const GoalStatistics: React.FC<GoalStatisticsProps> = ({ statistics }) => {
  // ✅ CORREÇÃO: Verificação de null safety
  if (!statistics) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="stats-chart-outline" size={64} color={COLORS.grayLight} />
          <Text style={styles.emptyTitle}>Sem estatísticas ainda</Text>
          <Text style={styles.emptyText}>
            Crie seus primeiros objetivos para visualizar as estatísticas.
          </Text>
        </View>
      </View>
    );
  }

  const statsData = [
    {
      icon: 'flag-outline',
      label: 'Total de Objetivos',
      value: (statistics.total_goals || 0).toString(),
      color: COLORS.primary,
    },
    {
      icon: 'checkmark-circle-outline',
      label: 'Concluídos',
      value: (statistics.completed_goals || 0).toString(),
      color: COLORS.success,
    },
    {
      icon: 'wallet-outline',
      label: 'Total Poupado',
      value: formatCurrency(statistics.total_saved || 0),
      color: COLORS.primary,
    },
    {
      icon: 'trending-up-outline',
      label: 'Progresso Médio',
      value: `${(statistics.average_progress || 0).toFixed(1)}%`,
      color: COLORS.primaryDark,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📊 Estatísticas</Text>
      <View style={styles.statsGrid}>
        {statsData.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: `${stat.color}20` }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ✅ CORREÇÃO: Verificação de null safety para monthly_savings */}
      {statistics.monthly_savings && statistics.monthly_savings > 0 && (
        <View style={styles.monthlyCard}>
          <View style={styles.monthlyHeader}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.monthlyTitle}>Este Mês</Text>
          </View>
          <View style={styles.monthlyStats}>
            <View style={styles.monthlyItem}>
              <Text style={styles.monthlyLabel}>Poupado</Text>
              <Text style={styles.monthlyValue}>{formatCurrency(statistics.monthly_savings)}</Text>
            </View>
            <View style={styles.monthlyItem}>
              <Text style={styles.monthlyLabel}>Objetivos Concluídos</Text>
              <Text style={styles.monthlyValue}>{statistics.goals_completed_this_month || 0}</Text>
            </View>
          </View>
        </View>
      )}

      {/* ✅ ADIÇÃO: Card informativo quando não há dados mensais */}
      {(!statistics.monthly_savings || statistics.monthly_savings === 0) && (
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Comece a fazer depósitos em seus objetivos para ver estatísticas mensais!
          </Text>
        </View>
      )}
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
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
  monthlyCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 16,
  },
  monthlyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  monthlyTitle: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthlyItem: {
    flex: 1,
    alignItems: 'center',
  },
  monthlyLabel: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  monthlyValue: {
    fontSize: SIZES.body2,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 4,
  },
  // ✅ ADIÇÃO: Estilos para estado vazio e card informativo
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: SIZES.radius,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.body3,
    color: COLORS.text,
    lineHeight: 20,
  },
});