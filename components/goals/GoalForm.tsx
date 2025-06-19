// components/goals/GoalForm.tsx
import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { COLORS, SIZES } from '@/constants/Theme';
import { CreateGoalPayload, Goal } from '@/types/goals';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GoalFormProps {
  initialData?: Partial<Goal>;
  onSubmit: (data: CreateGoalPayload) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const PRESET_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export const GoalForm: React.FC<GoalFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}) => {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<CreateGoalPayload>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    target_amount: initialData?.target_amount || 0,
    monthly_target: initialData?.monthly_target || undefined,
    target_date: initialData?.target_date || undefined,
    color: initialData?.color || PRESET_COLORS[0],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Descrição deve ter no máximo 500 caracteres';
    }

    if (formData.target_amount <= 0) {
      newErrors.target_amount = 'Valor da meta deve ser maior que zero';
    }

    if (formData.monthly_target && formData.monthly_target < 0) {
      newErrors.monthly_target = 'Meta mensal deve ser maior ou igual a zero';
    }

    if (formData.target_date) {
      const targetDate = new Date(formData.target_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (targetDate < today) {
        newErrors.target_date = 'Data da meta deve ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const success = await onSubmit(formData);
    if (success) {
      onCancel(); // Fecha o formulário
    }
  };

  const formatDateInput = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  const handleDateChange = (value: string) => {
    const formattedDate = formatDateInput(value);
    if (formattedDate.length === 10) {
      const [day, month, year] = formattedDate.split('/');
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, target_date: isoDate }));
    } else {
      setFormData(prev => ({ ...prev, target_date: undefined }));
    }
    
    if (errors.target_date) {
      setErrors(prev => ({ ...prev, target_date: '' }));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header fixo */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEdit ? 'Editar Objetivo' : 'Novo Objetivo'}
        </Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo scrollável */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CustomInput
          label="Nome do Objetivo"
          placeholder="Ex: Viagem para Europa, Carro novo..."
          value={formData.name}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, name: value }));
            if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
          }}
          error={errors.name}
          maxLength={100}
        />

        <CustomInput
          label="Descrição (Opcional)"
          placeholder="Descreva seu objetivo..."
          value={formData.description}
          onChangeText={(value) => {
            setFormData(prev => ({ ...prev, description: value }));
            if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
          }}
          error={errors.description}
          multiline
          numberOfLines={3}
          maxLength={500}
          style={{ height: 80, textAlignVertical: 'top' }}
        />

        <CustomInput
          label="Valor da Meta (R$)"
          placeholder="0,00"
          value={formData.target_amount > 0 ? formData.target_amount.toString() : ''}
          onChangeText={(value) => {
            const numericValue = parseFloat(value.replace(',', '.')) || 0;
            setFormData(prev => ({ ...prev, target_amount: numericValue }));
            if (errors.target_amount) setErrors(prev => ({ ...prev, target_amount: '' }));
          }}
          error={errors.target_amount}
          keyboardType="numeric"
        />

        <CustomInput
          label="Meta Mensal (Opcional)"
          placeholder="0,00"
          value={formData.monthly_target ? formData.monthly_target.toString() : ''}
          onChangeText={(value) => {
            const numericValue = value ? parseFloat(value.replace(',', '.')) || 0 : undefined;
            setFormData(prev => ({ ...prev, monthly_target: numericValue }));
            if (errors.monthly_target) setErrors(prev => ({ ...prev, monthly_target: '' }));
          }}
          error={errors.monthly_target}
          keyboardType="numeric"
        />

        <CustomInput
          label="Data da Meta (Opcional)"
          placeholder="DD/MM/AAAA"
          value={formData.target_date ? new Date(formData.target_date).toLocaleDateString('pt-BR') : ''}
          onChangeText={handleDateChange}
          error={errors.target_date}
          keyboardType="numeric"
          maxLength={10}
        />

        <View style={styles.colorSection}>
          <Text style={styles.colorLabel}>Escolha uma cor:</Text>
          <View style={styles.colorContainer}>
            {PRESET_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  formData.color === color && styles.colorOptionSelected,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, color }))}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer fixo com botões */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Cancelar"
            onPress={onCancel}
            variant="outline"
            style={styles.cancelButton}
          />
          <CustomButton
            title={isEdit ? 'Atualizar' : 'Criar Objetivo'}
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
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
  closeButtonText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 20,
  },
  colorSection: {
    marginBottom: 24,
  },
  colorLabel: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    marginBottom: 12,
    fontWeight: '500',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: COLORS.text,
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