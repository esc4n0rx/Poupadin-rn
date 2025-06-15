import { CodeInput } from '@/components/CodeInput';
import { CustomButton } from '@/components/CustomButton';
import { CustomStatusBar } from '@/components/CustomStatusBar';
import { COLORS, SIZES } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
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

export default function ResetCodeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyResetCode, forgotPassword, isLoading } = useAuth();
  
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setError('');
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('Código deve ter 6 dígitos');
      return;
    }

    try {
      await verifyResetCode(email!, code);
      router.push({
        pathname: './new-password',
        params: { email: email!, code: code }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Código inválido');
    }
  };

  const handleResendCode = async () => {
    try {
      await forgotPassword(email!);
      Alert.alert('Sucesso', 'Novo código enviado para seu email');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao reenviar código');
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
        <Text style={styles.headerTitle}>Código de Verificação</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Digite o Código</Text>
            <Text style={styles.infoText}>
              Enviamos um código de 6 dígitos para {email}. Digite o código abaixo para continuar.
            </Text>
          </View>

          <CodeInput
            length={6}
            onCodeChange={handleCodeChange}
            error={error}
          />

          <CustomButton
            title="Verificar Código"
            onPress={handleVerifyCode}
            loading={isLoading}
            disabled={code.length !== 6}
            style={styles.verifyButton}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Não recebeu o código? </Text>
            <TouchableOpacity onPress={handleResendCode}>
              <Text style={styles.resendLink}>Reenviar</Text>
            </TouchableOpacity>
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
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  verifyButton: {
    marginBottom: 30,
    marginTop: 20,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
  },
  resendLink: {
    fontSize: SIZES.body3,
    color: COLORS.primary,
    fontWeight: '600',
  },
});