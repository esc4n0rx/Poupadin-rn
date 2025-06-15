// services/budgetService.ts
import { BudgetSetupData } from '@/types/budget';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class BudgetService {
  setupBudget(budgetData: BudgetSetupData) {
      throw new Error('Method not implemented.');
  }
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      }
      throw error;
    }
  }

  async createInitialBudget(data: BudgetSetupData) {
    return this.makeRequest('/budget/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserSetupStatus(userId: string) {
    return this.makeRequest(`/user/${userId}/setup-status`);
  }
}

export const budgetService = new BudgetService();