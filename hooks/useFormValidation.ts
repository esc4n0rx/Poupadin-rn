// hooks/useFormValidation.ts
import { ForgotPasswordFormData, LoginFormData, RegisterFormData, ResetPasswordFormData } from '@/types/auth';
import { validateBrazilianDate } from '@/utils/dateUtils';
import { useState } from 'react';

interface ValidationErrors {
  [key: string]: string;
}

export const useFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    console.log(`📧 [VALIDATION] Email "${email}" válido:`, isValid);
    return isValid;
  };

  const validateDate = (date: string): boolean => {
    console.log(`📅 [VALIDATION] Validando data: "${date}"`);
    return validateBrazilianDate(date);
  };

  const validatePassword = (password: string): boolean => {
    const isValid = password.length >= 8;
    console.log(`🔒 [VALIDATION] Senha (${password.length} chars) válida:`, isValid);
    return isValid;
  };

  const validateName = (name: string): boolean => {
    const isValid = name.trim().length >= 3;
    console.log(`👤 [VALIDATION] Nome "${name}" (${name.trim().length} chars) válido:`, isValid);
    return isValid;
  };

  const validateLoginForm = (data: LoginFormData): boolean => {
    console.log('🔍 [VALIDATION] Iniciando validação do form de login:', data);
    const newErrors: ValidationErrors = {};

    if (!data.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!data.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (!validatePassword(data.password)) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    }

    console.log('📊 [VALIDATION] Erros encontrados no login:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = (data: RegisterFormData): boolean => {
    console.log('🔍 [VALIDATION] Iniciando validação do form de registro:', data);
    const newErrors: ValidationErrors = {};

    // Validar nome
    console.log('👤 [VALIDATION] Validando nome...');
    if (!data.name.trim()) {
      console.log('❌ [VALIDATION] Nome vazio');
      newErrors.name = 'Nome é obrigatório';
    } else if (!validateName(data.name)) {
      console.log('❌ [VALIDATION] Nome muito curto');
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    } else {
      console.log('✅ [VALIDATION] Nome válido');
    }

    // Validar email
    console.log('📧 [VALIDATION] Validando email...');
    if (!data.email.trim()) {
      console.log('❌ [VALIDATION] Email vazio');
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(data.email)) {
      console.log('❌ [VALIDATION] Email inválido');
      newErrors.email = 'Email inválido';
    } else {
      console.log('✅ [VALIDATION] Email válido');
    }

    // Validar data de nascimento
    console.log('📅 [VALIDATION] Validando data de nascimento...');
    if (!data.dateOfBirth.trim()) {
      console.log('❌ [VALIDATION] Data vazia');
      newErrors.dateOfBirth = 'Data de nascimento é obrigatória';
    } else if (!validateDate(data.dateOfBirth)) {
      console.log('❌ [VALIDATION] Data inválida');
      newErrors.dateOfBirth = 'Data inválida (DD/MM/AAAA) - Mínimo 13 anos';
    } else {
      console.log('✅ [VALIDATION] Data válida');
    }

    // Validar senha
    console.log('🔒 [VALIDATION] Validando senha...');
    if (!data.password) {
      console.log('❌ [VALIDATION] Senha vazia');
      newErrors.password = 'Senha é obrigatória';
    } else if (!validatePassword(data.password)) {
      console.log('❌ [VALIDATION] Senha muito curta');
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    } else {
      console.log('✅ [VALIDATION] Senha válida');
    }

    // Validar confirmação de senha
    console.log('🔒 [VALIDATION] Validando confirmação de senha...');
    if (!data.confirmPassword) {
      console.log('❌ [VALIDATION] Confirmação vazia');
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (data.password !== data.confirmPassword) {
      console.log('❌ [VALIDATION] Senhas não coincidem');
      console.log(`🔒 [VALIDATION] Senha: "${data.password}"`);
      console.log(`🔒 [VALIDATION] Confirmação: "${data.confirmPassword}"`);
      newErrors.confirmPassword = 'Senhas não coincidem';
    } else {
      console.log('✅ [VALIDATION] Confirmação de senha válida');
    }

    console.log('📊 [VALIDATION] Erros encontrados no registro:', newErrors);
    console.log('📊 [VALIDATION] Total de erros:', Object.keys(newErrors).length);
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('📊 [VALIDATION] Formulário válido:', isValid);
    
    return isValid;
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

    if (!data.code.trim()) {
      newErrors.code = 'Código é obrigatório';
    } else if (data.code.length !== 6) {
      newErrors.code = 'Código deve ter 6 dígitos';
    }

    if (!data.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (!validatePassword(data.newPassword)) {
      newErrors.newPassword = 'Senha deve ter pelo menos 8 caracteres';
    }

    if (!data.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (data.newPassword !== data.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    console.log('🧹 [VALIDATION] Limpando erros');
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