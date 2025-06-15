// services/tokenService.ts
import * as SecureStore from 'expo-secure-store';

class TokenService {
  private TOKEN_KEY = 'userToken';

  async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(this.TOKEN_KEY, token);
  }

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.TOKEN_KEY);
  }

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(this.TOKEN_KEY);
  }
}

export const tokenService = new TokenService();