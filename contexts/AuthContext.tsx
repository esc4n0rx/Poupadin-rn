import { tokenService } from '@/services/tokenService';
import { LoginFormData, RegisterFormData, User } from '@/types/auth';
import { BudgetSetupStatus } from '@/types/budget';
import React, { createContext, useContext, useState } from 'react';


const API_BASE_URL = 'https://api.poupadin.com'

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setupStatus: BudgetSetupStatus | null;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  verifyResetCode: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  checkSetupStatus: () => Promise<void>;
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
  const [setupStatus, setSetupStatus] = useState<BudgetSetupStatus | null>(null);

  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = user?.token;
    
    const defaultHeaders: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(errorData.message || `Erro ${response.status}`);
    }

    return response.json();
  };

  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // ⚠️ USAR API REAL - ajuste o endpoint conforme sua API
      const response = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });
      
      const userData: User = {
        id: response.user.id,
        fullName: response.user.full_name || response.user.fullName,
        email: response.user.email,
        mobileNumber: response.user.mobile_number || response.user.mobileNumber || '',
        dateOfBirth: response.user.date_of_birth || response.user.dateOfBirth || '',
        token: response.token,
        initial_setup_completed: response.user.initial_setup_completed,
        name: ''
      };
      
      setUser(userData);
      await tokenService.saveToken(userData.token);
      await checkSetupStatus();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // ⚠️ USAR API REAL - ajuste conforme sua API de registro
      const response = await makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: data.fullName,
          email: data.email,
          mobile_number: data.mobileNumber || '',
          date_of_birth: data.dateOfBirth,
          password: data.password,
        }),
      });
      
      const userData: User = {
        id: response.user.id,
        fullName: response.user.full_name,
        email: response.user.email,
        mobileNumber: response.user.mobile_number || '',
        dateOfBirth: response.user.date_of_birth,
        token: response.token,
        initial_setup_completed: response.user.initial_setup_completed,
        name: ''
      };
      
      setUser(userData);
      await tokenService.saveToken(userData.token);
      await checkSetupStatus();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await tokenService.removeToken();
    setUser(null);
    setSetupStatus(null);
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // ⚠️ USAR API REAL
      await makeRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetCode = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      // ⚠️ USAR API REAL
      await makeRequest('/api/auth/verify-reset-code', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    setIsLoading(true);
    try {
      // ⚠️ USAR API REAL
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
  };

  const checkSetupStatus = async () => {
    if (!user) return;
    
    try {
      // ⚠️ USAR API REAL
      const response = await makeRequest('/api/budget/setup-status');
      setSetupStatus(response);
    } catch (error) {
      console.error('Erro ao verificar status do setup:', error);
      // Em caso de erro, assumir que setup não foi feito
      setSetupStatus({
        setup_completed: false,
        message: 'Erro ao verificar status'
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        setupStatus,
        login,
        register,
        logout,
        forgotPassword,
        verifyResetCode,
        resetPassword,
        checkSetupStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};