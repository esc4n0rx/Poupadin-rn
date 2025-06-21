// services/profileService.ts (corrigido)
import { AvatarUploadResponse, PasswordChangePayload, ProfileResponse, UpdateProfilePayload } from '@/types/profile';
import { apiService } from './apiService';

class ProfileService {
  /**
   * Busca o perfil do usuário atual
   */
  async getProfile(): Promise<ProfileResponse> {
    return apiService.get<ProfileResponse>('/profile');
  }

  /**
   * Atualiza informações do perfil
   */
  async updateProfile(data: UpdateProfilePayload): Promise<ProfileResponse> {
    // ✅ CORREÇÃO: Usar PUT em vez de POST e ajustar payload
    const response = await fetch(`${this.getBaseUrl()}/api/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${await this.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Erro ao atualizar perfil');
    }
    
    return responseData;
  }

  /**
   * Faz upload do avatar
   */
  async uploadAvatar(imageUri: string): Promise<AvatarUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      const response = await fetch(`${this.getBaseUrl()}/api/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAccessToken()}`,
          // ✅ CORREÇÃO: Não definir Content-Type para FormData
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer upload do avatar');
      }
      return data;
    } catch (error) {
      console.error('Erro no upload do avatar:', error);
      throw error;
    }
  }

  /**
   * Remove o avatar
   */
  async removeAvatar(): Promise<{ message: string }> {
    const response = await fetch(`${this.getBaseUrl()}/api/profile/avatar`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${await this.getAccessToken()}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao remover avatar');
    }
    return data;
  }

  /**
   * Altera a senha do usuário
   */
  async changePassword(data: PasswordChangePayload): Promise<{ message: string; success: boolean; logoutRequired: boolean }> {
    const response = await fetch(`${this.getBaseUrl()}/api/profile/reset-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await this.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Erro ao alterar senha');
    }
    
    return responseData;
  }

  private getBaseUrl(): string {
    return 'https://api.poupadin.space';
  }

  private async getAccessToken(): Promise<string> {
    const { tokenService } = await import('./tokenService');
    return await tokenService.getAccessToken() || '';
  }
}

export const profileService = new ProfileService();