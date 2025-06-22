// utils/dateUtils.ts

/**
 * Converte data do formato brasileiro (DD/MM/YYYY) para formato ISO (YYYY-MM-DD)
 * @param brazilianDate - Data no formato DD/MM/YYYY
 * @returns Data no formato YYYY-MM-DD ou null se inválida
 */
export const convertBrazilianDateToISO = (brazilianDate: string): string | null => {
  console.log(`📅 [DATE_UTILS] Convertendo data brasileira: "${brazilianDate}"`);
  
  // Verificar se está no formato correto
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(brazilianDate)) {
    console.log(`❌ [DATE_UTILS] Formato inválido. Esperado: DD/MM/YYYY`);
    return null;
  }

  try {
    const [day, month, year] = brazilianDate.split('/');
    
    // Validar se os valores são válidos
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900) {
      console.log(`❌ [DATE_UTILS] Valores de data inválidos: dia=${dayNum}, mês=${monthNum}, ano=${yearNum}`);
      return null;
    }
    
    // Formatar com zero à esquerda quando necessário
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    console.log(`✅ [DATE_UTILS] Data convertida: "${brazilianDate}" → "${isoDate}"`);
    return isoDate;
  } catch (error) {
    console.log(`💥 [DATE_UTILS] Erro na conversão:`, error);
    return null;
  }
};

/**
 * Converte data do formato ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
 * @param isoDate - Data no formato YYYY-MM-DD
 * @returns Data no formato DD/MM/YYYY ou null se inválida
 */
export const convertISODateToBrazilian = (isoDate: string): string | null => {
  console.log(`📅 [DATE_UTILS] Convertendo data ISO: "${isoDate}"`);
  
  // Verificar se está no formato correto
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(isoDate)) {
    console.log(`❌ [DATE_UTILS] Formato inválido. Esperado: YYYY-MM-DD`);
    return null;
  }

  try {
    const [year, month, day] = isoDate.split('-');
    const brazilianDate = `${day}/${month}/${year}`;
    
    console.log(`✅ [DATE_UTILS] Data convertida: "${isoDate}" → "${brazilianDate}"`);
    return brazilianDate;
  } catch (error) {
    console.log(`💥 [DATE_UTILS] Erro na conversão:`, error);
    return null;
  }
};

/**
 * Valida se uma data no formato brasileiro é válida
 * @param brazilianDate - Data no formato DD/MM/YYYY
 * @returns true se a data for válida
 */
export const validateBrazilianDate = (brazilianDate: string): boolean => {
  console.log(`🔍 [DATE_UTILS] Validando data brasileira: "${brazilianDate}"`);
  
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(brazilianDate)) {
    console.log(`❌ [DATE_UTILS] Formato inválido`);
    return false;
  }
  
  const [day, month, year] = brazilianDate.split('/').map(Number);
  
  // Criar objeto Date para validar
  const dateObj = new Date(year, month - 1, day);
  
  // Verificar se a data é válida e se não há problemas de overflow
  const isValid = dateObj.getFullYear() === year &&
                  dateObj.getMonth() === month - 1 &&
                  dateObj.getDate() === day &&
                  year >= 1900 &&
                  year <= new Date().getFullYear() - 13; // Mínimo 13 anos
  
  console.log(`📊 [DATE_UTILS] Data válida:`, isValid);
  return isValid;
};