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
    fullName: '',
    email: '',
    mobileNumber: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
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
     router.replace('/(tabs)');
   } catch (error) {
     Alert.alert('Erro', error instanceof Error ? error.message : 'Erro desconhecido');
   }
 };

 const handleLogin = () => {
   router.push('./login');
 };

 const formatDateInput = (text: string) => {
   // Remove todos os caracteres não numéricos
   const numbers = text.replace(/\D/g, '');
   
   // Aplica a máscara DD/MM/AAAA
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

 const formatPhoneInput = (text: string) => {
   // Remove todos os caracteres não numéricos
   const numbers = text.replace(/\D/g, '');
   
   // Aplica a máscara +55 11 99999-9999
   if (numbers.length <= 2) {
     return `+${numbers}`;
   } else if (numbers.length <= 4) {
     return `+${numbers.slice(0, 2)} ${numbers.slice(2)}`;
   } else if (numbers.length <= 9) {
     return `+${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4)}`;
   } else {
     return `+${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 9)}-${numbers.slice(9, 13)}`;
   }
 };

 const handlePhoneChange = (value: string) => {
   const formattedPhone = formatPhoneInput(value);
   handleInputChange('mobileNumber', formattedPhone);
 };

 return (
   <SafeAreaView style={styles.container}>
     <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
     
     {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Criar Conta</Text>
      </View>

     {/* Content */}
     <View style={styles.content}>
       <ScrollView 
         showsVerticalScrollIndicator={false}
         keyboardShouldPersistTaps="handled"
       >
         <View style={styles.form}>
           <CustomInput
             label="Nome Completo"
             placeholder="João Silva"
             value={formData.fullName}
             onChangeText={(value) => handleInputChange('fullName', value)}
             error={errors.fullName}
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
             label="Número do Celular"
             placeholder="+55 11 99999-9999"
             value={formData.mobileNumber}
             onChangeText={handlePhoneChange}
             error={errors.mobileNumber}
             keyboardType="phone-pad"
             maxLength={18}
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

           {/* Terms and Privacy */}
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