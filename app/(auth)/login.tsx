import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { CustomStatusBar } from '@/components/CustomStatusBar';
import { COLORS, SIZES } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { useFormValidation } from '@/hooks/useFormValidation';
import { LoginFormData } from '@/types/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { errors, validateLoginForm, clearErrors } = useFormValidation();
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    clearErrors();
  };

  const handleLogin = async () => {
    if (!validateLoginForm(formData)) {
      return;
    }

    try {
      await login(formData);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const handleForgotPassword = () => {
    router.push('./forgot-password');
  };

  const handleSignUp = () => {
    router.push('/(auth)/register');
  };

  const handleBiometricLogin = () => {
    Alert.alert('Biometria', 'Funcionalidade será implementada em breve');
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Login Social', `Login com ${provider} será implementado em breve`);
  };

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Bem-vindo</Text>
      </View>

      <View style={styles.content}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.form}>
            <CustomInput
              label="Nome de usuário ou Email"
              placeholder="exemplo@exemplo.com"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <CustomInput
              label="Senha"
              placeholder="••••••••"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              error={errors.password}
              isPassword
              autoComplete="password"
            />

            <CustomButton
              title="Entrar"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueci minha senha?</Text>
            </TouchableOpacity>

            <CustomButton
              title="Criar Conta"
              onPress={handleSignUp}
              variant="secondary"
              style={styles.signUpButton}
            />

            <TouchableOpacity 
              style={styles.biometricContainer}
              onPress={handleBiometricLogin}
            >
              <Text style={styles.biometricText}>
                Use <Text style={styles.biometricLink}>Biometria</Text> para acessar
              </Text>
            </TouchableOpacity>

            <Text style={styles.socialText}>ou entre com</Text>
            
            <View style={styles.socialContainer}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => handleSocialLogin('Facebook')}
              >
                <Ionicons name="logo-facebook" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => handleSocialLogin('Google')}
              >
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
        </ScrollView>
      </View>
    </View>
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
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: -20,
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
  },
  scrollContent: {
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingTop: 30,
    paddingBottom: 30,
  },
  form: {
    flex: 1,
  },
  loginButton: {
    marginBottom: 20,
    marginTop: 10,
  },
  forgotPasswordText: {
    fontSize: SIZES.body3,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
  },
  signUpButton: {
    marginBottom: 20,
  },
  biometricContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  biometricText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
  },
  biometricLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  socialText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
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