
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
          <HomeHeader name={user?.name || 'Usuário'} />
          {budget && (
            <>
              <BalanceSummary
                totalBalance={budget.total_income ?? 0}
                totalExpense={budget.total_expense ?? 0}
              />
              <ExpenseProgressBar
                totalAmount={budget.total_income ?? 0}
                spentAmount={budget.total_expense ?? 0}
              />
            </>
          )}
        </View>

        {isLoading && !budget ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : error ? (
          <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>
        ) : !budget ? (
           <View style={styles.centered}><Text style={styles.emptyText}>Nenhum orçamento encontrado.</Text></View>
        ) : (
          <View style={styles.contentContainer}>
            <RecentGoalsCard />
            <TransactionFilter
              selectedPeriod={selectedPeriod}
              onSelectPeriod={handlePeriodChange}
            />
            <TransactionList transactions={transactions} categories={budget.budget_categories || []} />
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