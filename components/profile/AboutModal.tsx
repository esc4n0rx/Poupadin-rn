import { CustomButton } from '@/components/CustomButton';
import { COLORS, SIZES } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o link');
    });
  };

  const handleContactSupport = () => {
    const email = 'suporte@poupadin.com';
    const subject = 'Suporte - Poupadin App';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert('Email', `Entre em contato: ${email}`);
    });
  };

  const handleRateApp = () => {
    Alert.alert(
      'Avaliar App',
      'Obrigado por usar o Poupadin! Sua avaliação é muito importante para nós.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Avaliar', onPress: () => {} },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Sobre</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <View style={styles.chartBar1} />
              <View style={styles.chartBar2} />
              <View style={styles.chartBar3} />
              <View style={styles.chartArrow} />
            </View>
            <Text style={styles.appName}>Poupadin</Text>
            <Text style={styles.appVersion}>Versão 1.0.0</Text>
            <Text style={styles.appDescription}>
              Seu companheiro para uma vida financeira mais organizada e próspera.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Funcionalidades</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
                <Text style={styles.featureText}>Controle de orçamento pessoal</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="flag-outline" size={20} color={COLORS.primary} />
                <Text style={styles.featureText}>Metas de economia personalizadas</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="analytics-outline" size={20} color={COLORS.primary} />
                <Text style={styles.featureText}>Relatórios e estatísticas detalhadas</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
                <Text style={styles.featureText}>Segurança e privacidade dos dados</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Equipe</Text>
            <Text style={styles.sectionText}>
              Desenvolvido com ❤️ por Paulo Oliveira dedicado a transformar a forma como você gerencia suas finanças.
            </Text>
          </View>

          {/* Links Úteis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔗 Links Úteis</Text>
            
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => handleLinkPress('https://poupadin.com/privacidade')}
            >
              <Ionicons name="shield-outline" size={20} color={COLORS.primary} />
              <Text style={styles.linkText}>Política de Privacidade</Text>
              <Ionicons name="open-outline" size={16} color={COLORS.grayDark} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => handleLinkPress('https://poupadin.com/termos')}
            >
              <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
              <Text style={styles.linkText}>Termos de Uso</Text>
              <Ionicons name="open-outline" size={16} color={COLORS.grayDark} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => handleLinkPress('https://poupadin.com/blog')}
            >
              <Ionicons name="library-outline" size={20} color={COLORS.primary} />
              <Text style={styles.linkText}>Blog - Dicas Financeiras</Text>
              <Ionicons name="open-outline" size={16} color={COLORS.grayDark} />
            </TouchableOpacity>
          </View>

          {/* Suporte */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💬 Suporte</Text>
            
            <TouchableOpacity style={styles.linkItem} onPress={handleContactSupport}>
              <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
              <Text style={styles.linkText}>Entrar em Contato</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.grayDark} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem} onPress={handleRateApp}>
              <Ionicons name="star-outline" size={20} color={COLORS.primary} />
              <Text style={styles.linkText}>Avaliar o App</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.grayDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.copyrightSection}>
            <Text style={styles.copyrightText}>
              © 2025 Poupadin. Todos os direitos reservados.
            </Text>
            <Text style={styles.copyrightSubtext}>
              Feito no Brasil 🇧🇷
            </Text>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <CustomButton
            title="Fechar"
            onPress={onClose}
            variant="outline"
          />
        </View>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    marginBottom: 16,
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
  appName: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  appDescription: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  sectionText: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    lineHeight: 22,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    flex: 1,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  linkText: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    flex: 1,
    marginLeft: 12,
  },
  copyrightSection: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
  },
  copyrightText: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  copyrightSubtext: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
  bottomSpacing: {
    height: 80,
  },
  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
    minHeight: 70,
  },
});