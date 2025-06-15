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
    KeyboardAvoidingView, // Adicionado
    Platform, // Adicionado
    ScrollView,
    StyleSheet,
    Text,
    View
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
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(toStep);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNextStep = () => {
    if (currentStep === 1 && incomes.length === 0) {
      Alert.alert('Renda Necessária', 'Você precisa adicionar pelo menos uma fonte de renda para continuar.');
      return;
    }
    if (currentStep === 2 && categories.length === 0) {
      Alert.alert('Categoria Necessária', 'Você precisa adicionar pelo menos uma categoria de gastos.');
      return;
    }
    if (currentStep < 3) {
      animateStep(currentStep + 1);
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
        incomes: incomes.map(({ id, ...rest }) => rest), // Remove ID temporário do frontend
        categories: categories.map(({ id, ...rest }) => rest),
        name: ''
    };

    try {
      budgetService.setupBudget(budgetData);
      Alert.alert('Sucesso!', 'Seu orçamento foi configurado com sucesso.');
      await updateSetupStatus();
      router.replace('/(tabs)');
    } catch (error) {
      getErrorMessage(error, 'Não foi possível finalizar a configuração.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <View style={[styles.stepDot, currentStep >= step && styles.stepDotActive]}>
            <Text style={[styles.stepText, currentStep >= step && styles.stepTextActive]}>{step}</Text>
          </View>
          {step < 3 && <View style={[styles.stepLine, currentStep > step && styles.stepLineActive]} />}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <IncomeForm incomes={incomes} onIncomesChange={setIncomes} />
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <CategoryForm
        categories={categories}
        onCategoriesChange={setCategories}
        totalIncome={totalIncome}
      />
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View style={[styles.summaryContainer, { opacity: fadeAnim }]}>
      <Text style={styles.summaryTitle}>Resumo do Orçamento</Text>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Renda Total Mensal:</Text>
        <Text style={styles.summaryValueIncome}>
          {totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
      </View>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Total Alocado nas Categorias:</Text>
        <Text style={styles.summaryValueAllocated}>
          {totalAllocated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
      </View>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Valor Restante:</Text>
        <Text style={styles.summaryValueRemaining}>
          {(totalIncome - totalAllocated).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
      </View>
      {totalAllocated > totalIncome && (
        <Text style={styles.warningText}>Atenção: Você alocou mais dinheiro do que sua renda!</Text>
      )}
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Configurar Orçamento</Text>
        {renderStepIndicator()}
      </View>

      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>

        <View style={styles.navigation}>
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
              style={styles.nextButton}
            />
          ) : (
            <CustomButton
              title="Finalizar Setup"
              onPress={handleFinishSetup}
              loading={isLoading}
              style={styles.finishButton}
            />
          )}
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
    paddingBottom: 40,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.white,
  },
  stepText: {
    color: COLORS.gray,
    fontWeight: 'bold',
  },
  stepTextActive: {
    color: COLORS.white,
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: COLORS.gray,
    marginHorizontal: -2,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: -20,
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingTop: 30,
    paddingBottom: 20,
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    gap: 12,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
    marginLeft: 'auto',
  },
  finishButton: {
    flex: 2,
    marginLeft: 'auto',
  },
  summaryContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  summaryTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryBox: {
    backgroundColor: COLORS.secondary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: SIZES.body3,
    color: COLORS.text,
  },
  summaryValueIncome: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  summaryValueAllocated: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  summaryValueRemaining: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  warningText: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
});