// app/(tabs)/wallet.tsx
import { CustomStatusBar } from '@/components/CustomStatusBar';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { CategoryStats } from '@/components/categories/CategoryStats';
import { TransferModal } from '@/components/categories/TransferModal';
import { COLORS, SIZES } from '@/constants/Theme';
import { useCategories } from '@/hooks/useCategories';
import { BudgetCategory } from '@/types/category';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ViewMode = 'cards' | 'stats';

export default function CategoryManagerScreen() {
  const insets = useSafeAreaInsets();
  const {
    categories,
    isLoading,
    isTransferring,
    error,
    totalAllocated,
    totalUsed,
    totalAvailable,
    transferBetweenCategories,
    refreshData,
  } = useCategories();

  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null);

  const activeCategories = categories.filter(cat => cat.is_active);

  const handleCategoryPress = (category: BudgetCategory) => {
    // Aqui pode abrir um modal com detalhes da categoria ou navegar para uma tela de detalhes
    console.log('Category pressed:', category.name);
  };

  const handleTransferPress = (category: BudgetCategory) => {
    setSelectedCategory(category);
    setTransferModalVisible(true);
  };

  const renderHeader = () => (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.headerContent}>
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'cards' && styles.toggleButtonActive]}
          onPress={() => setViewMode('cards')}
        >
          <Ionicons
            name="grid-outline"
            size={20}
            color={viewMode === 'cards' ? COLORS.white : COLORS.primary}
          />
          <Text style={[
            styles.toggleText,
            viewMode === 'cards' && styles.toggleTextActive
          ]}>
            Categorias
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'stats' && styles.toggleButtonActive]}
          onPress={() => setViewMode('stats')}
        >
          <Ionicons
            name="stats-chart-outline"
            size={20}
            color={viewMode === 'stats' ? COLORS.white : COLORS.primary}
          />
          <Text style={[
            styles.toggleText,
            viewMode === 'stats' && styles.toggleTextActive
          ]}>
            Estatísticas
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderCategoryCard = ({ item, index }: { item: BudgetCategory; index: number }) => (
    <Animated.View entering={FadeInUp.duration(500).delay(index * 100)}>
      <CategoryCard
        category={item}
        onPress={() => handleCategoryPress(item)}
        onTransfer={() => handleTransferPress(item)}
      />
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="albums-outline" size={64} color={COLORS.grayLight} />
      <Text style={styles.emptyTitle}>Nenhuma categoria encontrada</Text>
      <Text style={styles.emptyText}>
        Configure seu orçamento para começar a gerenciar suas categorias.
      </Text>
    </View>
  );

  if (isLoading && categories.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando categorias...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Gerenciar Categorias</Text>
        <Text style={styles.headerSubtitle}>
          {activeCategories.length} categorias • {(totalAvailable/totalAllocated * 100 || 0).toFixed(1)}% disponível
        </Text>
      </View>

      <View style={styles.content}>
        {viewMode === 'cards' ? (
          <FlatList
            data={activeCategories}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={isLoading} 
                onRefresh={refreshData} 
                tintColor={COLORS.primary}
              />
            }
          />
        ) : (
          <FlatList
            data={[{ key: 'stats' }]}
            renderItem={() => (
              <CategoryStats
                categories={activeCategories}
                totalAllocated={totalAllocated}
                totalUsed={totalUsed}
                totalAvailable={totalAvailable}
              />
            )}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.statsContent}
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
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TransferModal
        visible={transferModalVisible}
        categories={activeCategories}
        fromCategory={selectedCategory}
        onClose={() => {
          setTransferModalVisible(false);
          setSelectedCategory(null);
        }}
        onSubmit={transferBetweenCategories}
        isLoading={isTransferring}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: SIZES.body2,
    color: COLORS.textLight,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 30,
    borderBottomLeftRadius: SIZES.radiusLarge,
    borderBottomRightRadius: SIZES.radiusLarge,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: SIZES.body3,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
    backgroundColor: COLORS.background,
  },
  headerContent: {
    padding: SIZES.padding,
    paddingTop: 30,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radius,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.primary,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 120, // Espaço para a TabBar flutuante
  },
  statsContent: {
    paddingBottom: 120, // Espaço para a TabBar flutuante
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
  errorContainer: {
    position: 'absolute',
    bottom: 140, // Acima da TabBar
    left: 20,
    right: 20,
    backgroundColor: COLORS.error,
    padding: 12,
    borderRadius: SIZES.radius,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  errorText: {
    color: COLORS.white,
    fontSize: SIZES.body3,
    textAlign: 'center',
    fontWeight: '500',
  },
});