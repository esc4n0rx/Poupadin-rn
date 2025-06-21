// components/profile/SettingsModal.tsx (corrigido)
import { CustomButton } from '@/components/CustomButton';
import { COLORS, SIZES } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    budget: true,
    goals: true,
    transactions: false,
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleThemeChange = () => {
    Alert.alert(
      'Tema do App',
      'Escolha o tema do aplicativo',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Claro', onPress: () => setTheme('light') },
        { text: 'Escuro', onPress: () => setTheme('dark') },
        { text: 'Automático', onPress: () => setTheme('auto') },
      ]
    );
  };

  const handleLanguageChange = () => {
    Alert.alert(
      'Idioma',
      'Funcionalidade em desenvolvimento',
      [{ text: 'OK' }]
    );
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Claro';
      case 'dark': return 'Escuro';
      case 'auto': return 'Automático';
      default: return 'Claro';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Configurações</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Notificações */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔔 Notificações</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notificações Push</Text>
                <Text style={styles.settingDescription}>
                  Receber notificações no dispositivo
                </Text>
              </View>
              <Switch
                value={notifications.push}
                onValueChange={(value) => handleNotificationChange('push', value)}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notificações por Email</Text>
                <Text style={styles.settingDescription}>
                  Receber resumos por email
                </Text>
              </View>
              <Switch
                value={notifications.email}
                onValueChange={(value) => handleNotificationChange('email', value)}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
             />
           </View>

           <View style={styles.settingItem}>
             <View style={styles.settingInfo}>
               <Text style={styles.settingLabel}>Alertas de Orçamento</Text>
               <Text style={styles.settingDescription}>
                 Avisos quando o orçamento estiver acabando
               </Text>
             </View>
             <Switch
               value={notifications.budget}
               onValueChange={(value) => handleNotificationChange('budget', value)}
               trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
               thumbColor={COLORS.white}
             />
           </View>

           <View style={styles.settingItem}>
             <View style={styles.settingInfo}>
               <Text style={styles.settingLabel}>Progresso de Objetivos</Text>
               <Text style={styles.settingDescription}>
                 Notificações sobre seus objetivos
               </Text>
             </View>
             <Switch
               value={notifications.goals}
               onValueChange={(value) => handleNotificationChange('goals', value)}
               trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
               thumbColor={COLORS.white}
             />
           </View>

           <View style={styles.settingItem}>
             <View style={styles.settingInfo}>
               <Text style={styles.settingLabel}>Novas Transações</Text>
               <Text style={styles.settingDescription}>
                 Confirmação de transações registradas
               </Text>
             </View>
             <Switch
               value={notifications.transactions}
               onValueChange={(value) => handleNotificationChange('transactions', value)}
               trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
               thumbColor={COLORS.white}
             />
           </View>
         </View>

         {/* Aparência */}
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>🎨 Aparência</Text>
           
           <TouchableOpacity style={styles.settingItem} onPress={handleThemeChange}>
             <View style={styles.settingInfo}>
               <Text style={styles.settingLabel}>Tema</Text>
               <Text style={styles.settingDescription}>
                 {getThemeLabel()}
               </Text>
             </View>
             <Ionicons name="chevron-forward" size={20} color={COLORS.grayDark} />
           </TouchableOpacity>

           <TouchableOpacity style={styles.settingItem} onPress={handleLanguageChange}>
             <View style={styles.settingInfo}>
               <Text style={styles.settingLabel}>Idioma</Text>
               <Text style={styles.settingDescription}>
                 Português (Brasil)
               </Text>
             </View>
             <Ionicons name="chevron-forward" size={20} color={COLORS.grayDark} />
           </TouchableOpacity>
         </View>

         {/* Dados e Privacidade */}
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>🔒 Dados e Privacidade</Text>
           
           <TouchableOpacity style={styles.settingItem}>
             <View style={styles.settingInfo}>
               <Text style={styles.settingLabel}>Backup de Dados</Text>
               <Text style={styles.settingDescription}>
                 Fazer backup automático dos dados
               </Text>
             </View>
             <Switch
               value={true}
               onValueChange={() => {}}
               trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
               thumbColor={COLORS.white}
             />
           </TouchableOpacity>

           <TouchableOpacity style={styles.settingItem}>
             <View style={styles.settingInfo}>
               <Text style={styles.settingLabel}>Análises de Uso</Text>
               <Text style={styles.settingDescription}>
                 Ajudar a melhorar o app compartilhando dados anônimos
               </Text>
             </View>
             <Switch
               value={false}
               onValueChange={() => {}}
               trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
               thumbColor={COLORS.white}
             />
           </TouchableOpacity>
         </View>

         {/* Sobre */}
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>ℹ️ Informações</Text>
           
           <View style={styles.infoItem}>
             <Text style={styles.infoLabel}>Versão do App</Text>
             <Text style={styles.infoValue}>1.0.0</Text>
           </View>

           <View style={styles.infoItem}>
             <Text style={styles.infoLabel}>Última Atualização</Text>
             <Text style={styles.infoValue}>Janeiro 2025</Text>
           </View>
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
 section: {
   marginBottom: 30,
 },
 sectionTitle: {
   fontSize: SIZES.h4,
   fontWeight: 'bold',
   color: COLORS.text,
   marginBottom: 16,
 },
 settingItem: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
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
 settingInfo: {
   flex: 1,
   marginRight: 16,
 },
 settingLabel: {
   fontSize: SIZES.body2,
   fontWeight: '600',
   color: COLORS.text,
 },
 settingDescription: {
   fontSize: SIZES.body4,
   color: COLORS.textLight,
   marginTop: 2,
 },
 infoItem: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   paddingVertical: 12,
   paddingHorizontal: 16,
   backgroundColor: COLORS.white,
   borderRadius: SIZES.radius,
   marginBottom: 8,
 },
 infoLabel: {
   fontSize: SIZES.body2,
   color: COLORS.text,
 },
 infoValue: {
   fontSize: SIZES.body2,
   color: COLORS.textLight,
   fontWeight: '600',
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