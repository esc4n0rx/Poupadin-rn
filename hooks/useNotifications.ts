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
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar push notifications
  useEffect(() => {
    initializePushNotifications();
  }, []);

  const initializePushNotifications = async () => {
    try {
      console.log('🚀 [USE_NOTIFICATIONS] Iniciando push notifications');
      await pushNotificationService.initialize();
      
      // Configurar listeners
      const removeListeners = pushNotificationService.setupNotificationListeners(
        (notification) => {
          console.log('📩 [USE_NOTIFICATIONS] Notificação recebida, atualizando lista');
          // Atualizar lista quando receber notificação
          fetchNotifications();
        },
        (response) => {
          console.log('👆 [USE_NOTIFICATIONS] Notificação clicada');
          // Marcar como lida quando clicar
          const notificationId = response.notification.request.content.data?.id;
          if (typeof notificationId === 'string' && notificationId.length > 0) {
            console.log('👁️ [USE_NOTIFICATIONS] Marcando notificação como lida automaticamente:', notificationId);
            markAsRead(notificationId);
          }
        }
      );

      setIsInitialized(true);
      console.log('✅ [USE_NOTIFICATIONS] Push notifications inicializados');
      return removeListeners;
    } catch (error) {
      console.error('❌ [USE_NOTIFICATIONS] Erro ao inicializar push notifications:', error);
      setError('Erro ao configurar notificações push');
    }
  };

  const fetchNotifications = useCallback(async (refresh: boolean = false) => {
    try {
      if (refresh) setIsLoading(true);
      setError(null);

      console.log('📋 [USE_NOTIFICATIONS] Buscando notificações...');

      // Validar parâmetros antes de fazer a chamada
      const limit = 20;
      const offset = 0;
      const unreadOnly = false;

      const response = await notificationService.getNotifications(limit, offset, unreadOnly);
      
      // Validar resposta
      if (!response || typeof response !== 'object') {
        throw new Error('Resposta inválida do servidor');
      }

      const notifications = Array.isArray(response.notifications) ? response.notifications : [];
      const stats = response.stats || { total_count: 0, unread_count: 0, today_count: 0, this_week_count: 0 };

      setNotifications(notifications);
      setStats(stats);

      console.log('✅ [USE_NOTIFICATIONS] Notificações carregadas:', {
        total: notifications.length,
        unread: stats.unread_count
      });

      // Atualizar badge count
      if (isInitialized) {
        await pushNotificationService.setBadgeCount(stats.unread_count);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível carregar as notificações.');
      setError(errorMessage);
      console.error('❌ [USE_NOTIFICATIONS] Erro ao buscar notificações:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('⚙️ [USE_NOTIFICATIONS] Buscando configurações...');
      const response = await notificationService.getSettings();
      
      if (!response || !response.settings) {
        throw new Error('Configurações não encontradas na resposta');
      }

      setSettings(response.settings);
      console.log('✅ [USE_NOTIFICATIONS] Configurações carregadas');
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível carregar as configurações.');
      setError(errorMessage);
      console.error('❌ [USE_NOTIFICATIONS] Erro ao buscar configurações:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>): Promise<boolean> => {
    try {
      setIsUpdating(true);
      
      console.log('🔄 [USE_NOTIFICATIONS] Atualizando configurações:', newSettings);

      if (!newSettings || typeof newSettings !== 'object') {
        throw new Error('Configurações inválidas');
      }

      const response = await notificationService.updateSettings(newSettings);
      
      if (!response || !response.settings) {
        throw new Error('Resposta inválida ao atualizar configurações');
      }

      setSettings(response.settings);
      Alert.alert('Sucesso!', 'Configurações atualizadas com sucesso!');
     console.log('✅ [USE_NOTIFICATIONS] Configurações atualizadas');
     return true;
   } catch (err) {
     const errorMessage = getErrorMessage(err, 'Não foi possível atualizar as configurações.');
     Alert.alert('Erro', errorMessage);
     console.error('❌ [USE_NOTIFICATIONS] Erro ao atualizar configurações:', err);
     return false;
   } finally {
     setIsUpdating(false);
   }
 }, []);

 const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
   try {
     console.log('👁️ [USE_NOTIFICATIONS] Marcando notificação como lida:', notificationId);

     // Validar ID da notificação
     if (!notificationId || typeof notificationId !== 'string' || notificationId.trim().length === 0) {
       console.error('❌ [USE_NOTIFICATIONS] ID de notificação inválido:', notificationId);
       return false;
     }

     const cleanId = notificationId.trim();
     await notificationService.markAsRead(cleanId);
     
     // Atualizar estado local
     setNotifications(prev => 
       prev.map(notif => 
         notif.id === cleanId 
           ? { ...notif, is_read: true }
           : notif
       )
     );

     // Atualizar stats
     if (stats) {
       const newUnreadCount = Math.max(0, stats.unread_count - 1);
       setStats(prev => prev ? {
         ...prev,
         unread_count: newUnreadCount
       } : null);

       // Atualizar badge
       if (isInitialized) {
         await pushNotificationService.setBadgeCount(newUnreadCount);
       }
     }

     console.log('✅ [USE_NOTIFICATIONS] Notificação marcada como lida');
     return true;
   } catch (err) {
     console.error('❌ [USE_NOTIFICATIONS] Erro ao marcar notificação como lida:', err);
     return false;
   }
 }, [stats, isInitialized]);

 const markAllAsRead = useCallback(async (): Promise<boolean> => {
   try {
     setIsUpdating(true);
     
     console.log('👁️‍🗨️ [USE_NOTIFICATIONS] Marcando todas as notificações como lidas');
     const response = await notificationService.markAllAsRead();
     
     if (!response || typeof response.updated_count !== 'number') {
       throw new Error('Resposta inválida ao marcar todas como lidas');
     }
     
     // Atualizar estado local
     setNotifications(prev => 
       prev.map(notif => ({ ...notif, is_read: true }))
     );

     // Limpar stats
     if (stats) {
       setStats(prev => prev ? { ...prev, unread_count: 0 } : null);
     }

     // Limpar badge
     if (isInitialized) {
       await pushNotificationService.clearBadgeCount();
     }

     Alert.alert('Sucesso!', `${response.updated_count} notificações marcadas como lidas!`);
     console.log('✅ [USE_NOTIFICATIONS] Todas as notificações marcadas como lidas:', response.updated_count);
     return true;
   } catch (err) {
     const errorMessage = getErrorMessage(err, 'Não foi possível marcar todas como lidas.');
     Alert.alert('Erro', errorMessage);
     console.error('❌ [USE_NOTIFICATIONS] Erro ao marcar todas como lidas:', err);
     return false;
   } finally {
     setIsUpdating(false);
   }
 }, [stats, isInitialized]);

 const sendTestNotification = useCallback(async (): Promise<boolean> => {
   try {
     setIsUpdating(true);
     
     console.log('🧪 [USE_NOTIFICATIONS] Enviando notificação de teste');
     await notificationService.sendTestNotification('Esta é uma notificação de teste do Poupadin! 🎉');
     
     Alert.alert('Teste Enviado!', 'Você deve receber a notificação em breve.');
     
     // Recarregar notificações após alguns segundos
     setTimeout(() => {
       console.log('🔄 [USE_NOTIFICATIONS] Recarregando notificações após teste');
       fetchNotifications();
     }, 2000);

     console.log('✅ [USE_NOTIFICATIONS] Notificação de teste enviada');
     return true;
   } catch (err) {
     const errorMessage = getErrorMessage(err, 'Não foi possível enviar a notificação de teste.');
     Alert.alert('Erro', errorMessage);
     console.error('❌ [USE_NOTIFICATIONS] Erro ao enviar notificação de teste:', err);
     return false;
   } finally {
     setIsUpdating(false);
   }
 }, [fetchNotifications]);

 // Carregar dados iniciais
 useEffect(() => {
   if (isInitialized) {
     console.log('📊 [USE_NOTIFICATIONS] Carregando dados iniciais');
     fetchNotifications(true);
     fetchSettings();
   }
 }, [isInitialized, fetchNotifications, fetchSettings]);

 return {
   notifications,
   settings,
   stats,
   isLoading,
   isUpdating,
   error,
   isInitialized,
   fetchNotifications,
   fetchSettings,
   updateSettings,
   markAsRead,
   markAllAsRead,
   sendTestNotification,
   refreshData: () => {
     console.log('🔄 [USE_NOTIFICATIONS] Refresh manual solicitado');
     fetchNotifications(true);
     fetchSettings();
   },
   refreshToken: async () => {
     console.log('🔄 [USE_NOTIFICATIONS] Renovação de token solicitada');
     return await pushNotificationService.refreshToken();
   }
 };
};