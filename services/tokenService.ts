// services/tokenService.ts
import { User } from '@/types/auth';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'poupadin_access_token';
const REFRESH_TOKEN_KEY = 'poupadin_refresh_token';
const USER_DATA_KEY = 'poupadin_user_data';

class TokenService {
  /**
   * Valida se o valor é uma string válida para o SecureStore
   */
  private validateStringValue(value: any, fieldName: string): void {
    if (typeof value !== 'string') {
      console.error(`❌ [TOKEN_SERVICE] Erro: ${fieldName} deve ser uma string, recebido:`, typeof value, value);
      throw new Error(`Valor inválido para ${fieldName}. Esperado string, recebido ${typeof value}`);
    }
    
    if (value.length === 0) {
      console.error(`❌ [TOKEN_SERVICE] Erro: ${fieldName} não pode ser uma string vazia`);
      throw new Error(`${fieldName} não pode ser vazio`);
    }
  }

  /**
   * Limpa todos os dados em caso de erro de corrupção
   */
  private async handleCorruptedData(error: any, operation: string): Promise<void> {
    console.error(`🧹 [TOKEN_SERVICE] Dados corrompidos detectados durante ${operation}:`, error);
    console.log(`🔄 [TOKEN_SERVICE] Limpando todos os dados do SecureStore...`);
    
    try {
      await this.clearAllData();
      console.log(`✅ [TOKEN_SERVICE] Dados limpos com sucesso`);
    } catch (clearError) {
      console.error(`❌ [TOKEN_SERVICE] Erro ao limpar dados:`, clearError);
    }
  }

  // Access Token
  async getAccessToken(): Promise<string | null> {
    try {
      console.log(`🔍 [TOKEN_SERVICE] Recuperando access token...`);
      const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      
      if (token) {
        console.log(`✅ [TOKEN_SERVICE] Access token encontrado`);
      } else {
        console.log(`📭 [TOKEN_SERVICE] Nenhum access token encontrado`);
      }
      
      return token;
    } catch (error) {
      console.error(`❌ [TOKEN_SERVICE] Erro ao recuperar access token:`, error);
      await this.handleCorruptedData(error, 'getAccessToken');
      return null;
    }
  }

