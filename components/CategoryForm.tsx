// components/CategoryForm.tsx
import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { COLORS, SIZES } from '@/constants/Theme';
import { Category } from '@/types/budget';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CategoryFormProps {
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
  totalIncome: number;
}

const PREDEFINED_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
];

export const CategoryForm: React.FC<CategoryFormProps> = ({
  categories,
  onCategoriesChange,
  totalIncome,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Category>({
    name: '',
    allocated_amount: 0,
    color: PREDEFINED_COLORS[0],
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

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated_amount, 0);
  const availableAmount = totalIncome - totalAllocated;

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (formData.allocated_amount < 0) {
      newErrors.allocated_amount = 'Valor deve ser maior ou igual a zero';
    }

    if (formData.allocated_amount > availableAmount) {
      newErrors.allocated_amount = `Valor não pode exceder R$ ${availableAmount.toFixed(2)} disponível`;
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
    setFormData({
      name: '',
      allocated_amount: 0,
      color: PREDEFINED_COLORS[categories.length % PREDEFINED_COLORS.length],
    });
    setShowForm(false);
    setErrors({});
  };

  const handleRemoveCategory = (id: string) => {
    onCategoriesChange(categories.filter(cat => cat.id !== id));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Categorias de Gastos 📊</Text>
      <Text style={styles.sectionSubtitle}>
        Organize seus gastos em categorias e defina quanto deseja gastar em cada uma
      </Text>

      {/* Resumo financeiro */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Renda Total</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalIncome)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Alocado</Text>
          <Text style={[styles.summaryValue, { color: COLORS.error }]}>
            {formatCurrency(totalAllocated)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Disponível</Text>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>
            {formatCurrency(availableAmount)}
          </Text>
        </View>
      </View>

      {/* Lista de categorias existentes */}
      {categories.map((category) => (
        <Animated.View
          key={category.id}
          style={[
            styles.categoryItem,
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
          <View style={styles.categoryInfo}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
            <Text style={styles.categoryAmount}>
              {formatCurrency(category.allocated_amount)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleRemoveCategory(category.id!)}
            style={styles.removeButton}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </Animated.View>
      ))}

      {/* Formulário para adicionar nova categoria */}
      {showForm && (
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: slideAnim,
              height: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 350],
              }),
            },
          ]}
        >
          <CustomInput
            label="Nome da Categoria"
            placeholder="Ex: Alimentação, Transporte, Lazer..."
            value={formData.name}
            onChangeText={(value) => {
              setFormData(prev => ({ ...prev, name: value }));
              setErrors(prev => ({ ...prev, name: '' }));
            }}
            error={errors.name}
          />

          <CustomInput
            label={`Valor Orçado (Disponível: ${formatCurrency(availableAmount)})`}
            placeholder="0,00"
            value={formData.allocated_amount > 0 ? formData.allocated_amount.toString() : ''}
            onChangeText={(value) => {
              const numericValue = parseFloat(value.replace(',', '.')) || 0;
              setFormData(prev => ({ ...prev, allocated_amount: numericValue }));
              setErrors(prev => ({ ...prev, allocated_amount: '' }));
            }}
            keyboardType="numeric"
            error={errors.allocated_amount}
          />

          <Text style={styles.colorLabel}>Escolha uma cor:</Text>
          <View style={styles.colorContainer}>
            {PREDEFINED_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  formData.color === color && styles.selectedColor,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, color }))}
              >
                {formData.color === color && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formButtons}>
            <CustomButton
              title="Cancelar"
              onPress={() => {
                setShowForm(false);
                setFormData({
                  name: '',
                  allocated_amount: 0,
                  color: PREDEFINED_COLORS[0],
                });
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
        </Animated.View>
      )}

      {/* Botão para mostrar formulário */}
      {!showForm && (
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: SIZES.body2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  categoryItem: {
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
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryName: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryAmount: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.primary,
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
  colorLabel: {
    fontSize: SIZES.body3,
    color: COLORS.text,
    marginBottom: 12,
    fontWeight: '500',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: COLORS.text,
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
  addCategoryButton: {
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
 addCategoryText: {
   fontSize: SIZES.body2,
   color: COLORS.primary,
   fontWeight: '600',
   marginLeft: 8,
 },
});