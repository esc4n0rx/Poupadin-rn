// utils/errorHandler.ts
export const getErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  // Tratar diferentes tipos de erro da API
  if (error?.status === 409) {
    return 'Este e-mail já está em uso.';
  }
  
  if (error?.status === 401) {
    return 'Credenciais inválidas.';
  }
  
  if (error?.status === 400) {
    return error?.errors?.join(', ') || 'Erro de validação.';
  }
  
  return 'Erro inesperado. Tente novamente.';
};