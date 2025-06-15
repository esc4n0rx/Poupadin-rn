// types/auth.ts
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string; // Mudança: era fullName
  email: string;
  dateOfBirth: string; // Será convertido para date_of_birth
  password: string;
  confirmPassword: string;
  mobileNumber?: string; // Opcional, não será enviado para API
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
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}