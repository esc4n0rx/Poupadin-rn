// app/(tabs)/budget-setup.tsx
import { CategoryForm } from '@/components/CategoryForm';
import { CustomButton } from '@/components/CustomButton';
import { CustomStatusBar } from '@/components/CustomStatusBar';
import { IncomeForm } from '@/components/IncomeForm';
import { COLORS, SIZES } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { budgetService } from '@/services/budgetService';
import { BudgetSetupData, Category, Income } from '@/types/budget';
import { getErrorMessage } from '@/utils/errorHandler';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BudgetSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateSetupStatus } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated_amount, 0);

  const animateStep = (toStep: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(toStep);
    });
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (incomes.length === 0) {
        Alert.alert('Renda Necessária', 'Você precisa adicionar pelo menos uma fonte de renda para continuar.');
        return;
      }
      animateStep(2);
    } else if (currentStep === 2) {
      if (categories.length === 0) {
        Alert.alert('Categoria Necessária', 'Você precisa adicionar pelo menos uma categoria de gastos.');
        return;
      }
      animateStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      animateStep(currentStep - 1);
    }
  };

  const handleFinishSetup = async () => {
    if (totalAllocated > totalIncome) {
      Alert.alert('Erro no Orçamento', 'O valor total alocado nas categorias não pode ser maior que a sua renda total.');
      return;
    }

    if (!user) {
      Alert.alert('Erro', 'Usuário não encontrado. Por favor, faça login novamente.');
      return;
    }

    setIsLoading(true);

    const budgetData: BudgetSetupData = {
      name: `Orçamento de ${user.name}`,
      incomes: incomes.map(({ id, ...rest }) => rest),
      categories: categories.map(({ id, ...rest }) => rest),
    };

    try {
      await budgetService.setupBudget(budgetData);
      Alert.alert('Sucesso!', 'Seu orçamento foi configurado com sucesso.', [
        {
          text: 'OK',
          onPress: async () => {
            await updateSetupStatus();
            router.replace('/(tabs)');
          },
        },
      ]);
    } catch (error) {
      // ✅ CORREÇÃO: Agora o erro é exibido em um Alert.
      const errorMessage = getErrorMessage(error, 'Não foi possível finalizar a configuração.');
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Definir Rendas';
      case 2:
        return 'Criar Categorias';
      case 3:
        return 'Revisar Orçamento';
      default:
        return 'Configurar Orçamento';
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3].map((step, index) => (
        <React.Fragment key={step}>
          <View
            style={[
              styles.stepDot,
              currentStep >= step && styles.stepDotActive,
              currentStep === step && styles.stepDotCurrent,
            ]}
          >
            <Text style={[styles.stepText, currentStep >= step && styles.stepTextActive]}>
              {step}
            </Text>
          </View>
          {index < 2 && (
            <View style={[styles.stepLine, currentStep > step && styles.stepLineActive]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <IncomeForm incomes={incomes} onIncomesChange={setIncomes} />;
      case 2:
        return (
          <CategoryForm
            categories={categories}
            onCategoriesChange={setCategories}
            totalIncome={totalIncome}
          />
        );
      case 3:
        return (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Resumo do Orçamento</Text>

            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>💰 Rendas ({incomes.length})</Text>
              {incomes.map((income, index) => (
                <View key={index} style={styles.summaryItem}>
                  <Text style={styles.summaryItemLabel}>{income.description}</Text>
                  <Text style={styles.summaryItemValue}>
                    {income.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>📊 Categorias ({categories.length})</Text>
              {categories.map((category, index) => (
                <View key={index} style={styles.summaryItem}>
                  <View style={styles.categoryRow}>
                    <View style={[styles.colorDot, { backgroundColor: category.color }]} />
                    <Text style={styles.summaryItemLabel}>{category.name}</Text>
                  </View>
                  <Text style={styles.summaryItemValue}>
                    {category.allocated_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.totalBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Renda Total:</Text>
                <Text style={[styles.totalValue, { color: COLORS.success }]}>
                  {totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Alocado:</Text>
                <Text style={[styles.totalValue, { color: COLORS.error }]}>
                  {totalAllocated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Text>
              </View>
              <View style={[styles.totalRow, styles.remainingRow]}>
                <Text style={styles.totalLabel}>Sobra/Falta:</Text>
                <Text
                  style={[
                    styles.totalValue,
                    { color: totalIncome - totalAllocated >= 0 ? COLORS.success : COLORS.error },
                  ]}
                >
                  {(totalIncome - totalAllocated).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </Text>
              </View>
            </View>

            {totalAllocated > totalIncome && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ Atenção: Você alocou mais dinheiro do que sua renda total!
                </Text>
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Configurar Orçamento</Text>
        <Text style={styles.headerSubtitle}>{getStepTitle()}</Text>
        {renderStepIndicator()}
      </View>

      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
            {renderStepContent()}
          </Animated.View>
        </ScrollView>

        <View style={styles.navigation}>
          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <CustomButton
                title="Voltar"
                onPress={handlePreviousStep}
                variant="outline"
                style={styles.backButton}
              />
            )}

            {currentStep < 3 ? (
              <CustomButton
                title="Próximo"
                onPress={handleNextStep}
                style={
                  currentStep === 1
                    ? { ...styles.nextButton, ...styles.fullWidthButton }
                    : styles.nextButton
                }
                disabled={currentStep === 1 ? incomes.length === 0 : categories.length === 0}
              />
            ) : (
              <CustomButton
                title="Finalizar Setup"
                onPress={handleFinishSetup}
                loading={isLoading}
                style={
                  currentStep === 1
                    ? StyleSheet.flatten([styles.finishButton, styles.fullWidthButton])
                    : styles.finishButton
                }
                disabled={totalAllocated > totalIncome}
              />
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingBottom: 30,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: COLORS.white,
    fontSize: SIZES.body2,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 20,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  stepDotActive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
  },
  stepDotCurrent: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
    transform: [{ scale: 1.1 }],
  },
  stepText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
    fontSize: SIZES.body3,
  },
  stepTextActive: {
    color: COLORS.primary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
    maxWidth: 40,
  },
  stepLineActive: {
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: -15,
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingTop: 25,
    paddingBottom: 20,
    flexGrow: 1,
  },
  stepContent: {
    flex: 1,
    minHeight: 200,
  },
  navigation: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  finishButton: {
    flex: 2,
  },
  fullWidthButton: {
    flex: 1,
  },
  summaryContainer: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  summaryItemLabel: {
    fontSize: SIZES.body3,
    color: COLORS.text,
    flex: 1,
  },
  summaryItemValue: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.primary,
  },
  totalBox: {
    backgroundColor: COLORS.secondary,
    padding: 20,
    borderRadius: SIZES.radius,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  remainingRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
  },
  warningBox: {
    backgroundColor: COLORS.error,
    padding: 16,
    borderRadius: SIZES.radius,
    marginTop: 8,
  },
  warningText: {
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: SIZES.body3,
  },
});