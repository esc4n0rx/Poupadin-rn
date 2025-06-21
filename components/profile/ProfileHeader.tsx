// components/profile/ProfileHeader.tsx
import { COLORS, SIZES } from '@/constants/Theme';
import { UserProfile } from '@/types/profile';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  onUploadAvatar: (imageUri: string) => Promise<boolean>;
  onRemoveAvatar: () => Promise<boolean>;
  isUpdating: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onUploadAvatar,
  onRemoveAvatar,
  isUpdating,
}) => {
  const handleAvatarPress = () => {
    Alert.alert(
      'Avatar',
      'O que deseja fazer?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Escolher Foto', onPress: handleImagePicker },
        ...(profile?.avatar_url ? [{ text: 'Remover Avatar', style: 'destructive' as 'destructive', onPress: onRemoveAvatar }] : []),
      ]
    );
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permissão necessária', 'É necessário permitir acesso à galeria para selecionar uma foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        await onUploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Erro ao selecionar imagem. Tente novamente.');
    }
  };

  const getAvatarSource = () => {
    if (profile?.avatar_urls?.medium) {
      return { uri: profile.avatar_urls.medium };
    }
    if (profile?.avatar_url) {
      return { uri: profile.avatar_url };
    }
    return null;
  };

  return (
    <Animated.View style={styles.container} entering={FadeInUp.duration(600)}>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={handleAvatarPress}
        disabled={isUpdating}
        activeOpacity={0.8}
      >
        {getAvatarSource() ? (
          <Image source={getAvatarSource()!} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={60} color={COLORS.grayDark} />
          </View>
        )}
        <View style={styles.avatarOverlay}>
          <Ionicons name="camera" size={20} color={COLORS.white} />
        </View>
      </TouchableOpacity>

      <Animated.View style={styles.userInfo} entering={FadeInDown.duration(600).delay(200)}>
        <Text style={styles.userName}>{profile?.name || 'Carregando...'}</Text>
        <Text style={styles.userId}>ID: {profile?.user_id?.slice(-8) || '--------'}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.grayLight,
    borderWidth: 4,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userId: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
  },
});