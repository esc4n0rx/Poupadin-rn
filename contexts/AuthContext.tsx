// contexts/AuthContext.tsx
import {
  LoginFormData,
  RegisterFormData,
  User
} from '@/types/auth';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

// URL base da API - ajuste conforme necessário
const API_BASE_URL = 'https://api.poupadin.space/api';

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setupCompleted: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyResetCode: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  updateSetupStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [setupCompleted, setSetupCompleted] = useState<boolean>(false);

  // Carregar dados armazenados ao inicializar
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      setIsLoading(true);
      const storedToken = await SecureStore.getItemAsync('token');
      const storedUser = await SecureStore.getItemAsync('user');

      console.log('Token armazenado:', storedToken ? 'Existe' : 'Não existe');
      console.log('Usuário armazenado:', storedUser ? 'Existe' : 'Não existe');

      if (storedToken && storedUser) {
        setToken(storedToken);
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setSetupCompleted(userData.initial_setup_completed || false);
        setIsAuthenticated(true);
        
        console.log('Dados carregados - Setup completed:', userData.initial_setup_completed);
      }
    } catch (error) {
      console.error('Erro ao carregar dados armazenados:', error);
      // Em caso de erro, limpar dados corrompidos
      await clearStoredData();
    } finally {
      setIsLoading(false);
    }
  };

  const clearStoredData = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    } catch (error) {
      console.error('Erro ao limpar dados armazenados:', error);
    }
  };

  const login = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      console.log('Fazendo requisição para:', `${API_BASE_URL}/auth/login`);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro no login');
      }

      const responseData = await response.json();
      console.log('Resposta da API:', responseData);

      if (responseData.token && responseData.user) {
        setToken(responseData.token);
        setUser(responseData.user);
        setSetupCompleted(responseData.user.initial_setup_completed || false);
        setIsAuthenticated(true);

        // Armazenar dados localmente
        await SecureStore.setItemAsync('token', responseData.token);
        await SecureStore.setItemAsync('user', JSON.stringify(responseData.user));

        console.log('Login bem-sucedido - Setup completed:', responseData.user.initial_setup_completed);
      } else {
        throw new Error('Dados de login inválidos');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      console.log('Fazendo requisição para:', `${API_BASE_URL}/auth/register`);

      // Formatar data de nascimento para ISO se necessário
      const formattedData = {
        ...data,
        date_of_birth: data.dateOfBirth, // Ajustar campo se necessário
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro no cadastro');
      }

      const responseData = await response.json();
      console.log('Resposta da API:', responseData);

      // Não fazer login automático, apenas retornar sucesso
      return responseData;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      console.log('Fazendo requisição para:', `${API_BASE_URL}/auth/forgot-password`);

      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar código');
      }

      const responseData = await response.json();
      console.log('Resposta da API:', responseData);

      return responseData;
    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetCode = async (email: string, code: string) => {
    try {
      setIsLoading(true);
      console.log('Fazendo requisição para:', `${API_BASE_URL}/auth/verify-reset-code`);

      const response = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Código inválido');
      }

      const responseData = await response.json();
      console.log('Resposta da API:', responseData);

      return responseData;
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      setIsLoading(true);
      console.log('Fazendo requisição para:', `${API_BASE_URL}/auth/reset-password`);

      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          code, 
          new_password: newPassword 
        }),
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao alterar senha');
      }

      const responseData = await response.json();
      console.log('Resposta da API:', responseData);

      return responseData;
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetupStatus = async () => {
    try {
      console.log('Atualizando status do setup...');

      // Atualizar localmente primeiro
      if (user) {
        const updatedUser = { ...user, initial_setup_completed: true };
        setUser(updatedUser);
        setSetupCompleted(true);
        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
        
        console.log('Status do setup atualizado localmente');
      }

      // TODO: Implementar chamada para API para atualizar no backend
      // const response = await fetch(`${API_BASE_URL}/user/complete-setup`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`,
      //   },
      // });

      // if (!response.ok) {
      //   throw new Error('Erro ao atualizar status no servidor');
      // }

    } catch (error) {
      console.error('Erro ao atualizar status do setup:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Fazendo logout...');
      
      setUser(null);
      setToken(null);
      setSetupCompleted(false);
      setIsAuthenticated(false);
      
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const value: AuthContextData = {
    user,
    token,
    isAuthenticated,
    isLoading,
    setupCompleted,
    login,
    register,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    logout,
    updateSetupStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};