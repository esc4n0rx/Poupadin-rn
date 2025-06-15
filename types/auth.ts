export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
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

export interface User {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
}