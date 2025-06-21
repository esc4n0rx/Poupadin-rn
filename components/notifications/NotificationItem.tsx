// components/notifications/NotificationItem.tsx
import { COLORS, SIZES } from '@/constants/Theme';
import { NotificationItem as NotificationItemType } from '@/types/notifications';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface NotificationItemProps {
  notification: NotificationItemType;
  onPress: () => void;
  onMarkAsRead?: () => void;
  index: number;
}

const getNotificationIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'reminder':
      return 'alarm-outline';
    case 'update':
      return 'refresh-outline';
    case 'transaction':
      return 'swap-horizontal-outline';
    case 'expense_record':
      return 'receipt-outline';
    case 'achievement':
      return 'trophy-outline';
    case 'system':
      return 'settings-outline';
    default:
      return 'notifications-outline';
  }
};

const getNotificationColor = (type: string): string => {
  switch (type) {
    case 'reminder':
      return COLORS.primary;
    case 'update':
      return COLORS.primaryDark;
    case 'transaction':
      return COLORS.success;
    case 'expense_record':
      return COLORS.error;
    case 'achievement':
      return '#FFD700';
    case 'system':
      return COLORS.gray;
    default:
      return COLORS.primary;
  }
};

const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Agora mesmo';
  if (diffMinutes < 60) return `${diffMinutes}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays}d atrás`;
  
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    year: diffDays > 365 ? '2-digit' : undefined
  });
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkAsRead,
  index,
}) => {
  const iconName = getNotificationIcon(notification.type);
  const iconColor = getNotificationColor(notification.type);

  return (
    <Animated.View 
      entering={FadeInRight.duration(500).delay(index * 100)}
      style={styles.container}
    >
      <TouchableOpacity
        style={[
          styles.content,
          !notification.is_read && styles.unreadContent
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={[
              styles.title,
              !notification.is_read && styles.unreadTitle
            ]} numberOfLines={1}>
              {notification.title}
            </Text>
            {!notification.is_read && <View style={styles.unreadDot} />}
          </View>
          
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
          
          <View style={styles.footerRow}>
            <Text style={styles.timeText}>
              {formatTimeAgo(notification.created_at)}
            </Text>
            
            {notification.data?.amount && (
              <Text style={[
                styles.amountText,
                { color: notification.data.amount > 0 ? COLORS.success : COLORS.error }
              ]}>
                {notification.data.amount > 0 ? '+' : ''}
                {notification.data.amount.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}
              </Text>
            )}
          </View>
        </View>

        {!notification.is_read && onMarkAsRead && (
          <TouchableOpacity
            style={styles.markReadButton}
            onPress={(e) => {
              e.stopPropagation();
              onMarkAsRead();
            }}
          >
            <Ionicons name="checkmark" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radiusLarge,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unreadContent: {
    backgroundColor: COLORS.secondary,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  message: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: SIZES.body4,
    color: COLORS.grayDark,
  },
  amountText: {
    fontSize: SIZES.body4,
    fontWeight: '600',
  },
  markReadButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
});