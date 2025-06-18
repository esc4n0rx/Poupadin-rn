// services/tokenService.ts
import { User } from '@/types/auth';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'poupadin_access_token';
const REFRESH_TOKEN_KEY = 'poupadin_refresh_token';
const USER_DATA_KEY = 'poupadin_user_data';

class TokenService {
  // Access Token
  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }

  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  }

  // Refresh Token
  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  }

  // User Data
  async getUserData(): Promise<User | null> {
    const userDataJson = await SecureStore.getItemAsync(USER_DATA_KEY);
    return userDataJson ? JSON.parse(userDataJson) : null;
  }

  async setUserData(user: User): Promise<void> {
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
  }

  // Limpeza Completa
  async clearAllData(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
  }
}

export const tokenService = new TokenService();