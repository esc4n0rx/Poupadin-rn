// types/notifications.ts
export interface NotificationSettings {
  push_enabled: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
  recurring_transactions: boolean;
  budget_alerts: boolean;
  goal_updates: boolean;
  expense_reminders: boolean;
  weekly_reports: boolean;
  monthly_reports: boolean;
  achievement_notifications: boolean;
  marketing_notifications: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string; // HH:MM
  quiet_hours_end?: string; // HH:MM
  timezone?: string;
  max_daily_notifications: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'update' | 'transaction' | 'expense_record' | 'achievement' | 'system';
  is_read: boolean;
  created_at: string;
  data?: {
    action_url?: string;
    category?: string;
    amount?: number;
    [key: string]: any;
  };
}

export interface NotificationStats {
  total_count: number;
  unread_count: number;
  today_count: number;
  this_week_count: number;
}

export interface NotificationResponse {
  notifications: NotificationItem[];
  stats: NotificationStats;
  pagination: {
    limit: number;
    offset: number;
    total: number;
    has_more: boolean;
  };
}

export interface FCMTokenPayload {
  fcm_token: string;
  device_type: 'ios' | 'android';
  device_id?: string;
  app_version?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: string;
  category: string;
}