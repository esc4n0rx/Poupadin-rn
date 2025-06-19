// app/(tabs)/explore.tsx
import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { CustomStatusBar } from '@/components/CustomStatusBar';
import { ThemedText } from '@/components/ThemedText';
import { COLORS, SIZES } from '@/constants/Theme';
import { budgetService } from '@/services/budgetService';
import { Category, ExpensePayload } from '@/types/budget';
import { getErrorMessage } from '@/utils/errorHandler';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    LayoutAnimation,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

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

  const validationSchema = useMemo(() => {
    return ExpenseSchema(selectedCategory?.current_balance ?? Infinity, selectedCategory?.name ?? 'a categoria');
  }, [selectedCategory]);

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ExpensePayload>({
    resolver: zodResolver(validationSchema),
    defaultValues: { description: '', amount: 0, category_id: '' },
  });

  const amountValue = watch('amount');
  const categoryIdValue = watch('category_id');

  const fetchBudgetData = useCallback(async () => {
    try {
      setIsLoading(true);
      const { budget } = await budgetService.getCurrentBudget();
      const availableCategories = budget.budget_categories.filter((c): c is Category => typeof c.current_balance === 'number' && c.current_balance > 0);
      setCategories(availableCategories);
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
      Alert.alert('Sucesso!', 'Sua despesa foi registrada com sucesso.');
      reset();
      setSelectedCategory(null);
      await fetchBudgetData(); 
    } catch (error) {
      Alert.alert('Erro no Registro', getErrorMessage(error, 'Não foi possível registrar a despesa.'));
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

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <ThemedText>Carregando categorias...</ThemedText>
      </View>
    );
  }
  
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <ThemedText type="title" style={styles.headerTitle}>Registrar Despesa</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Acompanhe seus gastos com precisão.</ThemedText>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.label}>Categoria</ThemedText>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)} accessibilityLabel="Selecionar Categoria" accessibilityHint="Toque para abrir a lista de categorias de despesa">
                <ThemedText style={selectedCategory ? styles.pickerText : styles.pickerPlaceholder}>
                  {selectedCategory ? selectedCategory.name : 'Selecione uma categoria'}
                </ThemedText>
                <Ionicons name="chevron-down" size={20} color={COLORS.gray} />
              </TouchableOpacity>
              {errors.category_id && <ThemedText style={styles.errorText}>{errors.category_id.message}</ThemedText>}
            </View>
            
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Valor da Despesa (R$)"
                  placeholder="0,00"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(Number(text.replace(',', '.')) || 0)}
                  value={value > 0 ? String(value).replace('.', ',') : ''}
                  error={errors.amount?.message}
                  leftIcon="cash-outline"
                />
              )}
            />

            {insightPercentage > 0 && (
              <View style={styles.insightContainer}>
                  <ThemedText style={styles.insightText}>
                    Esta despesa representa{' '}
                    <ThemedText style={styles.insightHighlight}>
                      {insightPercentage.toFixed(1)}%
                    </ThemedText> do saldo de "{selectedCategory?.name}".
                  </ThemedText>
              </View>
            )}

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Descrição"
                  placeholder="Ex: Almoço, gasolina, etc."
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.description?.message}
                  leftIcon="reader-outline"
                  multiline
                  numberOfLines={3}
                  style={{height: 80, textAlignVertical: 'top'}}
                />
              )}
            />

            <CustomButton 
              title="Registrar Despesa"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting || !categoryIdValue}
              style={{ marginTop: 20 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>Selecione uma Categoria</ThemedText>
            <FlatList
              data={categories}
              keyExtractor={(item, index) => item.id ?? `category-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => handleSelectCategory(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Categoria ${item.name}, saldo ${(item.current_balance ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                >
                   <View style={[styles.categoryColorDot, { backgroundColor: item.color }]} />
                  <View style={{flex: 1}}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <Text style={styles.categoryBalance}>
                      Saldo: {(item.current_balance ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={<ThemedText style={styles.emptyListText}>Nenhuma categoria com saldo disponível.</ThemedText>}
            />
            <CustomButton title="Fechar" onPress={() => setModalVisible(false)} variant="secondary" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingBottom: 120 }, // Aumentar padding para a TabBar flutuante
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingBottom: 40,
    borderBottomLeftRadius: SIZES.radiusLarge,
    borderBottomRightRadius: SIZES.radiusLarge,
  },
  headerTitle: { color: COLORS.white, textAlign: 'center' },
  headerSubtitle: { color: COLORS.white, textAlign: 'center', opacity: 0.9, marginTop: 4 },
  formContainer: {
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingTop: 20,
    marginTop: -20,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
    flex: 1,
  },
  fieldContainer: { marginBottom: 20 },
  label: { fontSize: SIZES.body2, color: COLORS.text, marginBottom: 8, fontWeight: '500' },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    minHeight: 56,
    borderWidth: 1,
    borderColor: COLORS.inputBorder
  },
  pickerText: { fontSize: SIZES.body2, color: COLORS.text },
  pickerPlaceholder: { fontSize: SIZES.body2, color: COLORS.grayDark },
  errorText: { fontSize: SIZES.body4, color: COLORS.error, marginTop: 4 },
  insightContainer: {
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: SIZES.radius,
    marginBottom: 20,
    marginTop: -10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primaryDark,
  },
  insightText: {
    color: COLORS.text,
    fontSize: SIZES.body3,
  },
  insightHighlight: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
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
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.text, // Corrigido para garantir contraste
  },
  categoryBalance: {
    fontSize: SIZES.body3,
    color: COLORS.textLight, // Corrigido para garantir contraste
  },
  emptyListText: {
    textAlign: 'center',
    marginVertical: 20,
    color: COLORS.gray,
  },
});