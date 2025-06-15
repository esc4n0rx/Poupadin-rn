// contexts/AuthContext.tsx
import {
  LoginFormData,
  LoginResponse,
  RegisterFormData,
  RegisterResponse,
  User
} from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginFormData) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyResetCode: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // URL base da API
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('Fazendo requisição para:', url); // Debug
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('Status da resposta:', response.status); // Debug

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Erro da API:', errorData); // Debug
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Resposta da API:', data); // Debug
      return data;
    } catch (error) {
      console.error('Erro na requisição:', error); // Debug
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      }
      throw error;
    }
  };

  const login = async (credentials: LoginFormData) => {
    setIsLoading(true);
    try {
      const response: LoginResponse = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Salvar token e dados do usuário
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Converter formato da data de DD/MM/YYYY para YYYY-MM-DD
      const [day, month, year] = userData.dateOfBirth.split('/');
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      // Mapear dados para formato da API
      const apiPayload = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        date_of_birth: formattedDate,
      };

      console.log('Payload para register:', apiPayload); // Debug

      const response: RegisterResponse = await makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(apiPayload),
      });

      // Para registro, ainda não temos token, então o usuário precisa fazer login
      // Ou podemos implementar auto-login após registro
      
      // Se quiser auto-login após registro, descomente:
      // await AsyncStorage.setItem('userData', JSON.stringify(response.user));
      // setUser(response.user);
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await makeRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetCode = async (email: string, code: string) => {
    return makeRequest('/api/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    return makeRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ 
        code, 
        password: newPassword // API espera 'password', não 'newPassword'
      }),
    });
  };

  // Verificar se há usuário salvo ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [token, userData] = await AsyncStorage.multiGet(['authToken', 'userData']);
        
        if (token[1] && userData[1]) {
          const user = JSON.parse(userData[1]);
          setUser(user);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  // Se ainda está inicializando, não renderizar nada
  if (isInitializing) {
    return null;
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      forgotPassword,
      verifyResetCode,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};