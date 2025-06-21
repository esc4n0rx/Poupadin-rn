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

  // ✅ CORREÇÃO: Função simplificada para identificar transferências
  const isTransferTransaction = (transaction: Transaction): boolean => {
    return transaction.transaction_type === 'transfer_out' || transaction.transaction_type === 'transfer_in';
  };

  // ✅ CORREÇÃO: Função para remover duplicatas
  const removeDuplicateTransactions = (transactions: Transaction[]): Transaction[] => {
    const seen = new Set<string>();
    const uniqueTransactions: Transaction[] = [];
    
    for (const transaction of transactions) {
      // Criar uma chave única baseada no ID (que deve ser único)
      const key = transaction.id;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueTransactions.push(transaction);
      } else {
        console.log('🗑️ Removendo transação duplicada:', {
          id: transaction.id,
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.transaction_type
        });
      }
    }
    
    return uniqueTransactions;
  };

  const fetchData = useCallback(async (period: TransactionPeriod) => {
    // Evita múltiplas chamadas simultâneas
    if (isLoading && budget) return; 
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching home data...');
      
      const [budgetResponse, transactionsResponse] = await Promise.all([
        budgetService.getCurrentBudget(),
        budgetService.getTransactions(period),
      ]);

      const fetchedBudget = budgetResponse.budget;
      
      if (!fetchedBudget) {
        throw new Error('Orçamento não encontrado na resposta da API');
      }

      console.log('📊 Budget recebido:', {
        id: fetchedBudget.id,
        name: fetchedBudget.name,
        categoriesCount: fetchedBudget.budget_categories?.length || 0,
        incomesCount: fetchedBudget.incomes?.length || 0
      });

      // Garantir que arrays existam
      const safeIncomes = fetchedBudget.incomes || [];
      const safeCategories = fetchedBudget.budget_categories || [];
      
      const totalIncome = safeIncomes.reduce((sum, income) => {
        return sum + (income?.amount || 0);
      }, 0);
      
      const totalExpense = safeCategories.reduce((sum, cat) => {
        const allocated = cat?.allocated_amount || 0;
        const balance = cat?.current_balance || 0;
        const spentInCategory = allocated - balance;
        return sum + Math.max(spentInCategory, 0);
      }, 0);
      
      const safeBudget: Budget = { 
        ...fetchedBudget, 
        total_income: totalIncome,
        total_expense: totalExpense,
        budget_categories: safeCategories,
        incomes: safeIncomes
      };
      
      setBudget(safeBudget);
      
      // ✅ CORREÇÃO: Processar e filtrar transações
      const rawTransactions = transactionsResponse.transactions || [];
      console.log('📥 Transações brutas recebidas:', rawTransactions.length);
      
      // Log dos tipos de transação recebidos
      const transactionTypes = rawTransactions.reduce((acc, t) => {
        acc[t.transaction_type] = (acc[t.transaction_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('📊 Tipos de transação na API:', transactionTypes);
      
      // Filtrar transações válidas
      const validTransactions = rawTransactions
        .filter(t => t && t.id && typeof t.id === 'string')
        .map(t => ({
          ...t,
          type: t.transaction_type, // Manter compatibilidade
          budget_categories: t.budget_categories || { name: 'Categoria não informada' }
        }));
      
      console.log('✅ Transações válidas:', validTransactions.length);
      
      // Remover duplicatas
      const uniqueTransactions = removeDuplicateTransactions(validTransactions);
      console.log('🔄 Após remover duplicatas:', uniqueTransactions.length);
      
      // ✅ CORREÇÃO: Filtrar transferências usando transaction_type
      const realTransactions = uniqueTransactions.filter(transaction => {
        const isTransfer = isTransferTransaction(transaction);
        if (isTransfer) {
          console.log('🔄 Filtrando transferência:', {
            id: transaction.id,
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.transaction_type
          });
        }
        return !isTransfer;
      });
      
      console.log('💰 Transações finais (income + expense apenas):', realTransactions.length);
      
      // Log final dos tipos que sobraram
      const finalTypes = realTransactions.reduce((acc, t) => {
        acc[t.transaction_type] = (acc[t.transaction_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('📈 Tipos finais na lista:', finalTypes);
      
      setTransactions(realTransactions);

    } catch (err) {
      console.error('❌ Erro ao buscar dados:', err);
      const errorMessage = getErrorMessage(err, 'Não foi possível carregar os dados.');
      setError(errorMessage);
      setBudget(null);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('🎯 HomeData: useFocusEffect triggered');
      fetchData(selectedPeriod);
    }, [selectedPeriod, fetchData])
  );

  const handlePeriodChange = (period: TransactionPeriod) => {
    console.log('📅 Período alterado para:', period);
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