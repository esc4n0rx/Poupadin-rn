// app/(tabs)/stats.tsx
import { CustomButton } from '@/components/CustomButton';
import { CustomStatusBar } from '@/components/CustomStatusBar';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalForm } from '@/components/goals/GoalForm';
import { GoalStatistics } from '@/components/goals/GoalStatistics';
import { GoalTransactionModal } from '@/components/goals/GoalTransactionModal';
import { COLORS, SIZES } from '@/constants/Theme';
import { useGoals } from '@/hooks/useGoals';
import { CreateGoalPayload, Goal } from '@/types/goals';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ViewMode = 'list' | 'statistics';

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const {
    goals,
    statistics,
    isLoading,
    isSubmitting,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    createTransaction,
    completeGoal,
    refreshData,
  } = useGoals();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [transactionGoal, setTransactionGoal] = useState<Goal | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const activeGoals = goals.filter(goal => goal.is_active && !goal.is_completed);
  const completedGoals = goals.filter(goal => goal.is_completed);
  const inactiveGoals = goals.filter(goal => !goal.is_active && !goal.is_completed);

  const displayGoals = showInactive ? inactiveGoals : activeGoals;

  const handleCreateGoal = async (data: CreateGoalPayload) => {
    return await createGoal(data);
  };

  const handleEditGoal = async (data: CreateGoalPayload) => {
    if (!editingGoal) return false;
    return await updateGoal(editingGoal.id, data);
  };

  const handleDeleteGoal = (goal: Goal) => {
    Alert.alert(
      'Deletar Objetivo',
      `Tem certeza que deseja deletar "${goal.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: () => deleteGoal(goal.id),
        },
      ]
    );
  };

  const handleGoalPress = (goal: Goal) => {
    Alert.alert(
      goal.name,
      goal.description || 'Objetivo sem descrição',
      [
        { text: 'Fechar', style: 'cancel' },
        { text: 'Editar', onPress: () => setEditingGoal(goal) },
        { text: 'Deletar', style: 'destructive', onPress: () => handleDeleteGoal(goal) },
      ]
    );
  };

  const renderGoalCard = ({ item }: { item: Goal }) => (
    <GoalCard
      goal={item}
      onPress={() => handleGoalPress(item)}
      onTransaction={() => setTransactionGoal(item)}
      onComplete={item.progress >= 100 ? () => completeGoal(item.id) : undefined}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons
            name="list-outline"
            size={20}
            color={viewMode === 'list' ? COLORS.white : COLORS.primary}
          />
          <Text style={[
            styles.toggleText,
            viewMode === 'list' && styles.toggleTextActive
          ]}>
            Lista
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'statistics' && styles.toggleButtonActive]}
          onPress={() => setViewMode('statistics')}
        >
          <Ionicons
            name="stats-chart-outline"
            size={20}
            color={viewMode === 'statistics' ? COLORS.white : COLORS.primary}
          />
          <Text style={[
            styles.toggleText,
            viewMode === 'statistics' && styles.toggleTextActive
          ]}>
            Estatísticas
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'list' && (
        <View style={styles.listControls}>
          <View style={styles.statusToggle}>
            <TouchableOpacity
              style={[styles.statusButton, !showInactive && styles.statusButtonActive]}
              onPress={() => setShowInactive(false)}
            >
              <Text style={[
                styles.statusText,
                !showInactive && styles.statusTextActive
              ]}>
                Ativos ({activeGoals.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusButton, showInactive && styles.statusButtonActive]}
              onPress={() => setShowInactive(true)}
            >
              <Text style={[
                styles.statusText,
                showInactive && styles.statusTextActive
              ]}>
                Inativos ({inactiveGoals.length})
              </Text>
            </TouchableOpacity>
          </View>

          <CustomButton
            title="Novo Objetivo"
            onPress={() => setShowCreateForm(true)}
            style={styles.createButton}
          />
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="flag-outline" size={64} color={COLORS.grayLight} />
      <Text style={styles.emptyTitle}>
        {showInactive ? 'Nenhum objetivo inativo' : 'Nenhum objetivo ainda'}
      </Text>
      <Text style={styles.emptyText}>
        {showInactive 
          ? 'Você não possui objetivos inativos no momento.'
          : 'Comece criando seu primeiro objetivo de economia!'
        }
      </Text>
      {!showInactive && (
        <CustomButton
          title="Criar Primeiro Objetivo"
          onPress={() => setShowCreateForm(true)}
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  // ✅ CORREÇÃO: Header específico para estatísticas com botão de voltar
  const renderStatisticsHeader = () => (
    <View style={styles.statisticsHeader}>
      <TouchableOpacity
        style={styles.backToListButton}
        onPress={() => setViewMode('list')}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        <Text style={styles.backToListText}>Voltar para Lista</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.createGoalFromStatsButton}
        onPress={() => setShowCreateForm(true)}
      >
        <Ionicons name="add" size={20} color={COLORS.white} />
        <Text style={styles.createGoalFromStatsText}>Novo Objetivo</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando objetivos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Meus Objetivos</Text>
        <Text style={styles.headerSubtitle}>
          {activeGoals.length} ativos • {completedGoals.length} concluídos
        </Text>
      </View>

      <View style={styles.content}>
        {viewMode === 'statistics' ? (
          <View style={styles.statisticsContainer}>
            {/* ✅ CORREÇÃO: Header para estatísticas com navegação */}
            {renderStatisticsHeader()}
            
            {statistics ? (
              <FlatList
                data={[statistics]}
                renderItem={() => <GoalStatistics statistics={statistics} />}
                refreshControl={
                  <RefreshControl refreshing={isLoading} onRefresh={refreshData} />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.statisticsContent}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Carregando estatísticas...</Text>
              </View>
            )}
          </View>
        ) : (
          <FlatList
            data={displayGoals}
            renderItem={renderGoalCard}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refreshData} />
            }
          />
        )}

        {/* Completed Goals Section - Apenas na view de lista */}
        {completedGoals.length > 0 && viewMode === 'list' && (
          <View style={styles.completedSection}>
            <Text style={styles.completedTitle}>🎉 Objetivos Concluídos</Text>
            <FlatList
              data={completedGoals}
              renderItem={renderGoalCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.completedList}
            />
          </View>
        )}
      </View>

      {/* Create Goal Modal */}
      <Modal
        visible={showCreateForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateForm(false)}
      >
        <View style={styles.modalContainer}>
          <GoalForm
            onSubmit={handleCreateGoal}
            onCancel={() => setShowCreateForm(false)}
            isLoading={isSubmitting}
          />
        </View>
      </Modal>

      {/* Edit Goal Modal */}
      <Modal
        visible={!!editingGoal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingGoal(null)}
      >
        <View style={styles.modalContainer}>
          <GoalForm
            initialData={editingGoal || undefined}
            onSubmit={handleEditGoal}
            onCancel={() => setEditingGoal(null)}
            isLoading={isSubmitting}
            isEdit
          />
        </View>
      </Modal>

      {/* Transaction Modal */}
      <GoalTransactionModal
        visible={!!transactionGoal}
        goal={transactionGoal}
        onClose={() => setTransactionGoal(null)}
        onSubmit={createTransaction}
        isLoading={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: SIZES.body2,
    color: COLORS.textLight,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 30,
    borderBottomLeftRadius: SIZES.radiusLarge,
    borderBottomRightRadius: SIZES.radiusLarge,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: SIZES.body3,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
    backgroundColor: COLORS.background,
  },
  headerContent: {
    padding: SIZES.padding,
    paddingTop: 30,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radius,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.primary,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  listControls: {
    gap: 16,
  },
  statusToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 4,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: SIZES.radius,
  },
  statusButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  statusText: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  statusTextActive: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  createButton: {
    alignSelf: 'stretch',
  },
  listContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  completedSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
  },
  completedTitle: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    paddingHorizontal: SIZES.padding,
  },
  completedList: {
    paddingHorizontal: SIZES.padding,
    gap: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // ✅ NOVOS ESTILOS: Para a seção de estatísticas
  statisticsContainer: {
    flex: 1,
  },
  statisticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
    marginTop: 20,
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
  },
  backToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.secondary,
  },
  backToListText: {
    fontSize: SIZES.body3,
    color: COLORS.primary,
    fontWeight: '600',
  },
  createGoalFromStatsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.primary,
  },
  createGoalFromStatsText: {
    fontSize: SIZES.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
  statisticsContent: {
    paddingBottom: 120,
  },
});