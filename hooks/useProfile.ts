// hooks/useProfile.ts
import { profileService } from '@/services/profileService';
import { PasswordChangePayload, UpdateProfilePayload, UserProfile } from '@/types/profile';
import { getErrorMessage } from '@/utils/errorHandler';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await profileService.getProfile();
      setProfile(response.profile);
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível carregar o perfil.');
      setError(errorMessage);
      console.error('Erro ao buscar perfil:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfilePayload): Promise<boolean> => {
    try {
      setIsUpdating(true);
      const response = await profileService.updateProfile(data);
      setProfile(response.profile);
      Alert.alert('Sucesso!', 'Perfil atualizado com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível atualizar o perfil.');
      Alert.alert('Erro', errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const uploadAvatar = useCallback(async (imageUri: string): Promise<boolean> => {
    try {
      setIsUpdating(true);
      const response = await profileService.uploadAvatar(imageUri);
      
      if (profile) {
        setProfile({
          ...profile,
          avatar_url: response.avatar.avatar_url,
          avatar_urls: response.avatar.avatar_urls,
        });
      }
      
      Alert.alert('Sucesso!', 'Avatar atualizado com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível fazer upload do avatar.');
      Alert.alert('Erro', errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [profile]);

  const removeAvatar = useCallback(async (): Promise<boolean> => {
    try {
      setIsUpdating(true);
      await profileService.removeAvatar();
      
      if (profile) {
        setProfile({
          ...profile,
          avatar_url: null,
          avatar_urls: undefined,
        });
      }
      
      Alert.alert('Sucesso!', 'Avatar removido com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível remover o avatar.');
      Alert.alert('Erro', errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [profile]);

  const changePassword = useCallback(async (data: PasswordChangePayload): Promise<boolean> => {
    try {
      setIsUpdating(true);
      const response = await profileService.changePassword(data);
      Alert.alert('Sucesso!', response.message);
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Não foi possível alterar a senha.');
      Alert.alert('Erro', errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    isUpdating,
    error,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    changePassword,
  };
};