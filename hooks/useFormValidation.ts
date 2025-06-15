import { ForgotPasswordFormData, LoginFormData, RegisterFormData, ResetPasswordFormData } from '@/types/auth';
import { useState } from 'react';

interface ValidationErrors {
  [key: string]: string;
}

export const useFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateDate = (date: string): boolean => {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    return dateRegex.test(date);
  };

  const validateLoginForm = (data: LoginFormData): boolean => {
    const newErrors: ValidationErrors = {};

    // Validar email
    if (!data.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar senha
    if (!data.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (data.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = (data: RegisterFormData): boolean => {
    const newErrors: ValidationErrors = {};

    // Validar nome completo
    if (!data.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    } else if (data.fullName.trim().length < 2) {
      newErrors.fullName = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar email
    if (!data.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar data de nascimento
    if (!data.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Data de nascimento é obrigatória';
    } else if (!validateDate(data.dateOfBirth)) {
      newErrors.dateOfBirth = 'Data inválida (DD/MM/AAAA)';
    }

    // Validar senha
    if (!data.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (data.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validar confirmação de senha
    if (!data.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgotPasswordForm = (data: ForgotPasswordFormData): boolean => {
    const newErrors: ValidationErrors = {};

    if (!data.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetPasswordForm = (data: ResetPasswordFormData): boolean => {
    const newErrors: ValidationErrors = {};

    // Validar código
    if (!data.code.trim()) {
      newErrors.code = 'Código é obrigatório';
    } else if (data.code.length !== 6) {
      newErrors.code = 'Código deve ter 6 dígitos';
    }

    // Validar nova senha
    if (!data.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (data.newPassword.length < 6) {
      newErrors.newPassword = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validar confirmação de senha
    if (!data.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (data.newPassword !== data.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateLoginForm,
    validateRegisterForm,
    validateForgotPasswordForm,
    validateResetPasswordForm,
    clearErrors,
  };
};