// app/(auth)/register.tsx
import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { CustomStatusBar } from '@/components/CustomStatusBar';
import { COLORS, SIZES } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { useFormValidation } from '@/hooks/useFormValidation';
import { RegisterFormData } from '@/types/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, isLoading } = useAuth();
  const { errors, validateRegisterForm, clearErrors } = useFormValidation();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '', // Mudança: era fullName
    email: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '', // Opcional
  });

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    clearErrors();
  };

  const handleRegister = async () => {
    if (!validateRegisterForm(formData)) {
      return;
    }

    try {
      await register(formData);
      Alert.alert(
        'Sucesso!', 
        'Conta criada com sucesso. Faça login para continuar.',
        [
          {
            text: 'OK',
            onPress: () => router.push('./login')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const handleLogin = () => {
    router.push('./login');
  };

  const formatDateInput = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  const handleDateChange = (value: string) => {
    const formattedDate = formatDateInput(value);
    handleInputChange('dateOfBirth', formattedDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Criar Conta</Text>
      </View>

      <View style={styles.content}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <CustomInput
              label="Nome Completo"
              placeholder="João Silva"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              error={errors.name} // Mudança: era errors.fullName
              autoCapitalize="words"
              autoComplete="name"
            />

            <CustomInput
              label="Email"
              placeholder="exemplo@exemplo.com"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <CustomInput
              label="Telefone (Opcional)"
              placeholder="(11) 99999-9999"
              value={formData.mobileNumber || ''}
              onChangeText={(value) => handleInputChange('mobileNumber', value)}
              keyboardType="phone-pad"
            />

            <CustomInput
              label="Data de Nascimento"
              placeholder="DD/MM/AAAA"
              value={formData.dateOfBirth}
              onChangeText={handleDateChange}
              error={errors.dateOfBirth}
              keyboardType="numeric"
              maxLength={10}
            />

            <CustomInput
              label="Senha"
              placeholder="••••••••"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              error={errors.password}
              isPassword
              autoComplete="new-password"
            />

            <CustomInput
              label="Confirmar Senha"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              error={errors.confirmPassword}
              isPassword
              autoComplete="new-password"
            />

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                Ao continuar, você concorda com os{' '}
                <Text style={styles.termsLink}>Termos de Uso</Text> e{' '}
                <Text style={styles.termsLink}>Política de Privacidade</Text>.
              </Text>
            </View>

            <CustomButton
              title="Criar Conta"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
            />

            <View style={styles.loginTextContainer}>
              <Text style={styles.loginTextGray}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginTextLink}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
    paddingVertical: 40,
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
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingTop: 30,
  },
  form: {
    paddingBottom: 30,
  },
  termsContainer: {
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  termsText: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  registerButton: {
    marginBottom: 30,
  },
  loginTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginTextGray: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
  },
  loginTextLink: {
    fontSize: SIZES.body3,
    color: COLORS.primary,
    fontWeight: '600',
  },
});