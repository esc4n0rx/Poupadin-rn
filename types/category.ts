// types/category.ts
export interface BudgetCategory {
  id: string;
  budget_id: string;
  name: string;
  allocated_amount: number;
  current_balance: number;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransferPayload {
  from_category_id: string;
  to_category_id: string;
  amount: number;
  description: string;
}

export interface TransferResponse {
  message: string;
  from_new_balance: number;
  to_new_balance: number;
}

export interface CategoriesResponse {
  categories: BudgetCategory[];
}