// contexts/AuthContext.tsx
import { apiService } from '@/services/api';
import { AuthContextType, LoginFormData, RegisterFormData, User } from '@/types/auth';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se existe token salvo ao inicializar
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const userData = await SecureStore.getItemAsync('userData');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Erro ao verificar estado de autenticação:', error);
    }
  };

  const formatDateForAPI = (dateString: string): string => {
    // Converter DD/MM/YYYY para YYYY-MM-DD
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  const login = async (data: LoginFormData): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiService.login({
        email: data.email,
        password: data.password,
      });

      // Salvar token e dados do usuário
      await SecureStore.setItemAsync('userToken', response.token);
      
      const userData: User = {
        id: response.user.id,
        fullName: response.user.name,
        name: response.user.name,
        email: response.user.email,
        initial_setup_completed: response.user.initial_setup_completed,
      };

      await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      setUser(userData);

      // Mostrar mensagem de sucesso
      Alert.alert('Sucesso!', response.message);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiService.register({
        name: data.fullName,
        email: data.email,
        password: data.password,
        date_of_birth: formatDateForAPI(data.dateOfBirth),
      });

      // Mostrar mensagem de sucesso
      Alert.alert(
        'Sucesso!', 
        response.message + ' Agora você pode fazer login.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Não fazer login automático, usuário deve fazer login manualmente
            }
          }
        ]
      );
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiService.forgotPassword(email);
      
      // Mostrar mensagem com instrução
      Alert.alert('Email Enviado!', response.instruction);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetCode = async (email: string, code: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiService.verifyResetCode(code);
      
      if (!response.valid) {
        throw new Error(response.message);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (
    email: string,
    code: string,
    password: string
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiService.resetPassword(code, password);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      // Mostrar mensagem de sucesso
      Alert.alert('Sucesso!', response.message);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      setUser(null);
    } catch (error) {
      console.log('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        verifyResetCode,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};