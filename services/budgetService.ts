// services/budgetService.ts
import { Budget, BudgetSetupData, ExpensePayload, Transaction } from '@/types/budget';
import { apiService } from './apiService';

export type TransactionPeriod = 'daily' | 'weekly' | 'monthly';

class BudgetService {
  /**
   * Envia os dados iniciais do orçamento do usuário para a API.
   * @param budgetData - Contém o nome do orçamento, rendas e categorias.
   */
  async setupBudget(budgetData: BudgetSetupData): Promise<any> {
    return apiService.post('/budget/setup', budgetData);
  }

  /**
   * Busca o resumo do orçamento atual do usuário.
   */
  async getCurrentBudget(): Promise<{ budget: Budget }> {
    return apiService.get<{ budget: Budget }>('/budget/');
  }

  /**
   * Busca as transações do usuário com base em um período.
   * @param period - O período para filtrar as transações ('daily', 'weekly', 'monthly').
   */
  async getTransactions(period: TransactionPeriod): Promise<{ transactions: Transaction[] }> {
    // A API real pode precisar de um parâmetro de query diferente, ex: /transactions?period=weekly
    return apiService.get<{ transactions: Transaction[] }>(`/budget/transactions?period=${period}&limit=50`);
  }

  /**
   * Registra uma nova despesa.
   * @param expenseData - Os dados da despesa a ser registrada.
   */
  async createExpense(expenseData: ExpensePayload): Promise<any> {
    return apiService.post('/budget/expense', expenseData);
  }
}

export const budgetService = new BudgetService();