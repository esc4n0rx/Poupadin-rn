// services/pushNotificationService.ts
import { PUSH_NOTIFICATION_CONFIG } from '@/constants/PushNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationService } from './notificationService';

// Configurar como as notificações devem ser tratadas quando recebidas
Notifications.setNotificationHandler({
  handleNotification: async () => PUSH_NOTIFICATION_CONFIG.DEFAULT_NOTIFICATION_BEHAVIOR,
});

class PushNotificationService {
  private pushToken: string | null = null;
  private isInitializing: boolean = false;

  /**
   * Inicializa o serviço de push notifications
   */
  async initialize(): Promise<string | null> {
    if (this.isInitializing) {
      console.log('⏳ [PUSH_SERVICE] Inicialização já em andamento, aguardando...');
      return this.pushToken;
    }

    try {
      this.isInitializing = true;
      console.log('🚀 [PUSH_SERVICE] Iniciando serviço de push notifications');

      if (!Device.isDevice) {
        console.warn('⚠️ [PUSH_SERVICE] Push notifications só funcionam em dispositivos físicos');
        return null;
      }

      // Verificar project ID
      const projectId = PUSH_NOTIFICATION_CONFIG.getProjectId();
      if (!projectId) {
        console.error('❌ [PUSH_SERVICE] Project ID não encontrado na configuração do Expo');
        console.log('💡 [PUSH_SERVICE] Verifique se o projectId está configurado em app.json/app.config.js');
        throw new Error('Project ID não encontrado. Configure o projectId no Expo.');
      }

      console.log('✅ [PUSH_SERVICE] Project ID encontrado:', projectId.substring(0, 8) + '...');

      // Verificar se já temos um token salvo
      const savedToken = await AsyncStorage.getItem(PUSH_NOTIFICATION_CONFIG.STORAGE_KEYS.PUSH_TOKEN);
      if (savedToken && savedToken.length > 0) {
        console.log('📱 [PUSH_SERVICE] Token salvo encontrado');
        this.pushToken = savedToken;
        
        // Verificar se o token precisa ser re-registrado (a cada 24h)
        await this.checkTokenReregistration(savedToken);
        return savedToken;
      }

      // Solicitar permissões
      console.log('🔐 [PUSH_SERVICE] Solicitando permissões...');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      console.log('📋 [PUSH_SERVICE] Status atual de permissões:', existingStatus);

      if (existingStatus !== 'granted') {
        console.log('🙋 [PUSH_SERVICE] Solicitando permissões ao usuário...');
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowDisplayInCarPlay: true,
            allowCriticalAlerts: false,
            provideAppNotificationSettings: true,
            allowProvisional: false,
          },
        });
        finalStatus = status;
        console.log('📋 [PUSH_SERVICE] Novo status de permissões:', finalStatus);
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ [PUSH_SERVICE] Permissão de notificação negada pelo usuário');
        return null;
      }

      console.log('✅ [PUSH_SERVICE] Permissões concedidas');

      // Obter token FCM
      console.log('🎫 [PUSH_SERVICE] Obtendo token FCM...');
      const token = await this.getExpoPushToken();
      if (token) {
        await this.registerToken(token);
        await AsyncStorage.setItem(PUSH_NOTIFICATION_CONFIG.STORAGE_KEYS.PUSH_TOKEN, token);
        await AsyncStorage.setItem(
          PUSH_NOTIFICATION_CONFIG.STORAGE_KEYS.LAST_TOKEN_REGISTRATION, 
          Date.now().toString()
        );
        this.pushToken = token;
        console.log('✅ [PUSH_SERVICE] Inicialização concluída com sucesso');
      }

      return token;
    } catch (error) {
      console.error('❌ [PUSH_SERVICE] Erro ao inicializar push notifications:', error);
      return null;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Verifica se o token precisa ser re-registrado
   */
  private async checkTokenReregistration(token: string): Promise<void> {
    try {
      const lastRegistration = await AsyncStorage.getItem(
        PUSH_NOTIFICATION_CONFIG.STORAGE_KEYS.LAST_TOKEN_REGISTRATION
      );
      
      if (lastRegistration) {
        const lastTime = parseInt(lastRegistration, 10);
        const now = Date.now();
        const timeDiff = now - lastTime;
        const hoursPass = timeDiff / (1000 * 60 * 60);
        
        // Re-registrar a cada 24 horas
        if (hoursPass >= 24) {
          console.log('🔄 [PUSH_SERVICE] Token precisa ser re-registrado (24h passadas)');
          await this.registerToken(token);
          await AsyncStorage.setItem(
            PUSH_NOTIFICATION_CONFIG.STORAGE_KEYS.LAST_TOKEN_REGISTRATION, 
            now.toString()
          );
        }
      }
    } catch (error) {
      console.error('❌ [PUSH_SERVICE] Erro ao verificar re-registro:', error);
    }
  }

  /**
   * Obtém o token do Expo Push Notifications
   */
  private async getExpoPushToken(): Promise<string | null> {
    try {
      const projectId = PUSH_NOTIFICATION_CONFIG.getProjectId();
      
      if (!projectId) {
        throw new Error('Project ID não encontrado');
      }

      console.log('🎫 [PUSH_SERVICE] Gerando token para projeto:', projectId.substring(0, 8) + '...');
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      
      if (!tokenData || !tokenData.data || typeof tokenData.data !== 'string') {
        throw new Error('Token inválido retornado pelo Expo');
      }

      console.log('✅ [PUSH_SERVICE] Token gerado com sucesso');
      return tokenData.data;
    } catch (error) {
      console.error('❌ [PUSH_SERVICE] Erro ao obter token FCM:', error);
      return null;
    }
  }

  /**
   * Registra o token no backend com retry
   */
  private async registerToken(token: string): Promise<void> {
    let retries = 0;
    const maxRetries = PUSH_NOTIFICATION_CONFIG.RETRY_CONFIG.maxRetries;

    while (retries < maxRetries) {
      try {
        console.log(`📤 [PUSH_SERVICE] Registrando token no backend (tentativa ${retries + 1}/${maxRetries})`);
        
        const deviceType = Platform.OS as 'ios' | 'android';
        const deviceId = Constants.sessionId || Device.osInternalBuildId || 'unknown';
        const appVersion = Constants.expoConfig?.version || '1.0.0';

        await notificationService.registerFCMToken({
          fcm_token: token,
          device_type: deviceType,
          device_id: deviceId,
          app_version: appVersion,
        });

        console.log('✅ [PUSH_SERVICE] Token FCM registrado com sucesso no backend');
        return;
      } catch (error) {
        retries++;
        console.error(`❌ [PUSH_SERVICE] Erro ao registrar token (tentativa ${retries}):`, error);
        
        if (retries >= maxRetries) {
          console.error('❌ [PUSH_SERVICE] Máximo de tentativas atingido');
          throw error;
        }
        
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => 
          setTimeout(resolve, PUSH_NOTIFICATION_CONFIG.RETRY_CONFIG.retryDelay * retries)
        );
      }
    }
  }

  /**
   * Configura listeners para notificações
   */
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationClicked?: (response: Notifications.NotificationResponse) => void
  ) {
    console.log('👂 [PUSH_SERVICE] Configurando listeners de notificação');

    // Listener para quando uma notificação é recebida enquanto o app está em foreground
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('📩 [PUSH_SERVICE] Notificação recebida:', {
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data
      });
      onNotificationReceived?.(notification);
    });

    // Listener para quando o usuário clica na notificação
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 [PUSH_SERVICE] Notificação clicada:', {
        identifier: response.notification.request.identifier,
        data: response.notification.request.content.data
      });
      onNotificationClicked?.(response);
    });

    return () => {
      console.log('🔌 [PUSH_SERVICE] Removendo listeners de notificação');
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }

  /**
   * Envia uma notificação local de teste
   */
  async sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
    if (!title || typeof title !== 'string') {
      throw new Error('Título é obrigatório');
    }

    if (!body || typeof body !== 'string') {
      throw new Error('Corpo da mensagem é obrigatório');
    }

    console.log('📱 [PUSH_SERVICE] Enviando notificação local:', { title, body });

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
      },
      trigger: null, // Enviar imediatamente
    });
  }

  /**
   * Define o badge count do app
   */
  async setBadgeCount(count: number): Promise<void> {
    if (typeof count !== 'number' || count < 0) {
      console.warn('⚠️ [PUSH_SERVICE] Badge count inválido:', count);
      count = 0;
    }

    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(count);
      console.log('🔢 [PUSH_SERVICE] Badge count definido para:', count);
    }
  }

  /**
   * Limpa o badge count
   */
  async clearBadgeCount(): Promise<void> {
    await this.setBadgeCount(0);
  }

  /**
   * Cancela todas as notificações pendentes
   */
  async cancelAllNotifications(): Promise<void> {
    console.log('🗑️ [PUSH_SERVICE] Cancelando todas as notificações pendentes');
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Obtém o token atual
   */
  getCurrentToken(): string | null {
    return this.pushToken;
  }

  /**
   * Força a renovação do token
   */
  async refreshToken(): Promise<string | null> {
    console.log('🔄 [PUSH_SERVICE] Forçando renovação do token');
    
    // Limpar token atual
    this.pushToken = null;
    await AsyncStorage.removeItem(PUSH_NOTIFICATION_CONFIG.STORAGE_KEYS.PUSH_TOKEN);
    await AsyncStorage.removeItem(PUSH_NOTIFICATION_CONFIG.STORAGE_KEYS.LAST_TOKEN_REGISTRATION);
    
    // Reinicializar
    return await this.initialize();
  }
}

export const pushNotificationService = new PushNotificationService();