// types/auth.ts
export interface User {
  id: string;
  fullName: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  mobileNumber?: string;
  initial_setup_completed?: boolean;
  token:string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  mobileNumber: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  verifyResetCode: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string, code: string, password: string) => Promise<void>;
}