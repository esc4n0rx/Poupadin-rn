import { CustomStatusBar } from '@/components/CustomStatusBar';
import { ThemedText } from '@/components/ThemedText';
import { COLORS, SIZES } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <ThemedText type="title" style={styles.welcomeText}>
          Olá, {user?.fullName || 'Usuário'}! 👋
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Bem-vindo ao Poupadin
        </ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.description}>
          Seu app de gerenciamento financeiro está pronto para uso!
        </ThemedText>
        
        <View style={styles.userInfo}>
          <ThemedText style={styles.infoLabel}>Email:</ThemedText>
          <ThemedText style={styles.infoValue}>{user?.email}</ThemedText>
          
          <ThemedText style={styles.infoLabel}>Telefone:</ThemedText>
          <ThemedText style={styles.infoValue}>{user?.mobileNumber}</ThemedText>
          
          <ThemedText style={styles.infoLabel}>Data de Nascimento:</ThemedText>
          <ThemedText style={styles.infoValue}>{user?.dateOfBirth}</ThemedText>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
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
    paddingVertical: 40,
    paddingHorizontal: SIZES.paddingHorizontal,
    borderBottomLeftRadius: SIZES.radiusLarge,
    borderBottomRightRadius: SIZES.radiusLarge,
  },
  welcomeText: {
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingTop: 30,
  },
  description: {
    textAlign: 'center',
    marginBottom: 40,
    fontSize: SIZES.body1,
    color: COLORS.textLight,
  },
  userInfo: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: SIZES.radius,
    marginBottom: 30,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    marginBottom: 4,
    marginTop: 12,
  },
  infoValue: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body1,
    fontWeight: '600',
  },
});