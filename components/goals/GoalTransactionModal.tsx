// components/goals/GoalTransactionModal.tsx
import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { COLORS, SIZES } from '@/constants/Theme';
import { Goal, GoalTransactionPayload } from '@/types/goals';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
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

interface GoalTransactionModalProps {
  visible: boolean;
  goal: Goal | null;
  onClose: () => void;
  onSubmit: (data: GoalTransactionPayload) => Promise<boolean>;
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const GoalTransactionModal: React.FC<GoalTransactionModalProps> = ({
  visible,
  goal,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const resetForm = () => {
    setTransactionType('deposit');
    setAmount(0);
    setDescription('');
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (transactionType === 'withdrawal' && goal && amount > goal.current_amount) {
      newErrors.amount = 'Valor não pode ser maior que o saldo atual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!goal || !validateForm()) return;

    const transactionData: GoalTransactionPayload = {
      goal_id: goal.id,
      transaction_type: transactionType,
      amount,
      description: description.trim() || undefined,
    };

    const success = await onSubmit(transactionData);
    if (success) {
      resetForm();
      onClose();
    }
  };

  const handleClose = () => {
    Keyboard.dismiss(); // ✅ Dismiss do teclado ao fechar
    resetForm();
    onClose();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss(); // ✅ Função para dispensar teclado
  };

  if (!goal) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      {/* ✅ TouchableWithoutFeedback para dismiss do teclado */}
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView 
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            {/* ✅ Área não-tocável para não fechar o modal */}
            <TouchableWithoutFeedback>
              <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
                {/* Header fixo */}
                <View style={styles.header}>
                  <Text style={styles.title}>Transação</Text>
                  <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>

                {/* Conteúdo scrollável */}
                <ScrollView 
                  style={styles.scrollContainer}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  bounces={false}
                >
                  <View style={styles.goalInfo}>
                    <View style={[styles.colorIndicator, { backgroundColor: goal.color }]} />
                    <View>
                      <Text style={styles.goalName}>{goal.name}</Text>
                      <Text style={styles.goalAmount}>
                        Atual: {formatCurrency(goal.current_amount)} de {formatCurrency(goal.target_amount)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.typeSelector}>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        transactionType === 'deposit' && styles.typeButtonActive,
                      ]}
                      onPress={() => setTransactionType('deposit')}
                    >
                      <Ionicons 
                        name="add-circle-outline" 
                        size={20} 
                        color={transactionType === 'deposit' ? COLORS.white : COLORS.success} 
                      />
                      <Text style={[
                        styles.typeButtonText,
                        transactionType === 'deposit' && styles.typeButtonTextActive,
                      ]}>
                        Depósito
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        transactionType === 'withdrawal' && styles.typeButtonActive,
                      ]}
                      onPress={() => setTransactionType('withdrawal')}
                    >
                      <Ionicons 
                        name="remove-circle-outline" 
                        size={20} 
                        color={transactionType === 'withdrawal' ? COLORS.white : COLORS.error} 
                      />
                      <Text style={[
                        styles.typeButtonText,
                        transactionType === 'withdrawal' && styles.typeButtonTextActive,
                      ]}>
                        Saque
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <CustomInput
                    label="Valor (R$)"
                    placeholder="0,00"
                    value={amount > 0 ? amount.toString() : ''}
                    onChangeText={(value) => {
                      const numericValue = parseFloat(value.replace(',', '.')) || 0;
                      setAmount(numericValue);
                      if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                    }}
                    error={errors.amount}
                    keyboardType="numeric"
                    leftIcon="cash-outline"
                    returnKeyType="next" // ✅ Configuração do teclado
                    onSubmitEditing={dismissKeyboard} // ✅ Dismiss ao pressionar enter
                  />

                  <CustomInput
                    label="Descrição (Opcional)"
                    placeholder="Ex: Mesada, venda de item..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    style={{ height: 80, textAlignVertical: 'top' }}
                    returnKeyType="done" // ✅ Configuração do teclado
                    onSubmitEditing={dismissKeyboard} // ✅ Dismiss ao pressionar done
                  />

                  {/* ✅ Espaçamento extra para o teclado */}
                  <View style={styles.extraSpace} />
                </ScrollView>

                {/* Footer fixo com botões */}
                <View style={styles.footer}>
                  <View style={styles.buttonContainer}>
                    <CustomButton
                      title="Cancelar"
                      onPress={handleClose}
                      variant="outline"
                      style={styles.cancelButton}
                    />
                    <CustomButton
                      title={transactionType === 'deposit' ? 'Depositar' : 'Sacar'}
                      onPress={handleSubmit}
                      loading={isLoading}
                      style={styles.submitButton}
                    />
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
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
    maxHeight: '90%', // ✅ Limita altura máxima
    minHeight: '60%', // ✅ Altura mínima para garantir espaço
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
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
    paddingBottom: 20,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 20,
  },
  colorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  goalName: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  goalAmount: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    marginTop: 2,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.text,
  },
  typeButtonTextActive: {
    color: COLORS.white,
  },
  extraSpace: {
    height: 100, // ✅ Espaçamento extra para o teclado
  },
  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
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
});