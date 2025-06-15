// app/(tabs)/index.tsx
import { CustomStatusBar } from '@/components/CustomStatusBar';
import { ThemedText } from '@/components/ThemedText';
import { COLORS, SIZES } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user, logout, setupStatus } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  // Se o setup não foi completado, redirecionar
  if (setupStatus && !setupStatus.setup_completed) {
    router.replace('/budget-setup');
    return null;
  }

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
        <View style={styles.constructionContainer}>
          <Text style={styles.constructionEmoji}>🚧</Text>
          <ThemedText style={styles.constructionTitle}>
            App em Construção
          </ThemedText>
          <ThemedText style={styles.constructionDescription}>
            Parabéns! Você completou o setup inicial do seu orçamento. 
            Estamos trabalhando duro para trazer novas funcionalidades em breve!
          </ThemedText>
          
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonTitle}>Em breve:</Text>
            <Text style={styles.comingSoonItem}>💰 Dashboard financeiro</Text>
            <Text style={styles.comingSoonItem}>📊 Relatórios detalhados</Text>
            <Text style={styles.comingSoonItem}>🎯 Metas de economia</Text>
            <Text style={styles.comingSoonItem}>📱 Notificações inteligentes</Text>
          </View>
        </View>
        
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
  constructionContainer: {
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: SIZES.radiusLarge,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  constructionEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  constructionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  constructionDescription: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  comingSoonContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  comingSoonTitle: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  comingSoonItem: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
    marginBottom: 8,
    lineHeight: 20,
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