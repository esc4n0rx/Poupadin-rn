// components/home/HomeHeader.tsx
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { NotificationModal } from '@/components/notifications/NotificationModal';
import { COLORS, SIZES } from '@/constants/Theme';
import { useNotifications } from '@/hooks/useNotifications';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HomeHeaderProps {
  name?: string | null;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ name }) => {
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const { stats } = useNotifications();
  
  // ✅ CORREÇÃO: Verificação segura do nome do usuário
  const displayName = name?.trim() || 'Usuário';

  const handleNotificationPress = () => {
    setNotificationModalVisible(true);
  };

  return (
    <>
      <View style={styles.container}>
        <View>
          <Text style={styles.greeting}>Olá, Bem-vindo de Volta</Text>
          <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
        </View>
        <View style={styles.rightContainer}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNotificationPress}
            accessibilityRole="button"
            accessibilityLabel={`Notificações${stats?.unread_count ? `, ${stats.unread_count} não lidas` : ''}`}
          >
            <Ionicons name="notifications-outline" size={26} color={COLORS.white} />
            {stats && stats.unread_count > 0 && (
              <NotificationBadge count={stats.unread_count} size="small" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <NotificationModal
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
  },
  greeting: {
    fontSize: SIZES.body3,
    color: COLORS.white,
    opacity: 0.8,
  },
  userName: {
    fontSize: SIZES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
    maxWidth: 200, 
  },
  rightContainer: {
    position: 'relative',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
});