// components/profile/SettingsModal.tsx
import { CustomButton } from '@/components/CustomButton';
import { COLORS, SIZES } from '@/constants/Theme';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationSettings } from '@/types/notifications';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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
  const { settings, updateSettings, sendTestNotification, isUpdating } = useNotifications();
  
  const [localSettings, setLocalSettings] = useState<NotificationSettings | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');

  // Sincronizar configurações locais com as do servidor
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleNotificationChange = async (key: keyof NotificationSettings, value: boolean | string | number) => {
    if (!localSettings) return;

    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);

    // Atualizar no servidor
    await updateSettings({ [key]: value });
  };

  const handleQuietHoursChange = async (type: 'start' | 'end', value: string) => {
    if (!localSettings) return;

    const key = type === 'start' ? 'quiet_hours_start' : 'quiet_hours_end';
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);

    await updateSettings({ [key]: value });
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

  const handleQuietHoursPress = () => {
    Alert.alert(
      'Horário Silencioso',
      'Durante este período, você não receberá notificações push.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Configurar',
          onPress: () => {
            // Aqui você pode implementar um picker de horário
            Alert.alert('Em desenvolvimento', 'Funcionalidade será implementada em breve');
          }
        },
      ]
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
          {/* Notificações Push */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔔 Notificações Push</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notificações Ativadas</Text>
                <Text style={styles.settingDescription}>
                  Receber notificações no dispositivo
                </Text>
              </View>
              <Switch
                value={localSettings?.push_enabled ?? true}
                onValueChange={(value) => handleNotificationChange('push_enabled', value)}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
                disabled={isUpdating}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notificações por Email</Text>
                <Text style={styles.settingDescription}>
                  Receber resumos e alertas por email
                </Text>
              </View>
              <Switch
                value={localSettings?.email_enabled ?? false}
                onValueChange={(value) => handleNotificationChange('email_enabled', value)}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
                disabled={isUpdating}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notificações no App</Text>
                <Text style={styles.settingDescription}>
                  Mostrar notificações dentro do aplicativo
                </Text>
              </View>
              <Switch
                value={localSettings?.in_app_enabled ?? true}
                onValueChange={(value) => handleNotificationChange('in_app_enabled', value)}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
                disabled={isUpdating}
              />
            </View>
          </View>

          {/* Tipos de Notificação */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Tipos de Notificação</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Alertas de Orçamento</Text>
                <Text style={styles.settingDescription}>
                  Avisos quando o orçamento estiver acabando
                </Text>
              </View>
              <Switch
                value={localSettings?.budget_alerts ?? true}
                onValueChange={(value) => handleNotificationChange('budget_alerts', value)}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
                disabled={isUpdating}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Progresso de Objetivos</Text>
                <Text style={styles.settingDescription}>
                  Atualizações sobre seus objetivos de economia
                </Text>
              </View>
              <Switch
                value={localSettings?.goal_updates ?? true}
                onValueChange={(value) => handleNotificationChange('goal_updates', value)}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
                disabled={isUpdating}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Lembretes de Despesas</Text>
                <Text style={styles.settingDescription}>
                  Lembretes para registrar suas despesas
                </Text>
              </View>
              <Switch
                value={localSettings?.expense_reminders ?? false}
                onValueChange={(value) => handleNotificationChange('expense_reminders', value)}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
                disabled={isUpdating}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Transações Recorrentes</Text>
                <Text style={styles.settingDescription}>
                  Lembretes de transações recorrentes
                </Text>
              </View>
              <Switch
                value={localSettings?.recurring_transactions ?? true}
                onValueChange={(value) => handleNotificationChange('recurring_transactions', value)}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
                disabled={isUpdating}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Conquistas</Text>
                <Text style={styles.settingDescription}>
                  Notificações de conquistas e marcos
                </Text>
              </View>
              <Switch
                value={localSettings?.achievement_notifications ?? true}
                onValueChange={(value) => handleNotificationChange('achievement_notifications', value)}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
                disabled={isUpdating}
              />
            </View>
          </View>

          {/* Relatórios */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Relatórios</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Relatórios Semanais</Text>
                <Text style={styles.settingDescription}>
                  Resumo semanal das suas finanças
                </Text>
              </View>
              <Switch
                value={localSettings?.weekly_reports ?? true}
                onValueChange={(value) => handleNotificationChange('weekly_reports', value)}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
                disabled={isUpdating}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Relatórios Mensais</Text>
                <Text style={styles.settingDescription}>
                  Análise completa mensal
                </Text>
              </View>
              <Switch
                value={localSettings?.monthly_reports ?? true}
                onValueChange={(value) => handleNotificationChange('monthly_reports', value)}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
                disabled={isUpdating}
              />
            </View>
          </View>

          {/* Configurações Avançadas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Configurações Avançadas</Text>

            <TouchableOpacity style={styles.settingItem} onPress={handleQuietHoursPress}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Horário Silencioso</Text>
                <Text style={styles.settingDescription}>
                  {localSettings?.quiet_hours_enabled 
                    ? `${localSettings.quiet_hours_start || '22:00'} - ${localSettings.quiet_hours_end || '08:00'}`
                    : 'Desativado'
                  }
                </Text>
              </View>
              <Switch
                value={localSettings?.quiet_hours_enabled ?? false}
                onValueChange={(value) => handleNotificationChange('quiet_hours_enabled', value)}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
                disabled={isUpdating}
              />
            </TouchableOpacity>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Marketing</Text>
                <Text style={styles.settingDescription}>
                  Promoções e novidades do Poupadin
                </Text>
              </View>
              <Switch
                value={localSettings?.marketing_notifications ?? false}
                onValueChange={(value) => handleNotificationChange('marketing_notifications', value)}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
                disabled={isUpdating}
              />
            </View>
          </View>

          {/* Teste */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧪 Teste</Text>
            
            <TouchableOpacity 
              style={styles.testButton} 
              onPress={sendTestNotification}
              disabled={isUpdating}
            >
              <Ionicons name="paper-plane-outline" size={20} color={COLORS.primary} />
              <Text style={styles.testButtonText}>Enviar Notificação de Teste</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.grayDark} />
            </TouchableOpacity>
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
                  Ajudar a melhorar oapp compartilhando dados anônimos
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

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Limite Diário</Text>
          <Text style={styles.infoValue}>
            {localSettings?.max_daily_notifications || 50} notificações
          </Text>
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
testButton: {
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
testButtonText: {
fontSize: SIZES.body2,
color: COLORS.text,
flex: 1,
marginLeft: 12,
fontWeight: '600',
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