import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { CustomStatusBar } from '@/components/CustomStatusBar';
import { COLORS, SIZES } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { useFormValidation } from '@/hooks/useFormValidation';
import { ResetPasswordFormData } from '@/types/auth';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NewPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const { resetPassword, isLoading } = useAuth();
  const { errors, validateResetPasswordForm, clearErrors } = useFormValidation();
  
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    code: code || '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: keyof ResetPasswordFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    clearErrors();
  };

  const handleResetPassword = async () => {
    if (!validateResetPasswordForm(formData)) {
      return;
    }

    try {
      await resetPassword(email!, code!, formData.newPassword);
      Alert.alert(
        'Sucesso!', 
        'Sua senha foi alterada com sucesso. Faça login com sua nova senha.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(auth)/login')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro ao alterar senha');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Senha</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Definir Nova Senha</Text>
            <Text style={styles.infoText}>
              Crie uma nova senha segura para sua conta. Certifique-se de usar uma combinação de letras, números e símbolos.
            </Text>
          </View>

          <CustomInput
            label="Nova Senha"
            placeholder="••••••••"
            value={formData.newPassword}
            onChangeText={(value) => handleInputChange('newPassword', value)}
            error={errors.newPassword}
            isPassword
            autoComplete="new-password"
          />

          <CustomInput
            label="Confirmar Nova Senha"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            error={errors.confirmPassword}
            isPassword
            autoComplete="new-password"
          />

          <CustomButton
            title="Alterar Senha"
            onPress={handleResetPassword}
            loading={isLoading}
            style={styles.resetButton}
          />

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Dicas para uma senha segura:</Text>
            <Text style={styles.tipText}>• Use pelo menos 8 caracteres</Text>
            <Text style={styles.tipText}>• Combine letras, números e símbolos</Text>
            <Text style={styles.tipText}>• Evite informações pessoais</Text>
            <Text style={styles.tipText}>• Use uma senha única para esta conta</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 30,
    paddingHorizontal: SIZES.paddingHorizontal,
    borderBottomLeftRadius: SIZES.radiusLarge,
    borderBottomRightRadius: SIZES.radiusLarge,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: -20,
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingTop: 30,
  },
  form: {
    flex: 1,
  },
  infoContainer: {
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  resetButton: {
    marginBottom: 30,
    marginTop: 10,
  },
  tipsContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: SIZES.radius,
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
});