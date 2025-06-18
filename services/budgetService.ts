// services/budgetService.ts
import { BudgetSetupData } from '@/types/budget';
import { apiService } from './apiService';

class BudgetService {
  /**
   * Envia os dados iniciais do orçamento do usuário para a API.
   * @param budgetData - Contém o nome do orçamento, rendas e categorias.
   */
  async setupBudget(budgetData: BudgetSetupData): Promise<any> {
    return apiService.post('/budget/setup', budgetData);
  }
}

export const budgetService = new BudgetService();