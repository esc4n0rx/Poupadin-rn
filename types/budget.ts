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
  color: string;
}

export interface BudgetSetupData {
  name: string;
  incomes: Omit<Income, 'id'>[];
  categories: Omit<Category, 'id'>[];
}