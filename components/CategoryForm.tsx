import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { COLORS, SIZES } from '@/constants/Theme';
import { Category } from '@/types/budget';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CategoryFormProps {
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
  totalIncome: number;
}

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#F7B801',
  '#2AB7CA', '#FE4A49', '#54478C', '#83E8BA', '#2C5F2D'
];

export const CategoryForm: React.FC<CategoryFormProps> = ({
  categories,
  onCategoriesChange,
  totalIncome,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Category, 'id'>>({
    name: '',
    allocated_amount: 0,
    color: PRESET_COLORS[0],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated_amount, 0);
  const availableAmount = totalIncome - totalAllocated;

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) {
      newErrors.name = 'O nome da categoria é obrigatório.';
    }
    if (formData.allocated_amount <= 0) {
      newErrors.amount = 'O valor deve ser maior que zero.';
    } else if (formData.allocated_amount > availableAmount) {
      newErrors.amount = 'O valor não pode ser maior que a renda disponível.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCategory = () => {
    if (!validateForm()) return;

    const newCategory: Category = {
      ...formData,
      id: Date.now().toString(),
    };

    onCategoriesChange([...categories, newCategory]);
    setFormData({ name: '', allocated_amount: 0, color: PRESET_COLORS[0] });
    setShowForm(false);
    setErrors({});
  };

  const handleRemoveCategory = (id: string) => {
    onCategoriesChange(categories.filter((cat) => cat.id !== id));
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Categorias de Gastos 📊</Text>
      <Text style={styles.sectionSubtitle}>
        Distribua sua renda em diferentes categorias.
      </Text>
      
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Total Alocado:</Text>
        <Text style={styles.summaryValue}>{formatCurrency(totalAllocated)}</Text>
      </View>
       <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Disponível para Alocar:</Text>
        <Text style={styles.summaryValue}>{formatCurrency(availableAmount)}</Text>
      </View>

      {categories.map((category) => (
        <View key={category.id} style={styles.categoryItem}>
          <View style={[styles.colorIndicator, { backgroundColor: category.color }]} />
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryAmount}>{formatCurrency(category.allocated_amount)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleRemoveCategory(category.id!)}
            style={styles.removeButton}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      ))}

      {showForm && (
        <View style={styles.formContainer}>
          <CustomInput
            label="Nome da Categoria"
            placeholder="Ex: Moradia, Alimentação..."
            value={formData.name}
            onChangeText={(value) => {
              setFormData((prev) => ({ ...prev, name: value }));
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={errors.name}
          />
          <CustomInput
            label={`Valor Orçado (Disponível: ${formatCurrency(availableAmount)})`}
            placeholder="0,00"
            value={formData.allocated_amount > 0 ? formData.allocated_amount.toString() : ''}
            onChangeText={(value) => {
              const numericValue = parseFloat(value.replace(',', '.')) || 0;
              setFormData((prev) => ({ ...prev, allocated_amount: numericValue }));
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
            }}
            keyboardType="numeric"
            error={errors.amount}
          />
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
                onPress={() => setFormData((prev) => ({ ...prev, color }))}
              />
            ))}
          </View>
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
            <CustomButton
              title="Adicionar"
              onPress={handleAddCategory}
              style={styles.addButton}
            />
          </View>
        </View>
      )}

      {!showForm && availableAmount > 0 && (
        <TouchableOpacity
          style={styles.addCategoryButton}
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="add-circle" size={24} color={COLORS.primary} />
          <Text style={styles.addCategoryText}>Adicionar Categoria</Text>
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
    color: COLORS.gray,
    marginBottom: 10,
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: SIZES.radius,
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: SIZES.body3,
    color: COLORS.text,
  },
  summaryValue: {
    fontSize: SIZES.body3,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  categoryItem: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  colorIndicator: {
    width: 12,
    height: '100%',
    borderRadius: 6,
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: SIZES.body3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  categoryAmount: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  addCategoryText: {
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
  colorLabel: {
    fontSize: SIZES.body4,
    color: COLORS.gray,
    marginBottom: 8,
    marginTop: 8,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 10,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: COLORS.white,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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