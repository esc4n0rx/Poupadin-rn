// components/notifications/NotificationModal.tsx
import { CustomButton } from '@/components/CustomButton';
import { COLORS, SIZES } from '@/constants/Theme';
import { useNotifications } from '@/hooks/useNotifications';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotificationItem } from './NotificationItem';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const {
    notifications,
    stats,
    isLoading,
    isUpdating,
    markAsRead,
    markAllAsRead,
    sendTestNotification,
    refreshData,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const handleNotificationPress = (notificationId: string) => {
    // Marcar como lida automaticamente ao clicar
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.is_read) {
      markAsRead(notificationId);
    }
    
    // Aqui você pode adicionar navegação baseada no tipo de notificação
    // Por exemplo: navegar para a tela de transações se for uma notificação de transação
  };

  const renderNotificationItem = ({ item, index }: { item: any; index: number }) => (
    <NotificationItem
      notification={item}
      onPress={() => handleNotificationPress(item.id)}
      onMarkAsRead={() => markAsRead(item.id)}
      index={index}
    />
  );

  const renderHeader = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.headerContent}>
      {/* Estatísticas */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total_count}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.primary }]}>
              {stats.unread_count}
            </Text>
            <Text style={styles.statLabel}>Não Lidas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.today_count}</Text>
            <Text style={styles.statLabel}>Hoje</Text>
          </View>
        </View>
      )}

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterText,
            filter === 'all' && styles.filterTextActive
          ]}>
            Todas ({notifications.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'unread' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[
            styles.filterText,
            filter === 'unread' && styles.filterTextActive
          ]}>
            Não Lidas ({stats?.unread_count || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ações */}
      <View style={styles.actionsContainer}>
        <CustomButton
          title="Marcar Todas como Lidas"
          onPress={markAllAsRead}
          loading={isUpdating}
          disabled={!stats?.unread_count}
          variant="outline"
          style={styles.actionButton}
        />
        
        <CustomButton
          title="Teste"
          onPress={sendTestNotification}
          loading={isUpdating}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View entering={FadeIn.duration(600)} style={styles.emptyContainer}>
      <Ionicons 
        name={filter === 'unread' ? 'checkmark-circle-outline' : 'notifications-outline'} 
        size={64} 
        color={COLORS.grayLight} 
      />
      <Text style={styles.emptyTitle}>
        {filter === 'unread' 
          ? 'Todas as notificações foram lidas!' 
          : 'Nenhuma notificação ainda'
        }
      </Text>
      <Text style={styles.emptyText}>
        {filter === 'unread'
          ? 'Você está em dia com suas notificações.'
          : 'Suas notificações aparecerão aqui quando chegarem.'
        }
      </Text>
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Notificações</Text>
          </View>
          
          <TouchableOpacity 
            onPress={refreshData}
            style={styles.refreshButton}
            disabled={isLoading}
          >
            <Ionicons 
              name="refresh" 
              size={24} 
              color={isLoading ? COLORS.grayDark : COLORS.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Conteúdo */}
        {isLoading && notifications.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Carregando notificações...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={[
              styles.listContent,
              filteredNotifications.length === 0 && styles.emptyListContent
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refreshData}
                tintColor={COLORS.primary}
              />
            }
          />
        )}

        {/* Footer */}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: SIZES.body2,
    color: COLORS.textLight,
  },
  headerContent: {
    padding: SIZES.padding,
    paddingBottom: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 20,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radius,
    padding: 4,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
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