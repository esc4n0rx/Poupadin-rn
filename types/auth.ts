export interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}