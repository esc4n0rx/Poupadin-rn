import { LoginFormData, RegisterFormData } from '@/types/auth';
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

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
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

    // Validar telefone
    if (!data.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Número de telefone é obrigatório';
    } else if (!validatePhone(data.mobileNumber)) {
      newErrors.mobileNumber = 'Número de telefone inválido';
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

  const clearErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateLoginForm,
    validateRegisterForm,
    clearErrors,
  };
};