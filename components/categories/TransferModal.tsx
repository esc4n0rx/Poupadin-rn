// components/categories/TransferModal.tsx
import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { COLORS, SIZES } from '@/constants/Theme';
import { BudgetCategory, TransferPayload } from '@/types/category';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TransferModalProps {
  visible: boolean;
  categories: BudgetCategory[];
  fromCategory: BudgetCategory | null;
  onClose: () => void;
  onSubmit: (data: TransferPayload) => Promise<boolean>;
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const TransferModal: React.FC<TransferModalProps> = ({
  visible,
  categories,
  fromCategory,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const [toCategory, setToCategory] = useState<BudgetCategory | null>(null);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const availableCategories = categories.filter(cat => 
    cat.id !== fromCategory?.id && cat.is_active
  );

  const resetForm = () => {
    setToCategory(null);
    setAmount(0);
    setDescription('');
    setErrors({});
    setShowCategoryPicker(false);
  };

  const validateForm = (): boolean => {
    console.log('🔍 Validando formulário...');
    console.log('📝 Dados do formulário:', {
      fromCategory: fromCategory?.name,
      toCategory: toCategory?.name,
      amount,
      description,
      fromBalance: fromCategory?.current_balance
    });

    const newErrors: { [key: string]: string } = {};

    if (!toCategory) {
      newErrors.toCategory = 'Selecione a categoria de destino';
      console.log('❌ Erro: Categoria de destino não selecionada');
    }

    if (amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
      console.log('❌ Erro: Valor deve ser maior que zero');
    }

    if (fromCategory && amount > fromCategory.current_balance) {
      newErrors.amount = 'Valor não pode ser maior que o saldo disponível';
      console.log('❌ Erro: Valor maior que saldo disponível', {
        amount,
        availableBalance: fromCategory.current_balance
      });
    }

    if (!description.trim() || description.trim().length < 3) {
      newErrors.description = 'Descrição deve ter pelo menos 3 caracteres';
      console.log('❌ Erro: Descrição muito curta ou vazia');
    }

    console.log('📋 Erros encontrados:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('🚀 Iniciando transferência...');
    
    if (!fromCategory || !toCategory) {
      console.log('❌ Erro: Categorias não definidas', {
        fromCategory: fromCategory?.name,
        toCategory: toCategory?.name
      });
      return;
    }

    if (!validateForm()) {
      console.log('❌ Validação falhou - parando execução');
      return;
    }

    const transferData: TransferPayload = {
      from_category_id: fromCategory.id,
      to_category_id: toCategory.id,
      amount,
      description: description.trim(),
    };

    console.log('📤 Dados da transferência a serem enviados:', transferData);

    try {
      console.log('⏳ Chamando função de transferência...');
      const success = await onSubmit(transferData);
      console.log('✅ Resultado da transferência:', { success });
      
      if (success) {
        console.log('🎉 Transferência realizada com sucesso! Resetando formulário...');
        resetForm();
        onClose();
      } else {
        console.log('❌ Transferência falhou (success = false)');
      }
    } catch (error) {
      console.error('💥 Erro durante a transferência:', error);
    }
  };

  const handleClose = () => {
    console.log('🔒 Fechando modal de transferência');
    Keyboard.dismiss();
    resetForm();
    onClose();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleCategorySelect = (category: BudgetCategory) => {
    console.log('🎯 Categoria selecionada:', category.name);
    setToCategory(category);
    setShowCategoryPicker(false);
    if (errors.toCategory) setErrors(prev => ({ ...prev, toCategory: '' }));
  };

  const renderCategoryItem = ({ item }: { item: BudgetCategory }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategorySelect(item)}
    >
      <View style={[styles.categoryColorDot, { backgroundColor: item.color }]} />
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryItemName}>{item.name}</Text>
        <Text style={styles.categoryItemBalance}>
          Saldo: {formatCurrency(item.current_balance)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
    </TouchableOpacity>
  );

  if (!fromCategory) {
    console.log('❌ Modal não pode ser exibido: fromCategory é null');
    return null;
  }

  console.log('🎨 Renderizando TransferModal', {
    visible,
    fromCategory: fromCategory.name,
    availableCategoriesCount: availableCategories.length
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView 
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <TouchableWithoutFeedback>
              <View style={[
                styles.container, 
                { 
                  paddingBottom: Math.max(insets.bottom, 20),
                  // ✅ CORREÇÃO: Garantir altura máxima adequada
                  maxHeight: '85%',
                  marginTop: insets.top + 40, // ✅ CORREÇÃO: Adicionar margem superior
                }
              ]}>
                {/* ✅ CORREÇÃO: Header fixo com melhor posicionamento */}
                <View style={styles.header}>
                  <Text style={styles.title}>Transferir Saldo</Text>
                  <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>

                {/* ✅ CORREÇÃO: ScrollView com contentContainerStyle adequado */}
                <ScrollView 
                  style={styles.scrollContainer}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  bounces={false}
                >
                  {/* ✅ CORREÇÃO: Card de origem com melhor espaçamento */}
                  <View style={styles.fromCategoryInfo}>
                    <Text style={styles.sectionTitle}>De:</Text>
                    <View style={styles.categoryInfoCard}>
                      <View style={[styles.colorIndicator, { backgroundColor: fromCategory.color }]} />
                      <View style={styles.categoryInfoContent}>
                        <Text style={styles.categoryInfoName}>{fromCategory.name}</Text>
                        <Text style={styles.categoryInfoBalance}>
                          Saldo disponível: {formatCurrency(fromCategory.current_balance)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Seletor de categoria de destino */}
                  <View style={styles.toCategorySection}>
                    <Text style={styles.sectionTitle}>Para:</Text>
                    <TouchableOpacity
                      style={[
                        styles.categoryPicker,
                        errors.toCategory && styles.categoryPickerError
                      ]}
                      onPress={() => setShowCategoryPicker(true)}
                    >
                      {toCategory ? (
                        <View style={styles.selectedCategoryContainer}>
                          <View style={[styles.categoryColorDot, { backgroundColor: toCategory.color }]} />
                          <View style={styles.selectedCategoryInfo}>
                            <Text style={styles.selectedCategoryName}>{toCategory.name}</Text>
                            <Text style={styles.selectedCategoryBalance}>
                              Saldo: {formatCurrency(toCategory.current_balance)}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <Text style={styles.categoryPickerPlaceholder}>
                          Selecione a categoria de destino
                        </Text>
                      )}
                      <Ionicons name="chevron-down" size={20} color={COLORS.gray} />
                    </TouchableOpacity>
                    {errors.toCategory && <Text style={styles.errorText}>{errors.toCategory}</Text>}
                  </View>

                  {/* Input de valor */}
                  <CustomInput
                    label={`Valor a Transferir (Máx: ${formatCurrency(fromCategory.current_balance)})`}
                    placeholder="0,00"
                    value={amount > 0 ? amount.toString() : ''}
                    onChangeText={(value) => {
                      const numericValue = parseFloat(value.replace(',', '.')) || 0;
                      console.log('💰 Valor alterado:', numericValue);
                      setAmount(numericValue);
                      if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                    }}
                    error={errors.amount}
                    keyboardType="numeric"
                    leftIcon="cash-outline"
                  />

                  {/* Input de descrição */}
                  <CustomInput
                    label="Descrição da Transferência"
                    placeholder="Ex: Sobrou do orçamento de alimentação..."
                    value={description}
                    onChangeText={(value) => {
                      console.log('📝 Descrição alterada:', value);
                      setDescription(value);
                      if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                    }}
                    error={errors.description}
                    multiline
                    numberOfLines={3}
                    style={{ height: 80, textAlignVertical: 'top' }}
                  />

                  {/* ✅ CORREÇÃO: Espaçamento extra menor */}
                  <View style={styles.extraSpace} />
                </ScrollView>

                {/* ✅ CORREÇÃO: Footer fixo com melhor estilo */}
                <View style={styles.footer}>
                  <View style={styles.buttonContainer}>
                    <CustomButton
                      title="Cancelar"
                      onPress={handleClose}
                      variant="outline"
                      style={styles.cancelButton}
                    />
                    <CustomButton
                      title="Transferir"
                      onPress={handleSubmit}
                      loading={isLoading}
                      disabled={!toCategory || amount <= 0}
                      style={styles.submitButton}
                    />
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={[
            styles.pickerContainer,
            { paddingBottom: Math.max(insets.bottom, 20) }
          ]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Selecionar Categoria</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableCategories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyListText}>
                  Nenhuma categoria disponível para transferência.
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
    // ✅ CORREÇÃO: Altura fixa removida para ser mais responsiva
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
    // ✅ CORREÇÃO: Garantir que o header não seja cortado
    backgroundColor: COLORS.white,
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
    // ✅ CORREÇÃO: Reduzir padding bottom
    paddingBottom: 10,
  },
  fromCategoryInfo: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  categoryInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: SIZES.radius,
  },
  colorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  // ✅ CORREÇÃO: Novo estilo para organizar melhor o conteúdo
  categoryInfoContent: {
    flex: 1,
  },
  categoryInfoName: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  categoryInfoBalance: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    marginTop: 2,
  },
  toCategorySection: {
    marginBottom: 20,
  },
  categoryPicker: {
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
  categoryPickerError: {
    borderColor: COLORS.error,
  },
  categoryPickerPlaceholder: {
    fontSize: SIZES.body2,
    color: COLORS.grayDark,
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
  },
  selectedCategoryBalance: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
  },
  errorText: {
    fontSize: SIZES.body4,
    color: COLORS.error,
    marginTop: 4,
  },
  // ✅ CORREÇÃO: Reduzir espaçamento extra
  extraSpace: {
    height: 20,
  },
  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
    // ✅ CORREÇÃO: Garantir que o footer seja sempre visível
    minHeight: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  // Category Picker Modal Styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  pickerTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 4,
  },
  categoryItemName: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryItemBalance: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    marginTop: 2,
  },
  emptyListText: {
    textAlign: 'center',
    marginVertical: 40,
    fontSize: SIZES.body3,
    color: COLORS.textLight,
  },
});