import { CustomButton } from '@/components/CustomButton';
import { COLORS, SIZES } from '@/constants/Theme';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('./login');
  };

  const handleSignUp = () => {
    router.push('./register');
  };

  const handleForgotPassword = () => {
    // Implementar lógica de esqueci minha senha
    console.log('Esqueci minha senha');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* Logo e Título */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <View style={styles.chartBar1} />
            <View style={styles.chartBar2} />
            <View style={styles.chartBar3} />
            <View style={styles.chartArrow} />
          </View>
          
          <Text style={styles.title}>Poupadin</Text>
          <Text style={styles.subtitle}>
            Gerencie suas finanças de forma simples e inteligente.
          </Text>
        </View>

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Entrar"
            onPress={handleLogin}
            variant="primary"
            style={styles.loginButton}
          />
          
          <CustomButton
            title="Criar Conta"
            onPress={handleSignUp}
            variant="secondary"
            style={styles.signUpButton}
          />
          
          <CustomButton
            title="Esqueci minha senha?"
            onPress={handleForgotPassword}
            variant="outline"
            style={styles.forgotButton}
            textStyle={styles.forgotButtonText}
          />
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
  content: {
    flex: 1,
    paddingHorizontal: SIZES.paddingHorizontal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    position: 'relative',
  },
  chartBar1: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    width: 12,
    height: 30,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  chartBar2: {
    position: 'absolute',
    bottom: 0,
    left: 30,
    width: 12,
    height: 45,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  chartBar3: {
    position: 'absolute',
    bottom: 0,
    left: 50,
    width: 12,
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  chartArrow: {
    position: 'absolute',
    top: 10,
    right: 5,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.primary,
    transform: [{ rotate: '45deg' }],
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  loginButton: {
    marginBottom: 16,
  },
  signUpButton: {
    marginBottom: 16,
  },
  forgotButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  forgotButtonText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
  },
});