import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { CustomStatusBar } from '@/components/CustomStatusBar';
import { COLORS, SIZES } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { useFormValidation } from '@/hooks/useFormValidation';
import { ForgotPasswordFormData } from '@/types/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { forgotPassword, isLoading } = useAuth();
  const { errors, validateForgotPasswordForm, clearErrors } = useFormValidation();
  
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });

  const handleInputChange = (value: string) => {
    setFormData({ email: value });
    clearErrors();
  };

  const handleSubmit = async () => {
    if (!validateForgotPasswordForm(formData)) {
      return;
    }

    try {
      await forgotPassword(formData.email);
      // Navegar para tela de código com o email
      router.push({
        pathname: './reset-code',
        params: { email: formData.email }
      });
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSignUp = () => {
    router.push('./register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Esqueci Minha Senha</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Redefinir Senha?</Text>
            <Text style={styles.infoText}>
              Digite seu endereço de email e enviaremos um código de verificação para redefinir sua senha.
            </Text>
          </View>

          <CustomInput
            label="Digite seu Email"
            placeholder="exemplo@exemplo.com"
            value={formData.email}
            onChangeText={handleInputChange}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <CustomButton
            title="Próximo Passo"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.submitButton}
          />

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpTitle}>Criar Conta</Text>
            <Text style={styles.signUpSubtitle}>ou criar conta com</Text>
            
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.signUpTextContainer}>
              <Text style={styles.signUpTextGray}>Não tem uma conta? </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.signUpTextLink}>Criar Conta</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 40,
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
  submitButton: {
    marginBottom: 40,
    marginTop: 20,
  },
  signUpContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  signUpSubtitle: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  signUpTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpTextGray: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
  },
  signUpTextLink: {
    fontSize: SIZES.body3,
    color: COLORS.primary,
    fontWeight: '600',
  },
});