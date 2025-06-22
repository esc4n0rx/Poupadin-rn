// contexts/AuthContext.tsx
import { apiService } from '@/services/api';
import { tokenService } from '@/services/tokenService';
import { LoginFormData, RegisterFormData, User } from '@/types/auth';
import { convertBrazilianDateToISO } from '@/utils/dateUtils';
import { getErrorMessage } from '@/utils/errorHandler';
import React, { createContext, useContext, useEffect, useState } from 'react';

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

  useEffect(() => {
    const loadUserFromStorage = async () => {
      setIsLoading(true);
      try {
        const accessToken = await tokenService.getAccessToken();
        const userData = await tokenService.getUserData();
        
        if (accessToken && userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Falha ao carregar dados do usuário:', error);
        await tokenService.clearAllData();
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const login = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response = await apiService.login({
        email: data.email,
        password: data.password,
      });

      await tokenService.setAccessToken(response.token);
      await tokenService.setUserData(response.user);
      setUser(response.user);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Erro ao fazer login.');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
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
    try {
      await tokenService.clearAllData();
      setUser(null);
    } catch (error) {
      console.error('Falha ao fazer logout:', error);
      await tokenService.clearAllData();
      setUser(null);
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
      await tokenService.setUserData(updatedUser);
      setUser(updatedUser);
    }
  };

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