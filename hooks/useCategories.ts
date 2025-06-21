// hooks/useCategories.ts
import { categoryService } from '@/services/categoryService';
import { BudgetCategory, TransferPayload } from '@/types/category';
import { getErrorMessage } from '@/utils/errorHandler';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

export const useCategories = () => {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { categories: fetchedCategories } = await categoryService.getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível carregar as categorias.');
      setError(errorMessage);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories])
  );

  const transferBetweenCategories = useCallback(async (transferData: TransferPayload): Promise<boolean> => {
    try {
      setIsTransferring(true);
      const response = await categoryService.transferBetweenCategories(transferData);
      
      // Atualizar os saldos localmente para feedback imediato
      setCategories(prev => prev.map(cat => {
        if (cat.id === transferData.from_category_id) {
          return { ...cat, current_balance: response.from_new_balance };
        }
        if (cat.id === transferData.to_category_id) {
          return { ...cat, current_balance: response.to_new_balance };
        }
        return cat;
      }));

      Alert.alert('Sucesso!', response.message);
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível realizar a transferência.');
      Alert.alert('Erro', errorMessage);
      return false;
    } finally {
      setIsTransferring(false);
    }
  }, []);

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated_amount, 0);
  const totalUsed = categories.reduce((sum, cat) => sum + (cat.allocated_amount - cat.current_balance), 0);
  const totalAvailable = categories.reduce((sum, cat) => sum + cat.current_balance, 0);

  return {
    categories,
    isLoading,
    isTransferring,
    error,
    totalAllocated,
    totalUsed,
    totalAvailable,
    fetchCategories,
    transferBetweenCategories,
    refreshData: fetchCategories,
  };
};