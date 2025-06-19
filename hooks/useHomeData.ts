// hooks/useHomeData.ts
import { budgetService, TransactionPeriod } from '@/services/budgetService';
import { Budget, Transaction } from '@/types/budget';
import { getErrorMessage } from '@/utils/errorHandler';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export const useHomeData = () => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TransactionPeriod>('monthly');

  const fetchData = useCallback(async (period: TransactionPeriod) => {
    // Evita múltiplas chamadas simultâneas
    if (isLoading && budget) return; 
    
    setIsLoading(true);
    setError(null);

    try {
      const [budgetResponse, transactionsResponse] = await Promise.all([
        budgetService.getCurrentBudget(),
        budgetService.getTransactions(period),
      ]);

      const fetchedBudget = budgetResponse.budget;
      
      // ✅ CORREÇÃO: Lógica de cálculo de acordo com as regras
      const totalIncome = fetchedBudget.incomes?.reduce((sum, income) => sum + income.amount, 0) ?? 0;
      const totalExpense = fetchedBudget.budget_categories?.reduce((sum, cat) => {
        const spentInCategory = (cat.allocated_amount ?? 0) - (cat.current_balance ?? 0);
        return sum + spentInCategory;
      }, 0) ?? 0;
      
      // Adicionando as propriedades calculadas ao objeto de budget
      setBudget({ 
          ...fetchedBudget, 
          total_income: totalIncome, // Usando o valor calculado para consistência
          total_expense: totalExpense 
      });
      
      const formattedTransactions = transactionsResponse.transactions.map(t => ({
        ...t,
        type: t.transaction_type, 
      }));
      setTransactions(formattedTransactions);

    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar os dados.'));
      setBudget(null);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData(selectedPeriod);
    }, [selectedPeriod, fetchData])
  );

  const handlePeriodChange = (period: TransactionPeriod) => {
    setSelectedPeriod(period);
  };

  return {
    budget,
    transactions,
    isLoading,
    error,
    selectedPeriod,
    handlePeriodChange,
    refreshData: () => fetchData(selectedPeriod),
  };
};