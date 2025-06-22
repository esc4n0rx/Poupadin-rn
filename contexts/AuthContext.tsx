// contexts/AuthContext.tsx
import { apiService } from '@/services/api';
import { tokenService } from '@/services/tokenService';
import { LoginFormData, RegisterFormData, User } from '@/types/auth';
import { convertBrazilianDateToISO } from '@/utils/dateUtils';
import { getErrorMessage } from '@/utils/errorHandler';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setupCompleted: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateSetupStatus: (status: boolean) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyResetCode: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Usar useCallback para evitar re-criações desnecessárias da função
  const loadUserFromStorage = useCallback(async () => {
    console.log(`🔄 [AUTH_CONTEXT] Iniciando carregamento do usuário...`);
    
    try {
      const accessToken = await tokenService.getAccessToken();
      const userData = await tokenService.getUserData();
      
      if (accessToken && userData) {
        console.log(`✅ [AUTH_CONTEXT] Usuário carregado do storage:`, userData);
        setUser(userData);
      } else {
        console.log(`📭 [AUTH_CONTEXT] Nenhum usuário encontrado no storage`);
        setUser(null);
      }
    } catch (error) {
      console.error(`❌ [AUTH_CONTEXT] Falha ao carregar dados do usuário:`, error);
      
      // Em caso de erro de dados corrompidos, limpar tudo
      try {
        await tokenService.clearAllData();
        console.log(`🧹 [AUTH_CONTEXT] Dados corrompidos limpos`);
      } catch (clearError) {
        console.error(`❌ [AUTH_CONTEXT] Erro ao limpar dados corrompidos:`, clearError);
      }
      
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log(`✅ [AUTH_CONTEXT] Carregamento do usuário finalizado`);
    }
  }, []);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  const login = async (data: LoginFormData) => {
    console.log(`🌐 [AUTH_CONTEXT] Função login chamada com:`, { email: data.email });
    
    try {
      setIsLoading(true);
      console.log(`🔗 [AUTH_CONTEXT] Chamando apiService.login...`);
      
      const response = await apiService.login({
        email: data.email,
        password: data.password,
      });

      console.log(`✅ [AUTH_CONTEXT] Resposta da API recebida:`, { 
        accessToken: response.accessToken ? 'PRESENTE' : 'AUSENTE',
        refreshToken: response.refreshToken ? 'PRESENTE' : 'AUSENTE',
        user: response.user 
      });

      // Validar resposta da API
      if (!response.accessToken || typeof response.accessToken !== 'string') {
        console.error(`❌ [AUTH_CONTEXT] Access token inválido na resposta:`, response.accessToken);
        throw new Error('Resposta da API inválida: access token ausente ou inválido');
      }

      if (!response.refreshToken || typeof response.refreshToken !== 'string') {
        console.error(`❌ [AUTH_CONTEXT] Refresh token inválido na resposta:`, response.refreshToken);
        throw new Error('Resposta da API inválida: refresh token ausente ou inválido');
      }

      if (!response.user || typeof response.user !== 'object') {
        console.error(`❌ [AUTH_CONTEXT] Dados de usuário inválidos na resposta:`, response.user);
        throw new Error('Resposta da API inválida: dados de usuário ausentes ou inválidos');
      }

      console.log(`💾 [AUTH_CONTEXT] Salvando dados no TokenService...`);
      
      // Salvar access token
      await tokenService.setAccessToken(response.accessToken);
      console.log(`✅ [AUTH_CONTEXT] Access token salvo com sucesso`);
      
      // Salvar refresh token
      await tokenService.setRefreshToken(response.refreshToken);
      console.log(`✅ [AUTH_CONTEXT] Refresh token salvo com sucesso`);
      
      // Salvar dados do usuário
      await tokenService.setUserData(response.user);
      console.log(`✅ [AUTH_CONTEXT] Dados do usuário salvos com sucesso`);
      
      setUser(response.user);
      console.log(`🎉 [AUTH_CONTEXT] Login realizado com sucesso!`);
      
    } catch (error) {
      console.error(`💥 [AUTH_CONTEXT] Erro no login:`, error);
      
      // Em caso de erro relacionado ao SecureStore, limpar dados
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as any).message === 'string' &&
        ((error as any).message.includes('SecureStore') || (error as any).message.includes('Invalid value'))
      ) {
        console.log(`🧹 [AUTH_CONTEXT] Erro de SecureStore detectado, limpando dados...`);
        try {
          await tokenService.clearAllData();
          console.log(`✅ [AUTH_CONTEXT] Dados limpos após erro de SecureStore`);
        } catch (clearError) {
          console.error(`❌ [AUTH_CONTEXT] Erro ao limpar dados após erro de SecureStore:`, clearError);
        }
      }
      
      const errorMessage = getErrorMessage(error, 'Erro ao fazer login.');
      console.log(`📝 [AUTH_CONTEXT] Mensagem de erro processada:`, errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
      console.log(`⏳ [AUTH_CONTEXT] isLoading definido como false`);
    }
  };

  const register = async (data: RegisterFormData) => {
    console.log('🌐 [AUTH_CONTEXT] Função register chamada com dados:', JSON.stringify(data, null, 2));
    
    try {
      console.log('⏳ [AUTH_CONTEXT] Definindo isLoading = true');
      setIsLoading(true);
      
      // Converter data brasileira para formato ISO
      console.log('📅 [AUTH_CONTEXT] Convertendo data de nascimento...');
      const isoDate = convertBrazilianDateToISO(data.dateOfBirth);
      
      if (!isoDate) {
        console.log('❌ [AUTH_CONTEXT] Falha na conversão da data');
        throw new Error('Data de nascimento inválida');
      }
      
      console.log(`✅ [AUTH_CONTEXT] Data convertida: "${data.dateOfBirth}" → "${isoDate}"`);
      
      // Preparar dados para envio
      const apiPayload = {
        name: data.name,
        email: data.email,
        password: data.password,
        date_of_birth: isoDate, // Usar data convertida
      };
      
      console.log('📤 [AUTH_CONTEXT] Payload preparado para API:', JSON.stringify(apiPayload, null, 2));
      console.log('🔗 [AUTH_CONTEXT] Chamando apiService.register...');
      
      const response = await apiService.register(apiPayload);
      
      console.log('✅ [AUTH_CONTEXT] Resposta da API recebida:', JSON.stringify(response, null, 2));
      console.log('🎉 [AUTH_CONTEXT] Registro realizado com sucesso!');
      
    } catch (error) {
      console.log('💥 [AUTH_CONTEXT] Erro capturado:', error);
      console.log('📋 [AUTH_CONTEXT] Tipo do erro:', typeof error);
      console.log('🔍 [AUTH_CONTEXT] Propriedades do erro:', Object.keys(error || {}));
      
      if (error instanceof Error) {
        console.log('📝 [AUTH_CONTEXT] Mensagem original do erro:', error.message);
        console.log('📚 [AUTH_CONTEXT] Stack trace:', error.stack);
      }
      
      const errorMessage = getErrorMessage(error, 'Erro ao criar conta.');
      console.log('🔧 [AUTH_CONTEXT] Mensagem processada:', errorMessage);
      
      console.log('🚀 [AUTH_CONTEXT] Relançando erro com mensagem processada');
      throw new Error(errorMessage);
    } finally {
      console.log('⏳ [AUTH_CONTEXT] Definindo isLoading = false');
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log(`🚪 [AUTH_CONTEXT] Iniciando logout...`);
    
    try {
      await tokenService.clearAllData();
      setUser(null);
      console.log(`✅ [AUTH_CONTEXT] Logout realizado com sucesso`);
    } catch (error) {
      console.error(`❌ [AUTH_CONTEXT] Falha ao fazer logout:`, error);
      
      // Mesmo com erro, limpar estado local
      setUser(null);
      
      // Tentar limpeza forçada
      try {
        await tokenService.clearAllData();
        console.log(`🧹 [AUTH_CONTEXT] Limpeza forçada realizada`);
      } catch (clearError) {
        console.error(`❌ [AUTH_CONTEXT] Erro na limpeza forçada:`, clearError);
      }
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await apiService.forgotPassword(email);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Erro ao solicitar redefinição de senha.');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetCode = async (email: string, code: string) => {
    try {
      setIsLoading(true);
      await apiService.verifyResetCode(code);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Código inválido ou expirado.');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      setIsLoading(true);
      await apiService.resetPassword(code, newPassword);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Erro ao redefinir senha.');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetupStatus = async (status: boolean) => {
    if (user) {
      const updatedUser = { ...user, initial_setup_completed: status };
      
      try {
        await tokenService.setUserData(updatedUser);
        setUser(updatedUser);
      } catch (error) {
        console.error(`❌ [AUTH_CONTEXT] Erro ao atualizar status de setup:`, error);
        throw new Error('Erro ao atualizar configurações');
      }
    }
  };

  // Memorizar valores computados para evitar re-renders desnecessários
  const isAuthenticated = !!user;
  const setupCompleted = user?.initial_setup_completed || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        setupCompleted,
        login,
        register,
        logout,
        updateSetupStatus,
        forgotPassword,
        verifyResetCode,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};