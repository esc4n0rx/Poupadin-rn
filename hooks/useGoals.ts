// hooks/useGoals.ts
import { goalsService } from '@/services/goalsService';
import { CreateGoalPayload, Goal, GoalStatistics, GoalTransactionPayload, UpdateGoalPayload } from '@/types/goals';
import { getErrorMessage } from '@/utils/errorHandler';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [statistics, setStatistics] = useState<GoalStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async (includeInactive: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const { goals: fetchedGoals } = await goalsService.getGoals(includeInactive);
      setGoals(fetchedGoals);
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível carregar os objetivos.');
      setError(errorMessage);
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    try {
      const { statistics: fetchedStats } = await goalsService.getStatistics();
      setStatistics(fetchedStats);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      // ✅ CORREÇÃO: Não definir como null em caso de erro, manter estado anterior
      // setStatistics(null);
    }
  }, []);

  const createGoal = useCallback(async (goalData: CreateGoalPayload): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      await goalsService.createGoal(goalData);
      Alert.alert('Sucesso!', 'Objetivo criado com sucesso!');
      await fetchGoals();
      await fetchStatistics();
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível criar o objetivo.');
      Alert.alert('Erro', errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchGoals, fetchStatistics]);

  const updateGoal = useCallback(async (id: string, goalData: UpdateGoalPayload): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      await goalsService.updateGoal(id, goalData);
      Alert.alert('Sucesso!', 'Objetivo atualizado com sucesso!');
      await fetchGoals();
      await fetchStatistics();
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível atualizar o objetivo.');
      Alert.alert('Erro', errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchGoals, fetchStatistics]);

  const deleteGoal = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      await goalsService.deleteGoal(id);
      Alert.alert('Sucesso!', 'Objetivo deletado com sucesso!');
      await fetchGoals();
      await fetchStatistics();
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível deletar o objetivo.');
      Alert.alert('Erro', errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchGoals, fetchStatistics]);

  const createTransaction = useCallback(async (transactionData: GoalTransactionPayload): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      const response = await goalsService.createTransaction(transactionData);
      
      if (response.completed) {
        Alert.alert('Parabéns! 🎉', 'Você alcançou seu objetivo!');
      } else {
        Alert.alert('Sucesso!', 'Transação registrada com sucesso!');
      }
      
      await fetchGoals();
      await fetchStatistics();
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível registrar a transação.');
      Alert.alert('Erro', errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchGoals, fetchStatistics]);

  const completeGoal = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      await goalsService.completeGoal(id);
      Alert.alert('Parabéns! 🎉', 'Objetivo marcado como concluído!');
      await fetchGoals();
      await fetchStatistics();
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível marcar objetivo como concluído.');
      Alert.alert('Erro', errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchGoals, fetchStatistics]);

  useEffect(() => {
    fetchGoals();
    fetchStatistics();
  }, [fetchGoals, fetchStatistics]);

  return {
    goals,
    statistics,
    isLoading,
    isSubmitting,
    error,
    fetchGoals,
    fetchStatistics,
    createGoal,
    updateGoal,
    deleteGoal,
    createTransaction,
    completeGoal,
    refreshData: () => {
      fetchGoals();
      fetchStatistics();
    },
  };
};