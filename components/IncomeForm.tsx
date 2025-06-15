// components/IncomeForm.tsx
import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { COLORS, SIZES } from '@/constants/Theme';
import { Income } from '@/types/budget';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface IncomeFormProps {
  incomes: Income[];
  onIncomesChange: (incomes: Income[]) => void;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({
  incomes,
  onIncomesChange,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Income>({
    description: '',
    amount: 0,
    receive_day: 1,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const slideAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showForm ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showForm]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.description.trim() || formData.description.length < 3) {
      newErrors.description = 'Descrição deve ter pelo menos 3 caracteres';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.receive_day || formData.receive_day < 1 || formData.receive_day > 31) {
      newErrors.receive_day = 'Dia deve estar entre 1 e 31';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddIncome = () => {
    if (!validateForm()) return;

    const newIncome: Income = {
      ...formData,
      id: Date.now().toString(),
    };

    onIncomesChange([...incomes, newIncome]);
    setFormData({ description: '', amount: 0, receive_day: 1 });
    setShowForm(false);
    setErrors({});
  };

  const handleRemoveIncome = (id: string) => {
    onIncomesChange(incomes.filter(income => income.id !== id));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Suas Rendas 💰</Text>
      <Text style={styles.sectionSubtitle}>
        Adicione todas as suas fontes de renda mensais
      </Text>

      {/* Lista de rendas existentes */}
      {incomes.map((income) => (
        <Animated.View
          key={income.id}
          style={[
            styles.incomeItem,
            {
              opacity: slideAnim,
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              }],
            },
          ]}
        >
          <View style={styles.incomeInfo}>
            <Text style={styles.incomeDescription}>{income.description}</Text>
            <Text style={styles.incomeAmount}>{formatCurrency(income.amount)}</Text>
            <Text style={styles.incomeDay}>Recebimento: dia {income.receive_day}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleRemoveIncome(income.id!)}
            style={styles.removeButton}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </Animated.View>
      ))}

      {/* Formulário para adicionar nova renda */}
      {showForm && (
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: slideAnim,
              height: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 280],
              }),
            },
          ]}
        >
          <CustomInput
            label="Descrição da Renda"
            placeholder="Ex: Salário, Freelance, Aluguel..."
            value={formData.description}
            onChangeText={(value) => {
              setFormData(prev => ({ ...prev, description: value }));
              setErrors(prev => ({ ...prev, description: '' }));
            }}
            error={errors.description}
          />

          <CustomInput
            label="Valor"
            placeholder="0,00"
            value={formData.amount > 0 ? formData.amount.toString() : ''}
            onChangeText={(value) => {
              const numericValue = parseFloat(value.replace(',', '.')) || 0;
              setFormData(prev => ({ ...prev, amount: numericValue }));
              setErrors(prev => ({ ...prev, amount: '' }));
            }}
            keyboardType="numeric"
            error={errors.amount}
          />

          <CustomInput
            label="Dia do Recebimento"
            placeholder="1"
            value={formData.receive_day.toString()}
            onChangeText={(value) => {
              const numericValue = parseInt(value) || 1;
              setFormData(prev => ({ ...prev, receive_day: numericValue }));
              setErrors(prev => ({ ...prev, receive_day: '' }));
            }}
            keyboardType="numeric"
            error={errors.receive_day}
          />

          <View style={styles.formButtons}>
            <CustomButton
              title="Cancelar"
              onPress={() => {
                setShowForm(false);
                setFormData({ description: '', amount: 0, receive_day: 1 });
                setErrors({});
              }}
              variant="outline"
              style={styles.cancelButton}
            />
            <CustomButton
              title="Adicionar"
              onPress={handleAddIncome}
              style={styles.addButton}
            />
          </View>
        </Animated.View>
      )}

      {/* Botão para mostrar formulário */}
      {!showForm && (
        <TouchableOpacity
          style={styles.addIncomeButton}
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="add-circle" size={24} color={COLORS.primary} />
          <Text style={styles.addIncomeText}>Adicionar Renda</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  incomeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incomeInfo: {
    flex: 1,
  },
  incomeDescription: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  incomeAmount: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 2,
  },
  incomeDay: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
  },
  removeButton: {
    padding: 8,
  },
  formContainer: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 12,
    overflow: 'hidden',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  addButton: {
    flex: 1,
  },
  addIncomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addIncomeText: {
    fontSize: SIZES.body2,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
});