// components/profile/EditProfileModal.tsx (corrigido)
import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { COLORS, SIZES } from '@/constants/Theme';
import { UpdateProfilePayload, UserProfile } from '@/types/profile';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface EditProfileModalProps {
  visible: boolean;
  profile: UserProfile | null;
  onClose: () => void;
  onSubmit: (data: UpdateProfilePayload) => Promise<boolean>;
  isLoading?: boolean;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  profile,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<UpdateProfilePayload>({
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || '',
    phone: profile?.phone || '',
    privacy_settings: {
      profile_visible: profile?.privacy_settings?.profile_visible ?? true,
      email_visible: profile?.privacy_settings?.email_visible ?? false,
      phone_visible: profile?.privacy_settings?.phone_visible ?? false,
    },
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (formData.website && formData.website.trim() && !isValidUrl(formData.website)) {
      newErrors.website = 'URL inválida';
    }

    if (formData.phone && formData.phone.trim() && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Telefone inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('http://') || url.startsWith('https://');
    }
  };

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // ✅ CORREÇÃO: Limpar campos vazios antes de enviar
    const cleanedData: UpdateProfilePayload = {
      bio: formData.bio?.trim() || '',
      location: formData.location?.trim() || '',
      website: formData.website?.trim() || '',
      phone: formData.phone?.trim() || '',
      privacy_settings: formData.privacy_settings,
    };

    const success = await onSubmit(cleanedData);
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || '',
      phone: profile?.phone || '',
      privacy_settings: {
        profile_visible: profile?.privacy_settings?.profile_visible ?? true,
        email_visible: profile?.privacy_settings?.email_visible ?? false,
        phone_visible: profile?.privacy_settings?.phone_visible ?? false,
      },
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Editar Perfil</Text>
          <View style={styles.closeButton} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <CustomInput
              label="Bio"
              placeholder="Conte um pouco sobre você..."
              value={formData.bio}
              onChangeText={(value) => setFormData(prev => ({ ...prev, bio: value }))}
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' }}
              maxLength={500}
            />

            <CustomInput
              label="Localização"
              placeholder="São Paulo, SP - Brasil"
              value={formData.location}
              onChangeText={(value) => setFormData(prev => ({ ...prev, location: value }))}
              leftIcon="location-outline"
            />

            <CustomInput
              label="Website"
              placeholder="https://seusite.com"
              value={formData.website}
              onChangeText={(value) => {
                setFormData(prev => ({ ...prev, website: value }));
                if (errors.website) setErrors(prev => ({ ...prev, website: '' }));
              }}
              error={errors.website}
              leftIcon="globe-outline"
              keyboardType="url"
              autoCapitalize="none"
            />

            <CustomInput
              label="Telefone"
              placeholder="+55 11 99999-9999"
              value={formData.phone}
              onChangeText={(value) => {
                setFormData(prev => ({ ...prev, phone: value }));
                if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
              }}
              error={errors.phone}
              leftIcon="call-outline"
              keyboardType="phone-pad"
            />

            <View style={styles.privacySection}>
              <Text style={styles.sectionTitle}>Configurações de Privacidade</Text>
              
              <View style={styles.privacyItem}>
                <View style={styles.privacyInfo}>
                  <Text style={styles.privacyLabel}>Perfil Público</Text>
                  <Text style={styles.privacyDescription}>
                    Permitir que outros usuários vejam seu perfil
                  </Text>
                </View>
                <Switch
                  value={formData.privacy_settings?.profile_visible}
                  onValueChange={(value) =>
                    setFormData(prev => ({
                      ...prev,
                      privacy_settings: { ...prev.privacy_settings!, profile_visible: value }
                    }))
                  }
                  trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>

              <View style={styles.privacyItem}>
                <View style={styles.privacyInfo}>
                  <Text style={styles.privacyLabel}>Email Visível</Text>
                  <Text style={styles.privacyDescription}>
                    Mostrar seu email no perfil público
                  </Text>
                </View>
                <Switch
                  value={formData.privacy_settings?.email_visible}
                  onValueChange={(value) =>
                    setFormData(prev => ({
                      ...prev,
                      privacy_settings: { ...prev.privacy_settings!, email_visible: value }
                    }))
                  }
                  trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>

              <View style={styles.privacyItem}>
                <View style={styles.privacyInfo}>
                  <Text style={styles.privacyLabel}>Telefone Visível</Text>
                  <Text style={styles.privacyDescription}>
                    Mostrar seu telefone no perfil público
                  </Text>
                </View>
                <Switch
                  value={formData.privacy_settings?.phone_visible}
                  onValueChange={(value) =>
                    setFormData(prev => ({
                      ...prev,
                      privacy_settings: { ...prev.privacy_settings!, phone_visible: value }
                    }))
                  }
                  trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>
            </View>

            {/* ✅ CORREÇÃO: Espaçamento extra para evitar sobreposição */}
            <View style={styles.bottomSpacing} />
          </ScrollView>

          {/* ✅ CORREÇÃO: Footer fixo com posicionamento adequado */}
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.buttonContainer}>
              <CustomButton
                title="Cancelar"
                onPress={handleClose}
                variant="outline"
                style={styles.cancelButton}
              />
              <CustomButton
                title="Salvar"
                onPress={handleSubmit}
                loading={isLoading}
                style={styles.submitButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  title: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  privacySection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  privacyInfo: {
    flex: 1,
    marginRight: 16,
  },
  privacyLabel: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  privacyDescription: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    marginTop: 2,
  },
  bottomSpacing: {
    height: 100,
  },
  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
    minHeight: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});