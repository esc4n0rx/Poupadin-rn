// services/api.ts
const BASE_URL = 'https://api.poupadin.space';

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  errors?: string[];
  code?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    initial_setup_completed: boolean;
  };
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    date_of_birth: string;
    created_at: string;
  };
}

export interface ForgotPasswordResponse {
  message: string;
  instruction: string;
}

export interface VerifyResetCodeResponse {
  message: string;
  valid: boolean;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

class ApiService {
  private baseUrl = BASE_URL;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`🌐 [API_SERVICE] Iniciando requisição para: ${url}`);
    console.log(`📋 [API_SERVICE] Método: ${options.method || 'GET'}`);
    console.log(`📤 [API_SERVICE] Headers:`, options.headers);
    console.log(`📤 [API_SERVICE] Body:`, options.body);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`⏳ [API_SERVICE] Enviando requisição...`);
      const response = await fetch(url, config);
      
      console.log(`📨 [API_SERVICE] Resposta recebida:`);
      console.log(`📊 [API_SERVICE] Status: ${response.status} ${response.statusText}`);
      console.log(`📊 [API_SERVICE] Headers da resposta:`, Object.fromEntries(response.headers.entries()));
      console.log(`📊 [API_SERVICE] response.ok: ${response.ok}`);
      
      // Ler o texto da resposta primeiro para poder fazer log
      const responseText = await response.text();
      console.log(`📝 [API_SERVICE] Texto bruto da resposta:`, responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log(`📋 [API_SERVICE] Dados parseados:`, JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log(`❌ [API_SERVICE] Erro ao parsear JSON:`, parseError);
        console.log(`📝 [API_SERVICE] Resposta não é JSON válido:`, responseText);
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        console.log(`❌ [API_SERVICE] Resposta não OK. Status: ${response.status}`);
        console.log(`❌ [API_SERVICE] Dados do erro:`, data);
        
        // Extrair mensagem de erro mais específica
        let errorMessage = 'Erro na requisição';
        
        if (data.message) {
          errorMessage = data.message;
        } else if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.join(', ');
        } else if (data.error) {
          errorMessage = data.error;
        }
        
        console.log(`📝 [API_SERVICE] Mensagem de erro extraída: "${errorMessage}"`);
        throw new Error(errorMessage);
      }

      console.log(`✅ [API_SERVICE] Requisição bem-sucedida!`);
      return data;
    } catch (error) {
      console.log(`💥 [API_SERVICE] Erro capturado:`, error);
      console.log(`📋 [API_SERVICE] Tipo do erro:`, typeof error);
      console.log(`🔍 [API_SERVICE] Propriedades do erro:`, Object.keys(error || {}));
      
      if (error instanceof Error) {
        console.log(`📝 [API_SERVICE] Mensagem do erro:`, error.message);
        console.log(`📚 [API_SERVICE] Stack trace:`, error.stack);
        throw error;
      }
      
      console.log(`❌ [API_SERVICE] Erro desconhecido, criando novo Error`);
      throw new Error('Erro de conexão');
    }
  }

  // Auth endpoints
  async register(userData: {
    name: string;
    email: string;
    password: string;
    date_of_birth: string;
  }): Promise<RegisterResponse> {
    console.log(`📋 [API_SERVICE] register() chamado com:`, JSON.stringify(userData, null, 2));
    
    try {
      const result = await this.request<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      console.log(`✅ [API_SERVICE] register() retornando:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.log(`💥 [API_SERVICE] register() erro:`, error);
      throw error;
    }
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<LoginResponse> {
    console.log(`📋 [API_SERVICE] login() chamado com:`, JSON.stringify(credentials, null, 2));
    
    try {
      const result = await this.request<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      console.log(`✅ [API_SERVICE] login() retornando:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.log(`💥 [API_SERVICE] login() erro:`, error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    console.log(`📋 [API_SERVICE] forgotPassword() chamado com email: ${email}`);
    
    try {
      const result = await this.request<ForgotPasswordResponse>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      console.log(`✅ [API_SERVICE] forgotPassword() retornando:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.log(`💥 [API_SERVICE] forgotPassword() erro:`, error);
      throw error;
    }
  }

  async verifyResetCode(code: string): Promise<VerifyResetCodeResponse> {
    console.log(`📋 [API_SERVICE] verifyResetCode() chamado com code: ${code}`);
    
    try {
      const result = await this.request<VerifyResetCodeResponse>('/api/auth/verify-reset-code', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      
      console.log(`✅ [API_SERVICE] verifyResetCode() retornando:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.log(`💥 [API_SERVICE] verifyResetCode() erro:`, error);
      throw error;
    }
  }

  async resetPassword(
    code: string,
    password: string
  ): Promise<ResetPasswordResponse> {
    console.log(`📋 [API_SERVICE] resetPassword() chamado com code: ${code}`);
    
    try {
      const result = await this.request<ResetPasswordResponse>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ code, password }),
      });
      
      console.log(`✅ [API_SERVICE] resetPassword() retornando:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.log(`💥 [API_SERVICE] resetPassword() erro:`, error);
      throw error;
    }
  }
}

export const apiService = new ApiService();