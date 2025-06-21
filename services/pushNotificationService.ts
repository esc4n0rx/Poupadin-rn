// services/pushNotificationService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationService } from './notificationService';

const PUSH_TOKEN_KEY = 'expo_push_token';

// Configurar como as notificações devem ser tratadas quando recebidas
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class PushNotificationService {
  private pushToken: string | null = null;

  /**
   * Inicializa o serviço de push notifications
   */
  async initialize(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications só funcionam em dispositivos físicos');
        return null;
      }

      // Verificar se já temos um token salvo
      const savedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (savedToken) {
        this.pushToken = savedToken;
        return savedToken;
      }

      // Solicitar permissões
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Permissão de notificação negada');
        return null;
      }

      // Obter token FCM
      const token = await this.getExpoPushToken();
      if (token) {
        await this.registerToken(token);
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
        this.pushToken = token;
      }

      return token;
    } catch (error) {
      console.error('Erro ao inicializar push notifications:', error);
      return null;
    }
  }

  /**
   * Obtém o token do Expo Push Notifications
   */
  private async getExpoPushToken(): Promise<string | null> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      if (!projectId) {
        throw new Error('Project ID não encontrado');
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      return tokenData.data;
    } catch (error) {
      console.error('Erro ao obter token FCM:', error);
      return null;
    }
  }

  /**
   * Registra o token no backend
   */
  private async registerToken(token: string): Promise<void> {
    try {
      const deviceType = Platform.OS as 'ios' | 'android';
      const deviceId = Constants.sessionId;
      const appVersion = Constants.expoConfig?.version || '1.0.0';

      await notificationService.registerFCMToken({
        fcm_token: token,
        device_type: deviceType,
        device_id: deviceId,
        app_version: appVersion,
      });

      console.log('Token FCM registrado com sucesso');
    } catch (error) {
      console.error('Erro ao registrar token FCM:', error);
    }
  }

  /**
   * Configura listeners para notificações
   */
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationClicked?: (response: Notifications.NotificationResponse) => void
  ) {
    // Listener para quando uma notificação é recebida enquanto o app está em foreground
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notificação recebida:', notification);
      onNotificationReceived?.(notification);
    });

    // Listener para quando o usuário clica na notificação
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notificação clicada:', response);
      onNotificationClicked?.(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }

  /**
   * Envia uma notificação local de teste
   */
  async sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // Enviar imediatamente
    });
  }

  /**
   * Define o badge count do app
   */
  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(count);
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
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Obtém o token atual
   */
  getCurrentToken(): string | null {
    return this.pushToken;
  }
}

export const pushNotificationService = new PushNotificationService();