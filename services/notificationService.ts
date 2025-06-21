// services/notificationService.ts
import {
    FCMTokenPayload,
    NotificationResponse,
    NotificationSettings,
    NotificationStats,
    NotificationTemplate
} from '@/types/notifications';
import { apiService } from './apiService';

class NotificationService {
  /**
   * Registra o token FCM do dispositivo
   */
  async registerFCMToken(tokenData: FCMTokenPayload): Promise<{ message: string; token_data: any }> {
    return apiService.post('/notifications/fcm-token', tokenData);
  }

  /**
   * Busca as configurações de notificação do usuário
   */
  async getSettings(): Promise<{ settings: NotificationSettings }> {
    return apiService.get('/notifications/settings');
  }

  /**
   * Atualiza as configurações de notificação
   */
  async updateSettings(settings: Partial<NotificationSettings>): Promise<{ message: string; settings: NotificationSettings }> {
    return apiService.post('/notifications/settings', settings);
  }

  /**
   * Lista as notificações do usuário
   */
  async getNotifications(
    limit: number = 20, 
    offset: number = 0, 
    unreadOnly: boolean = false
  ): Promise<NotificationResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      unread_only: unreadOnly.toString(),
    });
    
    return apiService.get(`/notifications?${params.toString()}`);
  }

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(notificationId: string): Promise<{ message: string; notification: any }> {
    return apiService.post(`/notifications/${notificationId}/read`, {});
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(): Promise<{ message: string; updated_count: number }> {
    return apiService.post('/notifications/mark-all-read', {});
  }

  /**
   * Envia uma notificação de teste
   */
  async sendTestNotification(message?: string): Promise<{ message: string; result: any }> {
    return apiService.post('/notifications/test', { message });
  }

  /**
   * Busca estatísticas de notificações
   */
  async getStats(): Promise<{ stats: NotificationStats }> {
    return apiService.get('/notifications/stats');
  }

  /**
   * Busca templates de notificação disponíveis
   */
  async getTemplates(): Promise<{ templates: NotificationTemplate[] }> {
    return apiService.get('/notifications/templates');
  }
}

export const notificationService = new NotificationService();