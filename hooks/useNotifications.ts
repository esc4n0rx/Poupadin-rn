// hooks/useNotifications.ts
import { notificationService } from '@/services/notificationService';
import { pushNotificationService } from '@/services/pushNotificationService';
import {
    NotificationItem,
    NotificationSettings,
    NotificationStats
} from '@/types/notifications';
import { getErrorMessage } from '@/utils/errorHandler';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar push notifications
  useEffect(() => {
    initializePushNotifications();
  }, []);

  const initializePushNotifications = async () => {
    try {
      await pushNotificationService.initialize();
      
      // Configurar listeners
      const removeListeners = pushNotificationService.setupNotificationListeners(
        (notification) => {
          // Atualizar lista quando receber notificação
          fetchNotifications();
        },
        (response) => {
          // Marcar como lida quando clicar
          const notificationId = response.notification.request.content.data?.id;
          if (typeof notificationId === 'string' && notificationId.length > 0) {
            markAsRead(notificationId);
          }
        }
      );

      return removeListeners;
    } catch (error) {
      console.error('Erro ao inicializar push notifications:', error);
    }
  };

  const fetchNotifications = useCallback(async (refresh: boolean = false) => {
    try {
      if (refresh) setIsLoading(true);
      setError(null);

      const response = await notificationService.getNotifications(20, 0, false);
      
      setNotifications(response.notifications);
      setStats(response.stats);

      // Atualizar badge count
      await pushNotificationService.setBadgeCount(response.stats.unread_count);
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível carregar as notificações.');
      setError(errorMessage);
      console.error('Erro ao buscar notificações:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await notificationService.getSettings();
      setSettings(response.settings);
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível carregar as configurações.');
      setError(errorMessage);
      console.error('Erro ao buscar configurações:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>): Promise<boolean> => {
    try {
      setIsUpdating(true);
      
      const response = await notificationService.updateSettings(newSettings);
      setSettings(response.settings);
      
      Alert.alert('Sucesso!', 'Configurações atualizadas com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível atualizar as configurações.');
      Alert.alert('Erro', errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );

      // Atualizar stats
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          unread_count: Math.max(0, prev.unread_count - 1)
        } : null);

        // Atualizar badge
        await pushNotificationService.setBadgeCount(Math.max(0, stats.unread_count - 1));
      }

      return true;
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
      return false;
    }
  }, [stats]);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      setIsUpdating(true);
      
      const response = await notificationService.markAllAsRead();
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );

      // Limpar stats
      if (stats) {
        setStats(prev => prev ? { ...prev, unread_count: 0 } : null);
      }

      // Limpar badge
      await pushNotificationService.clearBadgeCount();

      Alert.alert('Sucesso!', `${response.updated_count} notificações marcadas como lidas!`);
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível marcar todas como lidas.');
      Alert.alert('Erro', errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [stats]);

  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    try {
      setIsUpdating(true);
      
      await notificationService.sendTestNotification('Esta é uma notificação de teste do Poupadin! 🎉');
      
      Alert.alert('Teste Enviado!', 'Você deve receber a notificação em breve.');
      
      // Recarregar notificações após alguns segundos
      setTimeout(() => {
        fetchNotifications();
      }, 2000);

      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível enviar a notificação de teste.');
      Alert.alert('Erro', errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [fetchNotifications]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchNotifications(true);
    fetchSettings();
  }, [fetchNotifications, fetchSettings]);

  return {
    notifications,
    settings,
    stats,
    isLoading,
    isUpdating,
    error,
    fetchNotifications,
    fetchSettings,
    updateSettings,
    markAsRead,
    markAllAsRead,
    sendTestNotification,
    refreshData: () => {
      fetchNotifications(true);
      fetchSettings();
    }
  };
};