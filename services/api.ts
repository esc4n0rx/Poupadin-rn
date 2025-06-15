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
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
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
    return this.request<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return this.request<ForgotPasswordResponse>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyResetCode(code: string): Promise<VerifyResetCodeResponse> {
    return this.request<VerifyResetCodeResponse>('/api/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async resetPassword(
    code: string,
    password: string
  ): Promise<ResetPasswordResponse> {
    return this.request<ResetPasswordResponse>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ code, password }),
    });
  }
}

export const apiService = new ApiService();