// services/notificationService.ts
import {
    FCMTokenPayload,
    NotificationResponse,
    NotificationSettings,
    NotificationStats,
    NotificationTemplate
} from '@/types/notifications';
import { apiService } from './apiService'; // Usar o correto com autenticação

class NotificationService {
  /**
   * Registra o token FCM do dispositivo
   */
  async registerFCMToken(tokenData: FCMTokenPayload): Promise<{ message: string; token_data: any }> {
    console.log('📱 [NOTIFICATION_SERVICE] Registrando token FCM:', {
      device_type: tokenData.device_type,
      token_length: tokenData.fcm_token?.length || 0,
      has_device_id: !!tokenData.device_id,
      app_version: tokenData.app_version
    });

    // Validar dados obrigatórios
    if (!tokenData.fcm_token || typeof tokenData.fcm_token !== 'string') {
      throw new Error('Token FCM é obrigatório e deve ser uma string válida');
    }

    if (!tokenData.device_type || !['ios', 'android'].includes(tokenData.device_type)) {
      throw new Error('Tipo de dispositivo deve ser "ios" ou "android"');
    }

    try {
      const result = await apiService.post('/notifications/fcm-token', tokenData) as { message: string; token_data: any };
      console.log('✅ [NOTIFICATION_SERVICE] Token FCM registrado com sucesso');
      return result;
    } catch (error) {
      console.error('❌ [NOTIFICATION_SERVICE] Erro ao registrar token FCM:', error);
      throw error;
    }
  }

  /**
   * Busca as configurações de notificação do usuário
   */
  async getSettings(): Promise<{ settings: NotificationSettings }> {
    console.log('⚙️ [NOTIFICATION_SERVICE] Buscando configurações de notificação');
    
    try {
      const result = await apiService.get('/notifications/settings') as { settings: NotificationSettings };
      console.log('✅ [NOTIFICATION_SERVICE] Configurações obtidas com sucesso');
      return result;
    } catch (error) {
      console.error('❌ [NOTIFICATION_SERVICE] Erro ao buscar configurações:', error);
      throw error;
    }
  }

  /**
   * Atualiza as configurações de notificação
   */
  async updateSettings(settings: Partial<NotificationSettings>): Promise<{ message: string; settings: NotificationSettings }> {
    console.log('🔄 [NOTIFICATION_SERVICE] Atualizando configurações:', settings);

    if (!settings || typeof settings !== 'object') {
      throw new Error('Configurações devem ser um objeto válido');
    }

    try {
      const result = await apiService.post('/notifications/settings', settings) as { message: string; settings: NotificationSettings };
      console.log('✅ [NOTIFICATION_SERVICE] Configurações atualizadas com sucesso');
      return result;
    } catch (error) {
      console.error('❌ [NOTIFICATION_SERVICE] Erro ao atualizar configurações:', error);
      throw error;
    }
  }

  /**
   * Lista as notificações do usuário
   */
  async getNotifications(
    limit: number = 20, 
    offset: number = 0, 
    unreadOnly: boolean = false
  ): Promise<NotificationResponse> {
    console.log('📋 [NOTIFICATION_SERVICE] Buscando notificações:', {
      limit,
      offset,
      unreadOnly
    });

    // Validar parâmetros
    if (typeof limit !== 'number' || limit <= 0 || limit > 100) {
      console.warn('⚠️ [NOTIFICATION_SERVICE] Limit inválido, usando padrão 20');
      limit = 20;
    }

    if (typeof offset !== 'number' || offset < 0) {
      console.warn('⚠️ [NOTIFICATION_SERVICE] Offset inválido, usando padrão 0');
      offset = 0;
    }

    if (typeof unreadOnly !== 'boolean') {
      console.warn('⚠️ [NOTIFICATION_SERVICE] unreadOnly inválido, usando padrão false');
      unreadOnly = false;
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      unread_only: unreadOnly.toString(),
    });
    
    try {
      const result = await apiService.get(`/notifications?${params.toString()}`) as NotificationResponse;
      console.log('✅ [NOTIFICATION_SERVICE] Notificações obtidas:', {
        count: result.notifications?.length || 0,
        unread: result.stats?.unread_count || 0
      });
      return result;
    } catch (error) {
      console.error('❌ [NOTIFICATION_SERVICE] Erro ao buscar notificações:', error);
      throw error;
    }
  }

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(notificationId: string): Promise<{ message: string; notification: any }> {
    console.log('👁️ [NOTIFICATION_SERVICE] Marcando notificação como lida:', notificationId);

    // Validar ID da notificação
    if (!notificationId || typeof notificationId !== 'string' || notificationId.trim().length === 0) {
      throw new Error('ID da notificação é obrigatório e deve ser uma string válida');
    }

    const cleanId = notificationId.trim();

    try {
      const result = await apiService.post(`/notifications/${cleanId}/read`, {}) as { message: string; notification: any };
      console.log('✅ [NOTIFICATION_SERVICE] Notificação marcada como lida');
      return result;
    } catch (error) {
      console.error('❌ [NOTIFICATION_SERVICE] Erro ao marcar como lida:', error);
      throw error;
    }
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(): Promise<{ message: string; updated_count: number }> {
    console.log('👁️‍🗨️ [NOTIFICATION_SERVICE] Marcando todas as notificações como lidas');

    try {
      const result = await apiService.post('/notifications/mark-all-read', {}) as { message: string; updated_count: number };
      console.log('✅ [NOTIFICATION_SERVICE] Todas as notificações marcadas como lidas:', result.updated_count);
      return result;
    } catch (error) {
      console.error('❌ [NOTIFICATION_SERVICE] Erro ao marcar todas como lidas:', error);
      throw error;
    }
  }

  /**
   * Envia uma notificação de teste
   */
  async sendTestNotification(message?: string): Promise<{ message: string; result: any }> {
    console.log('🧪 [NOTIFICATION_SERVICE] Enviando notificação de teste:', message);

    const payload: { message?: string } = {};
    if (message && typeof message === 'string' && message.trim().length > 0) {
      payload.message = message.trim();
    }

    try {
      const result = await apiService.post('/notifications/test', payload) as { message: string; result: any };
      console.log('✅ [NOTIFICATION_SERVICE] Notificação de teste enviada');
      return result;
    } catch (error) {
      console.error('❌ [NOTIFICATION_SERVICE] Erro ao enviar notificação de teste:', error);
      throw error;
    }
  }

  /**
   * Busca estatísticas de notificações
   */
  async getStats(): Promise<{ stats: NotificationStats }> {
    console.log('📊 [NOTIFICATION_SERVICE] Buscando estatísticas de notificações');

    try {
      const result = await apiService.get('/notifications/stats') as { stats: NotificationStats };
      console.log('✅ [NOTIFICATION_SERVICE] Estatísticas obtidas:', result.stats);
      return result;
    } catch (error) {
      console.error('❌ [NOTIFICATION_SERVICE] Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  /**
   * Busca templates de notificação disponíveis
   */
  async getTemplates(): Promise<{ templates: NotificationTemplate[] }> {
    console.log('📝 [NOTIFICATION_SERVICE] Buscando templates de notificação');

    try {
      const result = await apiService.get('/notifications/templates') as { templates: NotificationTemplate[] };
      console.log('✅ [NOTIFICATION_SERVICE] Templates obtidos:', result.templates?.length || 0);
      return result;
    } catch (error) {
      console.error('❌ [NOTIFICATION_SERVICE] Erro ao buscar templates:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();