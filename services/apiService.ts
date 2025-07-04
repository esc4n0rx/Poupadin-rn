// services/apiService.ts
import { tokenService } from './tokenService';

const API_BASE_URL = 'https://api.poupadin.space/api';

// Armazena a promessa de renovação para evitar múltiplas chamadas simultâneas
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Função para renovar o token
const refreshToken = async (): Promise<string | null> => {
  console.log('🔄 [API_SERVICE] Iniciando renovação de token');
  
  const currentRefreshToken = await tokenService.getRefreshToken();
  if (!currentRefreshToken) {
    console.log('❌ [API_SERVICE] Refresh token não encontrado');
    // Se não houver refresh token, força o logout
    // A lógica de logout será chamada no AuthContext que detectará a falha
    return null; 
  }

  try {
    console.log('📤 [API_SERVICE] Enviando requisição de renovação');
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    const data = await response.json();
    console.log('📨 [API_SERVICE] Resposta da renovação recebida:', {
      status: response.status,
      ok: response.ok,
      hasAccessToken: !!data.accessToken,
      hasRefreshToken: !!data.refreshToken
    });

    if (!response.ok) {
      console.log('❌ [API_SERVICE] Renovação falhou:', data.message);
      throw new Error(data.message || 'Sessão expirada');
    }

    // Validar tokens na resposta
    if (!data.accessToken || typeof data.accessToken !== 'string') {
      console.error('❌ [API_SERVICE] Access token inválido na renovação');
      throw new Error('Token de acesso inválido na resposta');
    }

    if (!data.refreshToken || typeof data.refreshToken !== 'string') {
      console.error('❌ [API_SERVICE] Refresh token inválido na renovação');
      throw new Error('Token de atualização inválido na resposta');
    }

    // Armazena os novos tokens
    console.log('💾 [API_SERVICE] Salvando novos tokens');
    await tokenService.setAccessToken(data.accessToken);
    await tokenService.setRefreshToken(data.refreshToken);

    console.log('✅ [API_SERVICE] Token renovado com sucesso');
    return data.accessToken;
  } catch (error) {
    console.error('❌ [API_SERVICE] Falha ao renovar o token:', error);
    // Em caso de falha na renovação, limpa os dados
    await tokenService.clearAllData();
    // Força a necessidade de um novo login
    return null;
  }
};

