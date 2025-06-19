// services/goalsService.ts
import {
    CreateGoalPayload,
    Goal,
    GoalReport,
    GoalStatistics,
    GoalTransaction,
    GoalTransactionPayload,
    GoalTransactionResponse,
    UpdateGoalPayload
} from '@/types/goals';
import { apiService } from './apiService';

class GoalsService {
  /**
   * Cria um novo objetivo
   */
  async createGoal(goalData: CreateGoalPayload): Promise<{ message: string; goal: Goal }> {
    return apiService.post('/goals', goalData);
  }

  /**
   * Lista todos os objetivos do usuário
   */
  async getGoals(includeInactive: boolean = false): Promise<{ goals: Goal[] }> {
    const query = includeInactive ? '?include_inactive=true' : '?include_inactive=false';
    return apiService.get(`/goals${query}`);
  }

  /**
   * Busca um objetivo específico por ID
   */
  async getGoalById(id: string): Promise<{ goal: Goal }> {
    return apiService.get(`/goals/${id}`);
  }

  /**
   * Atualiza um objetivo existente
   */
  async updateGoal(id: string, goalData: UpdateGoalPayload): Promise<{ message: string; goal: Goal }> {
    return apiService.post(`/goals/${id}`, {
      method: 'PUT',
      ...goalData
    });
  }

  /**
   * Deleta um objetivo
   */
  async deleteGoal(id: string): Promise<{ message: string }> {
    return apiService.post(`/goals/${id}`, { method: 'DELETE' });
  }

  /**
   * Realiza uma transação em um objetivo (depósito ou saque)
   */
  async createTransaction(transactionData: GoalTransactionPayload): Promise<GoalTransactionResponse> {
    return apiService.post('/goals/transaction', transactionData);
  }

  /**
   * Marca um objetivo como concluído
   */
  async completeGoal(id: string): Promise<{ message: string; goal: Goal }> {
    return apiService.post(`/goals/${id}/complete`, {});
  }

  /**
   * Busca transações de um objetivo específico
   */
  async getGoalTransactions(id: string, limit: number = 50): Promise<{ transactions: GoalTransaction[] }> {
    return apiService.get(`/goals/${id}/transactions?limit=${limit}`);
  }

  /**
   * Busca estatísticas gerais dos objetivos
   */
  async getStatistics(): Promise<{ statistics: GoalStatistics }> {
    return apiService.get('/goals/statistics');
  }

  /**
   * Busca relatório completo dos objetivos
   */
  async getReport(): Promise<{ report: GoalReport }> {
    return apiService.get('/goals/report');
  }
}

export const goalsService = new GoalsService();