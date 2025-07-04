// constants/PushNotifications.ts
import Constants from 'expo-constants';

export const PUSH_NOTIFICATION_CONFIG = {
  // Configuração do Project ID
  getProjectId: (): string | null => {
    return Constants.expoConfig?.extra?.eas?.projectId ?? 
           Constants.easConfig?.projectId ?? 
           null;
  },
  
  // Configuração padrão para notificações
  DEFAULT_NOTIFICATION_BEHAVIOR: {
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  },
  
  // Chaves de armazenamento
  STORAGE_KEYS: {
    PUSH_TOKEN: 'expo_push_token',
    LAST_TOKEN_REGISTRATION: 'last_token_registration',
  },
  
  // Configurações de retry
  RETRY_CONFIG: {
    maxRetries: 3,
    retryDelay: 1000, // 1 segundo
  },
} as const;

export type PushNotificationConfig = typeof PUSH_NOTIFICATION_CONFIG;