// Interceptor de API
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  console.log(`🌐 [API_SERVICE] Fazendo requisição autenticada para: ${url}`);
  
  let accessToken = await tokenService.getAccessToken();
  console.log(`🎫 [API_SERVICE] Access token ${accessToken ? 'encontrado' : 'não encontrado'}`);

  if (!accessToken) {
    console.error('❌ [API_SERVICE] Access token não encontrado');
    throw new Error('Token de acesso não encontrado. Faça login novamente.');
  }

  // Adiciona o token de autorização aos headers
  const newOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  };


  let response = await fetch(`${API_BASE_URL}${url}`, newOptions);
  console.log(`📨 [API_SERVICE] Resposta recebida:`, {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  // Se o token expirou (401), tenta renová-lo
  if (response.status === 401) {
    console.log('🔒 [API_SERVICE] Token expirado (401), tentando renovar');
    
    if (!isRefreshing) {
      console.log('🔄 [API_SERVICE] Iniciando processo de renovação');
      isRefreshing = true;
      refreshPromise = refreshToken();
    } else {
      console.log('⏳ [API_SERVICE] Aguardando renovação em andamento');
    }

    const newAccessToken = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (newAccessToken) {
      console.log('✅ [API_SERVICE] Token renovado, repetindo requisição original');
      // Repete a chamada original com o novo token
      newOptions.headers = {
        ...newOptions.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };
      response = await fetch(`${API_BASE_URL}${url}`, newOptions);
      console.log(`📨 [API_SERVICE] Nova resposta após renovação:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
    } else {
      console.log('❌ [API_SERVICE] Falha na renovação, retornando resposta 401 original');
      // Se a renovação falhou, a resposta original (de erro) é retornada
      // e o AuthContext irá tratar o logout
      return response;
    }
  }

  return response;
};

// Classe do serviço de API
class ApiService {
  async post<T>(endpoint: string, data: any): Promise<T> {
    console.log(`📤 [API_SERVICE] POST ${endpoint}:`, {
      hasData: !!data,
      dataType: typeof data,
      dataKeys: data && typeof data === 'object' ? Object.keys(data) : 'N/A'
    });

    try {
      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Ler texto da resposta primeiro para debug
      const responseText = await response.text();
      console.log(`📝 [API_SERVICE] Resposta bruta (${response.status}):`, responseText.substring(0, 200) + '...');

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ [API_SERVICE] Erro ao parsear JSON da resposta:', parseError);
        console.log('📝 [API_SERVICE] Resposta completa:', responseText);
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        console.log(`❌ [API_SERVICE] Erro HTTP ${response.status}:`, responseData);
        const error: any = new Error(responseData.message || 'Erro na requisição');
        error.status = response.status;
        error.body = responseData;
        throw error;
      }

      console.log(`✅ [API_SERVICE] POST ${endpoint} sucesso`);
      return responseData;
    } catch (error) {
      console.error(`❌ [API_SERVICE] Erro em POST ${endpoint}:`, error);
      throw error;
    }
  }
  
  async get<T>(endpoint: string): Promise<T> {
    console.log(`📥 [API_SERVICE] GET ${endpoint}`);

    try {
      const response = await fetchWithAuth(endpoint);

      // Ler texto da resposta primeiro para debug
      const responseText = await response.text();
      console.log(`📝 [API_SERVICE] Resposta bruta (${response.status}):`, responseText.substring(0, 200) + '...');

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ [API_SERVICE] Erro ao parsear JSON da resposta:', parseError);
        console.log('📝 [API_SERVICE] Resposta completa:', responseText);
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        console.log(`❌ [API_SERVICE] Erro HTTP ${response.status}:`, responseData);
        const error: any = new Error(responseData.message || 'Erro na requisição');
        error.status = response.status;
        error.body = responseData;
        throw error;
      }

      console.log(`✅ [API_SERVICE] GET ${endpoint} sucesso`);
      return responseData;
    } catch (error) {
      console.error(`❌ [API_SERVICE] Erro em GET ${endpoint}:`, error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    console.log(`🔄 [API_SERVICE] PUT ${endpoint}:`, {
      hasData: !!data,
      dataType: typeof data,
      dataKeys: data && typeof data === 'object' ? Object.keys(data) : 'N/A'
    });

    try {
      const response = await fetchWithAuth(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      const responseText = await response.text();
      console.log(`📝 [API_SERVICE] Resposta bruta (${response.status}):`, responseText.substring(0, 200) + '...');

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ [API_SERVICE] Erro ao parsear JSON da resposta:', parseError);
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        console.log(`❌ [API_SERVICE] Erro HTTP ${response.status}:`, responseData);
        const error: any = new Error(responseData.message || 'Erro na requisição');
        error.status = response.status;
        error.body = responseData;
        throw error;
      }

      console.log(`✅ [API_SERVICE] PUT ${endpoint} sucesso`);
      return responseData;
    } catch (error) {
      console.error(`❌ [API_SERVICE] Erro em PUT ${endpoint}:`, error);
      throw error;
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    console.log(`🗑️ [API_SERVICE] DELETE ${endpoint}`);

    try {
      const response = await fetchWithAuth(endpoint, {
        method: 'DELETE',
      });

      const responseText = await response.text();
      console.log(`📝 [API_SERVICE] Resposta bruta (${response.status}):`, responseText.substring(0, 200) + '...');

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ [API_SERVICE] Erro ao parsear JSON da resposta:', parseError);
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        console.log(`❌ [API_SERVICE] Erro HTTP ${response.status}:`, responseData);
        const error: any = new Error(responseData.message || 'Erro na requisição');
        error.status = response.status;
        error.body = responseData;
        throw error;
      }

      console.log(`✅ [API_SERVICE] DELETE ${endpoint} sucesso`);
      return responseData;
    } catch (error) {
      console.error(`❌ [API_SERVICE] Erro em DELETE ${endpoint}:`, error);
      throw error;
    }
  }
}

export const apiService = new ApiService();