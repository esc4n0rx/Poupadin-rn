import { tokenService } from '@/services/tokenService';
import { BudgetSetupData, BudgetSetupResponse, BudgetSetupStatus } from '@/types/budget';


const API_BASE_URL = 'https://api.poupadin.space';

class BudgetService {
  private async getAuthHeaders() {
    const token = await tokenService.getToken();
    
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const authHeaders = await this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(errorData.message || `Erro ${response.status}`);
    }

    return response.json();
  }

  async getSetupStatus(): Promise<BudgetSetupStatus> {
    return this.makeRequest('/api/budget/setup-status');
  }

  async createInitialBudget(data: BudgetSetupData): Promise<BudgetSetupResponse> {
    return this.makeRequest('/api/budget/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }


  async getCurrentBudget() {
    return this.makeRequest('/api/budget/');
  }

  async getCategories() {
    return this.makeRequest('/api/budget/categories');
  }

  async getIncomes() {
    return this.makeRequest('/api/budget/incomes');
  }

  async recordExpense(data: {
    category_id: string;
    amount: number;
    description: string;
  }) {
    return this.makeRequest('/api/budget/expense', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async transferBetweenCategories(data: {
    from_category_id: string;
    to_category_id: string;
    amount: number;
    description: string;
  }) {
    return this.makeRequest('/api/budget/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransactions(limit: number = 50) {
    return this.makeRequest(`/api/budget/transactions?limit=${limit}`);
  }
}

export const budgetService = new BudgetService();