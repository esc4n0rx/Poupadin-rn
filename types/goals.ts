// types/goals.ts
export interface Goal {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  monthly_target?: number;
  target_date?: string;
  color: string;
  is_active: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  progress: number; // Calculado pela API
}

export interface CreateGoalPayload {
  name: string;
  description?: string;
  target_amount: number;
  monthly_target?: number;
  target_date?: string;
  color?: string;
}

export interface UpdateGoalPayload {
  name?: string;
  description?: string;
  target_amount?: number;
  monthly_target?: number;
  target_date?: string;
  color?: string;
  is_active?: boolean;
}

export interface GoalTransaction {
  id: string;
  goal_id: string;
  transaction_type: 'deposit' | 'withdrawal';
  amount: number;
  description?: string;
  created_at: string;
}

export interface GoalTransactionPayload {
  goal_id: string;
  transaction_type: 'deposit' | 'withdrawal';
  amount: number;
  description?: string;
}

export interface GoalTransactionResponse {
  message: string;
  new_amount: number;
  goal: Goal;
  completed: boolean;
}

export interface GoalStatistics {
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  total_saved: number;
  total_target: number;
  average_progress: number;
  monthly_savings: number;
  goals_completed_this_month: number;
}

export interface GoalReport {
  overview: {
    total_goals: number;
    active_goals: number;
    completed_goals: number;
    total_saved: number;
    total_target_amount: number;
    overall_progress: number;
  };
  monthly_performance: {
    month: string;
    total_saved: number;
    goals_completed: number;
  }[];
  goals_by_status: {
    active: Goal[];
    completed: Goal[];
    inactive: Goal[];
  };
  top_performers: Goal[];
}