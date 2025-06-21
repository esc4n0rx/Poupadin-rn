// types/budget.ts
export interface Income {
  id?: string;
  description: string;
  amount: number;
  receive_day: number;
}

export interface Category {
  transaction_count: number;
  id?: string;
  name: string;
  allocated_amount: number;
  color: string;
  current_balance?: number;
}

export interface BudgetSetupData {
  name: string;
  incomes: Omit<Income, 'id'>[];
  categories: Omit<Category, 'id'>[];
}

// --- TIPOS CORRIGIDOS E ADICIONADOS ---
export interface Budget {
  id: string;
  name: string;
  total_income: number;
  allocated_amount: number;
  available_balance: number;
  total_expense: number; // Será calculado no frontend
  budget_categories: Category[]; // Nome da propriedade corrigido
  incomes: Income[];
}

export type TransactionType = 'income' | 'expense' | 'transfer_out' | 'transfer_in';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  transaction_type: TransactionType;
  created_at: string;
  budget_categories: { 
    name: string;
  };
  from_category_id?: string;
  to_category_id?: string;
}

export interface ExpensePayload {
  category_id: string;
  amount: number;
  description: string;
}