import { LoginFormData, RegisterFormData, User } from '@/types/auth';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Simulando chamada da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock de usuário logado
      const mockUser: User = {
        id: '1',
        fullName: 'João Silva',
        email: data.email,
        mobileNumber: '+55 11 99999-9999',
        dateOfBirth: '01/01/1990',
      };
      
      setUser(mockUser);
    } catch (error) {
      throw new Error('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Simulando chamada da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock de usuário registrado
      const mockUser: User = {
        id: '1',
        fullName: data.fullName,
        email: data.email,
        mobileNumber: data.mobileNumber,
        dateOfBirth: data.dateOfBirth,
      };
      
      setUser(mockUser);
    } catch (error) {
      throw new Error('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};