// types/auth.ts
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
  mobileNumber?: string; // Removido daqui, mantido apenas para compatibilidade se algum código ainda referenciar
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  initial_setup_completed: boolean;
  created_at?: string;
  date_of_birth?: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;  // Alterado de 'token' para 'accessToken'
  refreshToken: string; // Adicionado refresh token
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface ForgotPasswordResponse {
  message: string;
  instruction: string;
}

export interface VerifyResetCodeResponse {
  message: string;
  valid: boolean;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}