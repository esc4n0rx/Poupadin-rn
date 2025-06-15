// services/budgetService.ts
import { BudgetSetupData } from '@/types/budget';
import { tokenService } from './tokenService'; // Precisamos do token para chamadas autenticadas

// Usaremos a URL correta da API, conforme definido no seu AuthContext
const API_BASE_URL = 'https://api.poupadin.space/api';

class BudgetService {
  /**
   * Envia os dados iniciais do orçamento do usuário para a API.
   * @param budgetData - Contém o nome do orçamento, rendas e categorias.
   */
  async setupBudget(budgetData: BudgetSetupData): Promise<any> {
    const endpoint = '/budget/setup';
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      // Obter o token de autenticação
      const token = await tokenService.getToken();
      if (!token) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Adiciona o token no cabeçalho
        },
        body: JSON.stringify(budgetData),
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        // Se a resposta da API indicar um erro, lança a mensagem para o componente tratar.
        throw new Error(responseData.message || `Erro na requisição para ${endpoint}`);
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        // Re-lança o erro para ser tratado pelo componente
        throw error;
      }
      // Erros de rede ou outros problemas inesperados
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  }

  /**
   * Busca o status de configuração inicial do usuário.
   * (Este método não foi implementado, mas segue como exemplo)
   * @param userId - O ID do usuário.
   */
  async getUserSetupStatus(userId: string) {
    // Exemplo de como uma chamada GET seria feita aqui
    console.warn('getUserSetupStatus não implementado');
    return Promise.resolve({ setup_completed: false });
  }
}

export const budgetService = new BudgetService();