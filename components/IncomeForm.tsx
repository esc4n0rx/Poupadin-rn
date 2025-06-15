import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { COLORS, SIZES } from '@/constants/Theme';
import { Income } from '@/types/budget';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.description) {
      newErrors.description = 'A descrição é obrigatória.';
    }
    if (formData.amount <= 0) {
      newErrors.amount = 'O valor deve ser maior que zero.';
    }
    if (formData.receive_day < 1 || formData.receive_day > 31) {
      newErrors.receive_day = 'O dia deve ser entre 1 e 31.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddIncome = () => {
    if (!validateForm()) return;

    const newIncome: Income = {
      ...formData,
      id: Date.now().toString(), // ID temporário para a lista no frontend
    };

    onIncomesChange([...incomes, newIncome]);
    setFormData({ description: '', amount: 0, receive_day: 1 });
    setShowForm(false);
    setErrors({});
  };

  const handleRemoveIncome = (id: string) => {
    onIncomesChange(incomes.filter((income) => income.id !== id));
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Suas Rendas 💰</Text>
      <Text style={styles.sectionSubtitle}>
        Adicione todas as suas fontes de renda mensais.
      </Text>

      {incomes.map((income) => (
        <View key={income.id} style={styles.incomeItem}>
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
        </View>
      ))}

      {showForm && (
        <View style={styles.formContainer}>
          <CustomInput
            label="Descrição da Renda"
            placeholder="Ex: Salário, Freelance, Aluguel..."
            value={formData.description}
            onChangeText={(value) => {
              setFormData((prev) => ({ ...prev, description: value }));
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            error={errors.description}
          />
          <CustomInput
            label="Valor"
            placeholder="0,00"
            value={formData.amount > 0 ? formData.amount.toString() : ''}
            onChangeText={(value) => {
              const numericValue = parseFloat(value.replace(',', '.')) || 0;
              setFormData((prev) => ({ ...prev, amount: numericValue }));
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
            }}
            keyboardType="numeric"
            error={errors.amount}
          />
          <CustomInput
            label="Dia do Recebimento"
            placeholder="1"
            value={formData.receive_day.toString()}
            onChangeText={(value) => {
              const numericValue = parseInt(value, 10) || 1;
              setFormData((prev) => ({ ...prev, receive_day: numericValue }));
              if (errors.receive_day) setErrors((prev) => ({ ...prev, receive_day: '' }));
            }}
            keyboardType="numeric"
            error={errors.receive_day}
          />
          <View style={styles.formButtons}>
            <CustomButton
              title="Cancelar"
              onPress={() => {
                setShowForm(false);
                setErrors({});
              }}
              variant="outline"
              style={styles.cancelButton}
            />
            <CustomButton title="Adicionar" onPress={handleAddIncome} style={styles.addButton} />
          </View>
        </View>
      )}

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
    marginBottom: SIZES.padding * 2,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  incomeItem: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  incomeInfo: {
    flex: 1,
  },
  incomeDescription: {
    fontSize: SIZES.body3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  incomeAmount: {
    fontSize: SIZES.body3,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 4,
  },
  incomeDay: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  addIncomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  addIncomeText: {
    marginLeft: 8,
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: SIZES.body3,
  },
  formContainer: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  addButton: {
    flex: 1,
  },
});