  async setAccessToken(token: string): Promise<void> {
    try {
      console.log(`💾 [TOKEN_SERVICE] Armazenando access token...`);
      this.validateStringValue(token, 'Access Token');
      
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
      console.log(`✅ [TOKEN_SERVICE] Access token armazenado com sucesso`);
    } catch (error) {
      console.error(`❌ [TOKEN_SERVICE] Erro ao armazenar access token:`, error);
      
      if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string' && (error as any).message.includes('Invalid value provided to SecureStore')) {
        await this.handleCorruptedData(error, 'setAccessToken');
      }
      
      throw new Error('Erro ao salvar token de acesso');
    }
  }

  // Refresh Token
  async getRefreshToken(): Promise<string | null> {
    try {
      console.log(`🔍 [TOKEN_SERVICE] Recuperando refresh token...`);
      const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      
      if (token) {
        console.log(`✅ [TOKEN_SERVICE] Refresh token encontrado`);
      } else {
        console.log(`📭 [TOKEN_SERVICE] Nenhum refresh token encontrado`);
      }
      
      return token;
    } catch (error) {
      console.error(`❌ [TOKEN_SERVICE] Erro ao recuperar refresh token:`, error);
      await this.handleCorruptedData(error, 'getRefreshToken');
      return null;
    }
  }

  async setRefreshToken(token: string): Promise<void> {
    try {
      console.log(`💾 [TOKEN_SERVICE] Armazenando refresh token...`);
      this.validateStringValue(token, 'Refresh Token');
      
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
      console.log(`✅ [TOKEN_SERVICE] Refresh token armazenado com sucesso`);
    } catch (error) {
      console.error(`❌ [TOKEN_SERVICE] Erro ao armazenar refresh token:`, error);
      
      if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string' && (error as any).message.includes('Invalid value provided to SecureStore')) {
        await this.handleCorruptedData(error, 'setRefreshToken');
      }
      
      throw new Error('Erro ao salvar token de atualização');
    }
  }

  // User Data
  async getUserData(): Promise<User | null> {
    try {
      console.log(`🔍 [TOKEN_SERVICE] Recuperando dados do usuário...`);
      const userDataJson = await SecureStore.getItemAsync(USER_DATA_KEY);
      
      if (!userDataJson) {
        console.log(`📭 [TOKEN_SERVICE] Nenhum dado de usuário encontrado`);
        return null;
      }
      
      console.log(`🔄 [TOKEN_SERVICE] Parsing dos dados do usuário...`);
      const userData = JSON.parse(userDataJson);
      console.log(`✅ [TOKEN_SERVICE] Dados do usuário recuperados com sucesso`);
      
      return userData;
    } catch (error) {
      console.error(`❌ [TOKEN_SERVICE] Erro ao recuperar dados do usuário:`, error);
      
      // Se for erro de JSON ou SecureStore corrompido, limpar dados
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as any).message === 'string' &&
        ((error as any).message.includes('JSON') || (error as any).message.includes('SecureStore'))
      ) {
        await this.handleCorruptedData(error, 'getUserData');
      }
      
      return null;
    }
  }

  async setUserData(user: User): Promise<void> {
    try {
      console.log(`💾 [TOKEN_SERVICE] Armazenando dados do usuário:`, user);
      
      // Validar se user é um objeto válido
      if (!user || typeof user !== 'object') {
        throw new Error('Dados do usuário inválidos');
      }
      
      // Validar campos obrigatórios
      if (!user.id || !user.name || !user.email) {
        console.error(`❌ [TOKEN_SERVICE] Dados obrigatórios ausentes:`, user);
        throw new Error('Dados do usuário incompletos');
      }
      
      const userDataJson = JSON.stringify(user);
      this.validateStringValue(userDataJson, 'User Data JSON');
      if (typeof Error === 'object' && Error !== null && 'message' in Error && typeof (Error as any).message === 'string' && (Error as any).message.includes('Invalid value provided to SecureStore')) {
        await this.handleCorruptedData(Error, 'setUserData');
      }
    } catch (error) {
      console.error(`❌ [TOKEN_SERVICE] Erro ao armazenar dados do usuário:`, error);
      
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as any).message === 'string' &&
        (error as any).message.includes('Invalid value provided to SecureStore')
      ) {
        await this.handleCorruptedData(error, 'setUserData');
      }
      
      throw new Error('Erro ao salvar dados do usuário');
    }
  }

  // Limpeza Completa
  async clearAllData(): Promise<void> {
    console.log(`🧹 [TOKEN_SERVICE] Iniciando limpeza completa dos dados...`);
    
    const promises = [
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY).catch(err => 
        console.warn(`⚠️ [TOKEN_SERVICE] Erro ao deletar access token:`, err)
      ),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(err => 
        console.warn(`⚠️ [TOKEN_SERVICE] Erro ao deletar refresh token:`, err)
      ),
      SecureStore.deleteItemAsync(USER_DATA_KEY).catch(err => 
        console.warn(`⚠️ [TOKEN_SERVICE] Erro ao deletar user data:`, err)
      ),
    ];
    
    await Promise.all(promises);
    console.log(`✅ [TOKEN_SERVICE] Limpeza completa finalizada`);
  }

  /**
   * Verifica se há dados armazenados
   */
  async hasStoredData(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const userData = await this.getUserData();
      return !!(token && userData);
    } catch (error) {
      console.error(`❌ [TOKEN_SERVICE] Erro ao verificar dados armazenados:`, error);
      return false;
    }
  }
}

export const tokenService = new TokenService();