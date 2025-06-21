import { CustomStatusBar } from '@/components/CustomStatusBar';
import { BalanceSummary } from '@/components/home/BalanceSummary';
import { ExpenseProgressBar } from '@/components/home/ExpenseProgressBar';
import { HomeHeader } from '@/components/home/HomeHeader';
import { RecentGoalsCard } from '@/components/home/RecentGoalsCard';
import { TransactionFilter } from '@/components/home/TransactionFilter';
import { TransactionList } from '@/components/home/TransactionList';
import { COLORS } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { useHomeData } from '@/hooks/useHomeData';
import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const {
    budget,
    transactions,
    isLoading,
    error,
    selectedPeriod,
    handlePeriodChange,
    refreshData,
  } = useHomeData();

  // ✅ CORREÇÃO: Verificações de segurança adicionais
  const userName = user?.name || null;
  const safeBudget = budget || null;
  const safeTransactions = transactions || [];
  const safeCategories = safeBudget?.budget_categories || [];

  // ✅ CORREÇÃO: Log para debug quando há erro
  React.useEffect(() => {
    if (error) {
      console.error('🔴 Erro na HomeScreen:', error);
    }
    
    console.log('📊 Estado da HomeScreen:', {
      user: user ? { name: user.name, id: user.id } : null,
      budget: safeBudget ? { 
        id: safeBudget.id, 
        categoriesCount: safeCategories.length 
      } : null,
      transactionsCount: safeTransactions.length,
      isLoading,
      error
    });
  }, [user, safeBudget, safeTransactions, isLoading, error]);

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} tintColor={COLORS.primary} />
        }
      >
        <View style={[styles.header, { paddingTop: insets.top }]}>
          {/* ✅ CORREÇÃO: Sempre renderizar o header, mesmo sem user */}
          <HomeHeader name={userName} />
          
          {/* ✅ CORREÇÃO: Verificação segura do budget */}
          {safeBudget && (
            <>
              <BalanceSummary
                totalBalance={safeBudget.total_income || 0}
                totalExpense={safeBudget.total_expense || 0}
              />
              <ExpenseProgressBar
                totalAmount={safeBudget.total_income || 0}
                spentAmount={safeBudget.total_expense || 0}
              />
            </>
          )}
        </View>

        {isLoading && !safeBudget ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : !safeBudget ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>Nenhum orçamento encontrado.</Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <RecentGoalsCard />
            <TransactionFilter
              selectedPeriod={selectedPeriod}
              onSelectPeriod={handlePeriodChange}
            />
            {/* ✅ CORREÇÃO: Verificação extra antes de renderizar TransactionList */}
            <TransactionList 
              transactions={safeTransactions} 
              categories={safeCategories}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingBottom: 70, 
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  contentContainer: {
    flex: 1,
    marginTop: -50,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
  },
  emptyText: {
    color: COLORS.textLight,
  },
});