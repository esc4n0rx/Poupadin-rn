// utils/errorHandler.ts

/**
 * Extrai uma mensagem de erro significativa de um objeto de erro da API ou genérico.
 * @param error - O objeto de erro capturado.
 * @param defaultMessage - Uma mensagem padrão para usar como fallback.
 * @returns A mensagem de erro formatada.
 */
export const getErrorMessage = (error: any, defaultMessage: string): string => {
  // ✅ CORREÇÃO: Prioriza a extração de mensagens do corpo do erro da API.
  if (error?.body && error?.status) {
    // Se a API retornar um array de erros de validação, junta todos.
    if (error.status === 400 && error.body.errors && Array.isArray(error.body.errors)) {
      return error.body.errors.join('\n');
    }
    // Se não, usa a mensagem principal do corpo do erro.
    if (error.body.message) {
      return error.body.message;
    }
  }

  // Fallback para objetos de erro padrão.
  if (error?.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  // Retorna a mensagem padrão se nenhuma outra puder ser extraída.
  return defaultMessage || 'Erro inesperado. Tente novamente.';
};