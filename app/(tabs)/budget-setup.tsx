// app/(tabs)/budget-setup.tsx
import { CategoryForm } from '@/components/CategoryForm';
import { CustomButton } from '@/components/CustomButton';
import { CustomStatusBar } from '@/components/CustomStatusBar';
import { IncomeForm } from '@/components/IncomeForm';
import { COLORS, SIZES } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { budgetService } from '@/services/budgetService';
import { BudgetSetupData, Category, Income } from '@/types/budget';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BudgetSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, checkSetupStatus } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(0);

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated_amount, 0);

  const animateStep = (toStep: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: toStep === 1 ? 0 : toStep === 2 ? -1 : -2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setCurrentStep(toStep);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (incomes.length === 0) {
        Alert.alert('Atenção', 'Adicione pelo menos uma fonte de renda para continuar.');
        return;
      }
      animateStep(2);
    } else if (currentStep === 2) {
      if (categories.length === 0) {
        Alert.alert('Atenção', 'Adicione pelo menos uma categoria de gastos para continuar.');
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
  if (categories.length === 0) {
    Alert.alert('Atenção', 'Adicione pelo menos uma categoria de gastos.');
    return;
  }

  setIsLoading(true);
  try {
    const setupData: BudgetSetupData = {
      name: `Orçamento de ${user?.fullName}`,
      incomes: incomes.map(income => ({
        description: income.description,
        amount: income.amount,
        receive_day: income.receive_day,
      })),
      categories: categories.map(category => ({
        name: category.name,
        allocated_amount: category.allocated_amount,
        color: category.color,
      })),
    };

    // ⚠️ USAR API REAL
    const response = await budgetService.createInitialBudget(setupData);
    
    Alert.alert(
      'Parabéns! 🎉',
      response.message || 'Seu orçamento foi criado com sucesso! Agora você pode começar a controlar suas finanças.',
      [
        {
          text: 'Continuar',
          onPress: () => {
            checkSetupStatus();
            router.replace('/(tabs)');
          }
        }
      ]
    );
  } catch (error) {
    Alert.alert('Erro', error instanceof Error ? error.message : 'Erro ao criar orçamento');
  } finally {
    setIsLoading(false);
  }
};

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep >= step && styles.stepCircleActive,
          ]}>
            <Text style={[
              styles.stepNumber,
              currentStep >= step && styles.stepNumberActive,
            ]}>
              {step}
            </Text>
          </View>
          <Text style={[
            styles.stepLabel,
            currentStep >= step && styles.stepLabelActive,
          ]}>
            {step === 1 ? 'Rendas' : step === 2 ? 'Categorias' : 'Revisão'}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Vamos começar! 🚀</Text>
        <Text style={styles.stepDescription}>
          Primeiro, me conte sobre suas fontes de renda mensais
        </Text>
      </View>
      
      <IncomeForm
        incomes={incomes}
        onIncomesChange={setIncomes}
      />

      {incomes.length > 0 && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Renda Total Mensal</Text>
          <Text style={styles.summaryAmount}>
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalIncome)}
          </Text>
        </View>
      )}
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Ótimo! 📊</Text>
        <Text style={styles.stepDescription}>
          Agora vamos organizar seus gastos em categorias
        </Text>
      </View>
      
      <CategoryForm
        categories={categories}
        onCategoriesChange={setCategories}
        totalIncome={totalIncome}
      />
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Quase lá! 🎯</Text>
        <Text style={styles.stepDescription}>
          Revise seu orçamento antes de finalizar
        </Text>
      </View>

      <View style={styles.reviewContainer}>
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>💰 Rendas ({incomes.length})</Text>
          {incomes.map((income) => (
            <View key={income.id} style={styles.reviewItem}>
              <Text style={styles.reviewItemName}>{income.description}</Text>
              <Text style={styles.reviewItemValue}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(income.amount)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>📊 Categorias ({categories.length})</Text>
          {categories.map((category) => (
            <View key={category.id} style={styles.reviewItem}>
              <View style={styles.reviewItemNameContainer}>
                <View style={[styles.categoryColorDot, { backgroundColor: category.color }]} />
                <Text style={styles.reviewItemName}>{category.name}</Text>
              </View>
              <Text style={styles.reviewItemValue}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(category.allocated_amount)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.finalSummary}>
          <View style={styles.finalSummaryItem}>
            <Text style={styles.finalSummaryLabel}>Renda Total</Text>
            <Text style={styles.finalSummaryValue}>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(totalIncome)}
            </Text>
          </View>
          <View style={styles.finalSummaryItem}>
            <Text style={styles.finalSummaryLabel}>Total Alocado</Text>
            <Text style={[styles.finalSummaryValue, { color: COLORS.error }]}>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(totalAllocated)}
            </Text>
          </View>
          <View style={styles.finalSummaryItem}>
            <Text style={styles.finalSummaryLabel}>Sobra/Reserva</Text>
            <Text style={[styles.finalSummaryValue, { color: COLORS.success }]}>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(totalIncome - totalAllocated)}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Configurar Orçamento</Text>
        {renderStepIndicator()}
      </View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.scrollContainer,
            {
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [-2, -1, 0],
                  outputRange: [0, 0, 0],
                }),
              }],
            },
          ]}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </ScrollView>
        </Animated.View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 30,
    paddingHorizontal: SIZES.paddingHorizontal,
    borderBottomLeftRadius: SIZES.radiusLarge,
    borderBottomRightRadius: SIZES.radiusLarge,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    opacity: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    opacity: 1,
    backgroundColor: COLORS.white,
  },
  stepNumber: {
    fontSize: SIZES.body2,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  stepNumberActive: {
    color: COLORS.primary,
  },
  stepLabel: {
    fontSize: SIZES.body4,
    color: COLORS.white,
    opacity: 0.7,
  },
  stepLabelActive: {
    opacity: 1,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: -20,
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingTop: 30,
    paddingBottom: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    marginBottom: 30,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  summaryBox: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: SIZES.body2,
    color: COLORS.white,
    marginBottom: 8,
    opacity: 0.9,
  },
  summaryAmount: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  reviewContainer: {
    gap: 20,
  },
  reviewSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewSectionTitle: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  reviewItemNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  reviewItemName: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    flex: 1,
  },
  reviewItemValue: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.primary,
  },
  finalSummary: {
    backgroundColor: COLORS.secondary,
    padding: 20,
    borderRadius: SIZES.radius,
    gap: 12,
  },
  finalSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finalSummaryLabel: {
    fontSize: SIZES.body1,
    color: COLORS.text,
    fontWeight: '500',
  },
  finalSummaryValue: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingVertical: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  finishButton: {
    flex: 1,
  },
});