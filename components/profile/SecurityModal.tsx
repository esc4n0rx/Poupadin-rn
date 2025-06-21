// components/profile/SecurityModal.tsx (corrigido)
import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { COLORS, SIZES } from '@/constants/Theme';
import { PasswordChangePayload } from '@/types/profile';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SecurityModalProps {
  visible: boolean;
  onClose: () => void;
  onChangePassword: (data: PasswordChangePayload) => Promise<boolean>;
  isLoading?: boolean;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  visible,
  onClose,
  onChangePassword,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<PasswordChangePayload>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.current_password) {
      newErrors.current_password = 'Senha atual é obrigatória';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'Nova senha é obrigatória';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Nova senha deve ter pelo menos 8 caracteres';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Confirmação de senha é obrigatória';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Senhas não coincidem';
    }

    if (formData.current_password === formData.new_password) {
      newErrors.new_password = 'A nova senha deve ser diferente da atual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const success = await onChangePassword(formData);
    if (success) {
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      current_password: '',
      new_password: '',
      confirm_password: '',
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
          <Text style={styles.title}>Segurança</Text>
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
            <View style={styles.infoContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.infoTitle}>Alterar Senha</Text>
              <Text style={styles.infoText}>
                Para sua segurança, digite sua senha atual e escolha uma nova senha forte.
              </Text>
            </View>

            <CustomInput
              label="Senha Atual"
              placeholder="Digite sua senha atual"
              value={formData.current_password}
              onChangeText={(value) => {
                setFormData(prev => ({ ...prev, current_password: value }));
                if (errors.current_password) setErrors(prev => ({ ...prev, current_password: '' }));
              }}
              error={errors.current_password}
              isPassword
              autoComplete="current-password"
            />

            <CustomInput
              label="Nova Senha"
              placeholder="Digite sua nova senha"
              value={formData.new_password}
              onChangeText={(value) => {
                setFormData(prev => ({ ...prev, new_password: value }));
                if (errors.new_password) setErrors(prev => ({ ...prev, new_password: '' }));
              }}
              error={errors.new_password}
              isPassword
              autoComplete="new-password"
            />

            <CustomInput
              label="Confirmar Nova Senha"
              placeholder="Digite novamente sua nova senha"
              value={formData.confirm_password}
              onChangeText={(value) => {
                setFormData(prev => ({ ...prev, confirm_password: value }));
                if (errors.confirm_password) setErrors(prev => ({ ...prev, confirm_password: '' }));
              }}
              error={errors.confirm_password}
              isPassword
              autoComplete="new-password"
            />

            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Dicas para uma senha segura:</Text>
              <Text style={styles.tipText}>• Use pelo menos 8 caracteres</Text>
              <Text style={styles.tipText}>• Combine letras maiúsculas e minúsculas</Text>
              <Text style={styles.tipText}>• Inclua números e símbolos</Text>
              <Text style={styles.tipText}>• Evite informações pessoais</Text>
              <Text style={styles.tipText}>• Use uma senha única para esta conta</Text>
            </View>

            {/* ✅ CORREÇÃO: Espaçamento extra */}
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
                title="Alterar Senha"
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
  // ✅ CORREÇÃO: Novo container para KeyboardAvoidingView
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  tipsContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: SIZES.radius,
    marginTop: 20,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  tipText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    marginBottom: 4,
    lineHeight: 18,
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