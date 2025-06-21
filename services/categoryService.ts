// services/categoryService.ts
import { CategoriesResponse, TransferPayload, TransferResponse } from '@/types/category';
import { apiService } from './apiService';

class CategoryService {
  /**
   * Busca todas as categorias do orçamento do usuário
   */
  async getCategories(): Promise<CategoriesResponse> {
    return apiService.get<CategoriesResponse>('/budget/categories');
  }

  /**
   * Realiza transferência de valor entre categorias
   */
  async transferBetweenCategories(transferData: TransferPayload): Promise<TransferResponse> {
    return apiService.post<TransferResponse>('/budget/transfer', transferData);
  }
}

export const categoryService = new CategoryService();