// app/(tabs)/explore.tsx
import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { CustomStatusBar } from '@/components/CustomStatusBar';
import { COLORS, SIZES } from '@/constants/Theme';
import { budgetService } from '@/services/budgetService';
import { Category, ExpensePayload } from '@/types/budget';
import { getErrorMessage } from '@/utils/errorHandler';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

const { width } = Dimensions.get('window');

const ExpenseSchema = (maxAmount: number, categoryName: string) => z.object({
  category_id: z.string({ required_error: 'Selecione uma categoria.' }),
  description: z.string().min(3, 'A descrição deve ter no mínimo 3 caracteres.'),
  amount: z
    .number({ invalid_type_error: 'Informe um valor numérico.' })
    .positive('O valor deve ser positivo.')
    .max(maxAmount, `Valor excede o saldo disponível para ${categoryName}: ${maxAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`),
});

export default function ExpenseScreen() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [monthlyStats, setMonthlyStats] = useState({
    totalSpent: 0,
    totalBudget: 0,
    transactionCount: 0,
  });

  // Animações
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const validationSchema = useMemo(() => {
    return ExpenseSchema(selectedCategory?.current_balance ?? Infinity, selectedCategory?.name ?? 'a categoria');
  }, [selectedCategory]);

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ExpensePayload>({
    resolver: zodResolver(validationSchema),
    defaultValues: { description: '', amount: 0, category_id: '' },
  });

  const amountValue = watch('amount');
  const categoryIdValue = watch('category_id');

  // Animação de entrada
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchBudgetData = useCallback(async () => {
    try {
      setIsLoading(true);
      const { budget } = await budgetService.getCurrentBudget();
      const availableCategories = budget.budget_categories.filter((c): c is Category => typeof c.current_balance === 'number' && c.current_balance > 0);
      setCategories(availableCategories);

      // Calcular estatísticas do mês
      const totalBudget = budget.budget_categories.reduce((sum, cat) => sum + (cat.allocated_amount || 0), 0);
      const totalSpent = budget.budget_categories.reduce((sum, cat) => sum + ((cat.allocated_amount || 0) - (cat.current_balance || 0)), 0);
      const transactionCount = budget.budget_categories.reduce((sum, cat) => sum + (cat.transaction_count || 0), 0);

      setMonthlyStats({
        totalSpent,
        totalBudget,
        transactionCount,
      });
    } catch (error) {
      Alert.alert('Erro', getErrorMessage(error, 'Não foi possível carregar as categorias.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBudgetData();
    }, [fetchBudgetData])
  );
  
  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setValue('category_id', category.id!, { shouldValidate: true });
    setValue('amount', 0);
    setModalVisible(false);
  };
  
  const onSubmit = async (data: ExpensePayload) => {
    setIsSubmitting(true);
    try {
      await budgetService.createExpense(data);
      
      // Feedback visual melhorado
      const successAnimation = Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);
      
      successAnimation.start();
      
      Alert.alert(
        '✅ Sucesso!', 
        'Sua despesa foi registrada com sucesso.', 
        [
          {
            text: 'OK',
            style: 'default',
          }
        ]
      );
      
      reset();
      setSelectedCategory(null);
      await fetchBudgetData(); 
    } catch (error) {
      Alert.alert('❌ Erro no Registro', getErrorMessage(error, 'Não foi possível registrar a despesa.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const insightPercentage = useMemo(() => {
    if (
      selectedCategory &&
      typeof selectedCategory.current_balance === 'number' &&
      selectedCategory.current_balance > 0 &&
      amountValue > 0
    ) {
      return (amountValue / selectedCategory.current_balance) * 100;
    }
    return 0;
  }, [amountValue, selectedCategory]);

  const renderStatsCard = () => {
    const spentPercentage = monthlyStats.totalBudget > 0 ? (monthlyStats.totalSpent / monthlyStats.totalBudget) * 100 : 0;
    
    return (
      <Animated.View 
        style={[
          styles.statsCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.statsHeader}>
          <View style={styles.statsIconContainer}>
            <Ionicons name="analytics" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.statsTitle}>Resumo do Mês</Text>
        </View>
        
        <View style={styles.statsContent}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {monthlyStats.totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
            <Text style={styles.statLabel}>Gasto Total</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monthlyStats.transactionCount}</Text>
            <Text style={styles.statLabel}>Transações</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={[
              styles.statValue,
              { color: spentPercentage > 80 ? COLORS.error : COLORS.success }
            ]}>
              {spentPercentage.toFixed(0)}%
            </Text>
            <Text style={styles.statLabel}>do Orçamento</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderQuickActions = () => {
    const recentCategories = categories
      .sort((a, b) => (b.transaction_count || 0) - (a.transaction_count || 0))
      .slice(0, 3);

    return (
      <Animated.View 
        style={[
          styles.quickActionsCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.quickActionsHeader}>
          <View style={styles.quickActionsIconContainer}>
            <Ionicons name="flash" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.quickActionsTitle}>Categorias Frequentes</Text>
        </View>
        
        <View style={styles.quickActionsList}>
          {recentCategories.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={styles.quickActionItem}
              onPress={() => handleSelectCategory(category)}
            >
              <View style={[styles.categoryColorIndicator, { backgroundColor: category.color }]} />
              <View style={styles.quickActionContent}>
                <Text style={styles.quickActionName}>{category.name}</Text>
                <Text style={styles.quickActionBalance}>
                  {(category.current_balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.grayDark} />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando categorias...</Text>
      </View>
    );
  }
  
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* Header seguindo o padrão exato das outras telas */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="wallet" size={28} color={COLORS.white} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Registrar Despesa</Text>
            <Text style={styles.headerSubtitle}>Acompanhe seus gastos com precisão</Text>
          </View>
        </View>
        
        {/* Decoração visual */}
        <View style={styles.headerDecoration}>
          <View style={[styles.decorationCircle, styles.decorationCircle1]} />
          <View style={[styles.decorationCircle, styles.decorationCircle2]} />
          <View style={[styles.decorationCircle, styles.decorationCircle3]} />
        </View>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              {/* Cards de Estatísticas */}
              {renderStatsCard()}
              
              {/* Ações Rápidas */}
              {renderQuickActions()}
              
              {/* Formulário Principal */}
              <Animated.View 
                style={[
                  styles.mainFormCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <View style={styles.formHeader}>
                  <View style={styles.formIconContainer}>
                    <Ionicons name="create" size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.formTitle}>Nova Despesa</Text>
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Categoria</Text>
                  <TouchableOpacity 
                    style={[
                      styles.pickerButton,
                      errors.category_id && styles.pickerButtonError,
                    ]} 
                    onPress={() => setModalVisible(true)} 
                    accessibilityLabel="Selecionar Categoria" 
                    accessibilityHint="Toque para abrir a lista de categorias de despesa"
                  >
                    {selectedCategory ? (
                      <View style={styles.selectedCategoryContainer}>
                        <View style={[styles.categoryColorDot, { backgroundColor: selectedCategory.color }]} />
                        <View style={styles.selectedCategoryInfo}>
                          <Text style={styles.selectedCategoryName}>{selectedCategory.name}</Text>
                          <Text style={styles.selectedCategoryBalance}>
                            Saldo: {(selectedCategory.current_balance ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.pickerPlaceholder}>Selecione uma categoria</Text>
                    )}
                    <Ionicons name="chevron-down" size={20} color={COLORS.grayDark} />
                  </TouchableOpacity>
                  {errors.category_id && <Text style={styles.errorText}>{errors.category_id.message}</Text>}
                </View>

                <Controller
                  control={control}
                  name="amount"
                  render={({ field: { onChange, value } }) => (
                    <CustomInput
                      label="Valor da Despesa (R$)"
                      placeholder="0,00"
                      value={value?.toString() || ''}
                      onChangeText={(text) => {
                        const numericValue = parseFloat(text.replace(',', '.')) || 0;
                        onChange(numericValue);
                      }}
                      error={errors.amount?.message}
                      keyboardType="numeric"
                      leftIcon="cash-outline"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, value } }) => (
                    <CustomInput
                      label="Descrição"
                      placeholder="Ex: Almoço, gasolina, etc."
                      value={value}
                      onChangeText={onChange}
                      error={errors.description?.message}
                      leftIcon="document-text-outline"
                      multiline
                    />
                  )}
                />

                {/* Insight Visual */}
                {selectedCategory && amountValue > 0 && (
                  <Animated.View 
                    style={[
                      styles.insightContainer,
                      {
                        opacity: fadeAnim,
                      },
                    ]}
                  >
                    <View style={styles.insightHeader}>
                      <Ionicons name="bulb" size={16} color={COLORS.primaryDark} />
                      <Text style={styles.insightTitle}>Análise</Text>
                    </View>
                    <Text style={styles.insightText}>
                      Este gasto representa{' '}
                      <Text style={[
                        styles.insightHighlight,
                        { color: insightPercentage > 50 ? COLORS.error : COLORS.primaryDark }
                      ]}>
                        {insightPercentage.toFixed(1)}%
                      </Text>
                      {' '}do saldo da categoria {selectedCategory.name}.
                    </Text>
                    
                    {/* Barra de Progresso Visual */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <Animated.View 
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min(insightPercentage, 100)}%`,
                              backgroundColor: insightPercentage > 80 ? COLORS.error : 
                                             insightPercentage > 50 ? '#FFA500' : COLORS.success,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {insightPercentage > 80 ? '⚠️ Alto impacto' : 
                         insightPercentage > 50 ? '⚡ Impacto médio' : '✅ Impacto baixo'}
                      </Text>
                    </View>
                  </Animated.View>
                )}

                <CustomButton
                  title={isSubmitting ? "Registrando..." : "Registrar Despesa"}
                  onPress={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                  style={styles.submitButton}
                />
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Modal de Seleção de Categoria */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Categoria</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color={COLORS.grayDark} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id!}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => handleSelectCategory(item)}
                  accessibilityLabel={`Categoria ${item.name}, saldo ${(item.current_balance ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                >
                  <View style={[styles.categoryColorDot, { backgroundColor: item.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <Text style={styles.categoryBalance}>
                      Saldo: {(item.current_balance ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyListText}>Nenhuma categoria com saldo disponível.</Text>}
              showsVerticalScrollIndicator={false}
            />
            <CustomButton title="Fechar" onPress={() => setModalVisible(false)} variant="secondary" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: SIZES.body2,
    color: COLORS.textLight,
  },
  
  // Header seguindo exatamente o padrão das outras telas
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 50,
    borderBottomLeftRadius: SIZES.radiusLarge,
    borderBottomRightRadius: SIZES.radiusLarge,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    marginTop: 20,
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: { 
    color: COLORS.white, 
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: { 
    color: COLORS.white, 
    opacity: 0.9, 
    fontSize: SIZES.body3,
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.6,
    height: '100%',
    zIndex: 1,
  },
  decorationCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  decorationCircle1: {
    width: 80,
    height: 80,
    top: 20,
    right: -20,
  },
  decorationCircle2: {
    width: 60,
    height: 60,
    top: 60,
    right: 40,
  },
  decorationCircle3: {
    width: 40,
    height: 40,
    top: 100,
    right: 10,
  },
  
  // Content seguindo o padrão das outras telas
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
    backgroundColor: COLORS.background,
  },
  scrollContent: { 
    flexGrow: 1, 
    paddingBottom: 120 
  },
  formContainer: {
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingTop: 30,
    flex: 1,
  },
  
  // Cards de estatísticas
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.padding,
    marginBottom: 16,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statsTitle: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.inputBorder,
    marginHorizontal: 16,
  },
  
  // Ações rápidas
  quickActionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.padding,
    marginBottom: 16,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActionsIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionsTitle: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.text,
  },
  quickActionsList: {
    gap: 8,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
  },
  categoryColorIndicator: {
    width: 8,
    height: 32,
    borderRadius: 4,
    marginRight: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionName: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  quickActionBalance: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
  },
  
  // Formulário principal
  mainFormCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.padding,
    marginBottom: 16,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  formIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  formTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  
  // Campos do formulário
  fieldContainer: { 
    marginBottom: 20 
  },
  label: { 
    fontSize: SIZES.body2, 
    color: COLORS.text, 
    marginBottom: 8, 
    fontWeight: '500' 
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    minHeight: 56,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  pickerButtonError: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF5F5',
  },
  selectedCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  selectedCategoryInfo: {
    flex: 1,
  },
  selectedCategoryName: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  selectedCategoryBalance: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
  },
  pickerPlaceholder: { 
    fontSize: SIZES.body2, 
    color: COLORS.grayDark 
  },
  errorText: { 
    fontSize: SIZES.body4, 
    color: COLORS.error, 
    marginTop: 4 
  },
  
  // Container de insight
  insightContainer: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primaryDark,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginLeft: 6,
  },
  insightText: {
    color: COLORS.text,
    fontSize: SIZES.body3,
    lineHeight: 20,
    marginBottom: 12,
  },
  insightHighlight: {
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.grayLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  
  // Botão de submit
  submitButton: {
    marginTop: 8,
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
    padding: SIZES.padding,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  modalTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryName: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  categoryBalance: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
  },
  emptyListText: {
    textAlign: 'center',
    marginVertical: 40,
    color: COLORS.grayDark,
    fontSize: SIZES.body2,
    fontStyle: 'italic',
  },
});