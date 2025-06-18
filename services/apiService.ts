// services/apiService.ts
import { tokenService } from './tokenService';

const API_BASE_URL = 'https://api.poupadin.space/api';

// Armazena a promessa de renovação para evitar múltiplas chamadas simultâneas
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Função para renovar o token
const refreshToken = async (): Promise<string | null> => {
  const currentRefreshToken = await tokenService.getRefreshToken();
  if (!currentRefreshToken) {
    // Se não houver refresh token, força o logout
    // A lógica de logout será chamada no AuthContext que detectará a falha
    return null; 
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Sessão expirada');
    }

    // Armazena os novos tokens
    await tokenService.setAccessToken(data.accessToken);
    await tokenService.setRefreshToken(data.refreshToken);

    return data.accessToken;
  } catch (error) {
    console.error('Falha ao renovar o token:', error);
    // Em caso de falha na renovação, limpa os dados
    await tokenService.clearAllData();
    // Força a necessidade de um novo login
    return null;
  }
};

// Interceptor de API
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let accessToken = await tokenService.getAccessToken();

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

  // Se o token expirou (401), tenta renová-lo
  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken();
    }

    const newAccessToken = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (newAccessToken) {
      // Repete a chamada original com o novo token
      newOptions.headers = {
        ...newOptions.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };
      response = await fetch(`${API_BASE_URL}${url}`, newOptions);
    } else {
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
    const response = await fetchWithAuth(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    if (!response.ok) {
      const error: any = new Error(responseData.message || 'Erro na requisição');
      error.status = response.status;
      error.body = responseData;
      throw error;
    }
    return responseData;
  }
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetchWithAuth(endpoint);
    const responseData = await response.json();
    if (!response.ok) {
      const error: any = new Error(responseData.message || 'Erro na requisição');
      error.status = response.status;
      error.body = responseData;
      throw error;
    }
    return responseData;
  }
}

export const apiService = new ApiService();