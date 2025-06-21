// contexts/AuthContext.tsx (adicionando funcionalidades do perfil)
// contexts/AuthContext.tsx
import { apiService } from '@/services/apiService';
import { tokenService } from '@/services/tokenService';
import { LoginFormData, RegisterFormData, User } from '@/types/auth';
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
    const response = await apiService.post<any>('/auth/login', data);
    const { accessToken, refreshToken, user: userData } = response;

    await tokenService.setAccessToken(accessToken);
    await tokenService.setRefreshToken(refreshToken);
    await tokenService.setUserData(userData);
    setUser(userData);
  };

  const register = async (data: RegisterFormData) => {
    // API não retorna tokens no registro, apenas sucesso
    await apiService.post('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
      date_of_birth: data.dateOfBirth,
    });
  };

  const logout = async () => {
    try {
      const refreshToken = await tokenService.getRefreshToken();
      if (refreshToken) {
        await apiService.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Falha ao revogar token no servidor, limpando localmente.', error);
    } finally {
      await tokenService.clearAllData();
      setUser(null);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await makeRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetCode = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      await makeRequest('/api/auth/verify-reset-code', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
    } finally {
      setIsLoading(false);
    }
    return makeRequest('/api/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await makeRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          code, 
          new_password: newPassword 
        }),
      });
    } finally {
      setIsLoading(false);
    }
    return makeRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ 
        code, 
        password: newPassword
      }),
    });
  };

  const updateSetupStatus = async (status: boolean) => {
    if (user) {
      const updatedUser = { ...user, initial_setup_completed: status };
      await tokenService.setUserData(updatedUser);
      setUser(updatedUser);
    }
  };

  const value: AuthContextData = {
    user,
    isAuthenticated: !!user,
    isLoading,
    setupCompleted: user?.initial_setup_completed ?? false,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    login,
    register,
    logout,
    updateSetupStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

function makeRequest(arg0: string, arg1: { method: string; body: string; }) {
    throw new Error('Function not implemented.');
  }