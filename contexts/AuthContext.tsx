import { LoginFormData, RegisterFormData, User } from '@/types/auth';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  forgotPassword: (email: string) => Promise<void>;
  verifyResetCode: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar usuário do storage ao inicializar
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular resposta da API
      const userData: User = {
        id: '1',
        fullName: 'João Silva',
        email: data.email,
        dateOfBirth: '01/01/1990',
      };

      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      await SecureStore.setItemAsync('token', 'mock-jwt-token');
      
      setUser(userData);
    } catch (error) {
      throw new Error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular resposta da API
      const userData: User = {
        id: '1',
        fullName: data.fullName,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
      };

      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      await SecureStore.setItemAsync('token', 'mock-jwt-token');
      
      setUser(userData);
    } catch (error) {
      throw new Error('Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Simular chamada à API para envio do código
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Código enviado para:', email);
    } catch (error) {
      throw new Error('Erro ao enviar código de recuperação');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetCode = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      // Simular verificação do código
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular validação (aceita qualquer código com 6 dígitos)
      if (code !== '123456') {
        throw new Error('Código inválido');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    setIsLoading(true);
    try {
      // Simular reset da senha
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Senha alterada para:', email);
    } catch (error) {
      throw new Error('Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('token');
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isLoading,
      forgotPassword,
      verifyResetCode,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};