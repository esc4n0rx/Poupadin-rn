// app/(tabs)/profile.tsx
import { CustomStatusBar } from '@/components/CustomStatusBar';
import { AboutModal } from '@/components/profile/AboutModal';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileMenuItem } from '@/components/profile/ProfileMenuItem';
import { SecurityModal } from '@/components/profile/SecurityModal';
import { SettingsModal } from '@/components/profile/SettingsModal';
import { COLORS, SIZES } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { PasswordChangePayload, UpdateProfilePayload } from '@/types/profile';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ModalType = 'edit' | 'security' | 'settings' | 'about' | null;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();
  const {
    profile,
    isLoading,
    isUpdating,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    changePassword,
    fetchProfile,
  } = useProfile();

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleEditProfile = async (data: UpdateProfilePayload): Promise<boolean> => {
    return await updateProfile(data);
  };

  const handleChangePassword = async (data: PasswordChangePayload): Promise<boolean> => {
    const success = await changePassword(data);
    if (success) {
      // A API retorna logoutRequired: true, então fazemos logout
      Alert.alert(
        'Senha Alterada',
        'Sua senha foi alterada com sucesso. Você será desconectado e precisará fazer login novamente.',
        [
          {
            text: 'OK',
            onPress: () => logout(),
          },
        ]
      );
    }
    return success;
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  if (isLoading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <ProfileHeader
          profile={profile}
          onUploadAvatar={uploadAvatar}
          onRemoveAvatar={removeAvatar}
          isUpdating={isUpdating}
        />
      </View>

      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchProfile}
              tintColor={COLORS.primary}
            />
          }
        >
          <Animated.View entering={FadeInUp.duration(600).delay(300)}>
            <ProfileMenuItem
              icon="person-outline"
              title="Editar Perfil"
              subtitle="Altere suas informações pessoais"
              onPress={() => setActiveModal('edit')}
            />

            <ProfileMenuItem
              icon="shield-checkmark-outline"
              title="Segurança"
              subtitle="Alterar senha e configurações de segurança"
              onPress={() => setActiveModal('security')}
              iconColor={COLORS.primaryDark}
            />

            <ProfileMenuItem
              icon="settings-outline"
              title="Configurações"
              subtitle="Ajustes de tema, notificações e preferências"
              onPress={() => setActiveModal('settings')}
              iconColor={COLORS.gray}
            />

            <ProfileMenuItem
              icon="information-circle-outline"
              title="Sobre"
              subtitle="Informações do app e suporte"
              onPress={() => setActiveModal('about')}
              iconColor={COLORS.textLight}
            />

            <ProfileMenuItem
              icon="log-out-outline"
              title="Sair"
              subtitle="Desconectar da sua conta"
              onPress={handleLogout}
              iconColor={COLORS.error}
              isDestructive
            />
          </Animated.View>
        </ScrollView>
      </View>

      {/* Modais */}
      <EditProfileModal
        visible={activeModal === 'edit'}
        profile={profile}
        onClose={closeModal}
        onSubmit={handleEditProfile}
        isLoading={isUpdating}
      />

      <SecurityModal
        visible={activeModal === 'security'}
        onClose={closeModal}
        onChangePassword={handleChangePassword}
        isLoading={isUpdating}
      />

      <SettingsModal
        visible={activeModal === 'settings'}
        onClose={closeModal}
      />

      <AboutModal
        visible={activeModal === 'about'}
        onClose={closeModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingBottom: 30,
    borderBottomLeftRadius: SIZES.radiusLarge,
    borderBottomRightRadius: SIZES.radiusLarge,
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: 30,
    paddingBottom: 120, // Espaço para a TabBar flutuante
  },
});