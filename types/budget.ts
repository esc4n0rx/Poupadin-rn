// types/budget.ts
export interface Income {
  id?: string;
  description: string;
  amount: number;
  receive_day: number;
}

export interface Category {
  id?: string;
  name: string;
  allocated_amount: number;
  color?: string;
}

export interface BudgetSetupData {
  name?: string;
  incomes: Income[];
  categories: Category[];
}

export interface Budget {
  id: string;
  name: string;
  total_income: number;
  allocated_amount: number;
  available_balance: number;
}

export interface BudgetSetupResponse {
  message: string;
  budget: Budget;
}

export interface BudgetSetupStatus {
  setup_completed: boolean;
  message: string;
}