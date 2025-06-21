import { COLORS, SIZES } from '@/constants/Theme';
import { useGoals } from '@/hooks/useGoals';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const getGoalIcon = (goalName: string) => {
  const name = goalName.toLowerCase();
  if (name.includes('casa') || name.includes('apartamento')) return 'home-outline';
  if (name.includes('carro') || name.includes('moto')) return 'car-sport-outline';
  if (name.includes('viagem') || name.includes('férias')) return 'airplane-outline';
  if (name.includes('emergência') || name.includes('reserva')) return 'shield-outline';
  if (name.includes('educação') || name.includes('curso')) return 'school-outline';
  return 'flag-outline';
};

const AnimatedGoalContent: React.FC<{
  goal: any;
  remainingAmount: number;
  onMount: () => void;
}> = ({ goal, remainingAmount, onMount }) => {
  const progressAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);

  useEffect(() => {
    onMount();
    
    progressAnimation.value = withTiming(goal.progress / 100, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });

    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [goal.id]);

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnimation.value * 100}%`,
      backgroundColor: goal.color,
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnimation.value }],
    };
  });

  return (
    <Animated.View
      style={styles.goalContent}
      entering={SlideInRight.duration(500).easing(Easing.out(Easing.cubic))}
      exiting={SlideOutLeft.duration(300).easing(Easing.in(Easing.cubic))}
    >
      <View style={styles.leftColumn}>
        <Animated.View 
          style={[
            styles.iconContainer, 
            { backgroundColor: `${goal.color}20` },
            iconStyle
          ]}
        >
          <Ionicons 
            name={getGoalIcon(goal.name)} 
            size={32} 
            color={goal.color} 
          />
        </Animated.View>
        <Animated.Text 
          style={styles.title} 
          numberOfLines={1}
          entering={FadeIn.delay(200).duration(400)}
        >
          {goal.name}
        </Animated.Text>
        <Animated.Text 
          style={styles.subtitle}
          entering={FadeIn.delay(300).duration(400)}
        >
          {goal.progress.toFixed(1)}% concluído
        </Animated.Text>
      </View>
      
      <View style={styles.separator} />
      
      <View style={styles.rightColumn}>
        <Animated.View 
          style={styles.itemRow}
          entering={FadeIn.delay(400).duration(400)}
        >
          <Ionicons name="wallet-outline" size={22} color={COLORS.success} />
          <View style={styles.itemTextContainer}>
            <Text style={styles.itemTitle}>Valor Atual</Text>
            <Text style={styles.itemValue}>{formatCurrency(goal.current_amount)}</Text>
          </View>
        </Animated.View>
        
        <Animated.View 
          style={styles.itemRow}
          entering={FadeIn.delay(500).duration(400)}
        >
          <Ionicons name="trending-up-outline" size={22} color={COLORS.primary} />
          <View style={styles.itemTextContainer}>
            <Text style={styles.itemTitle}>
              {remainingAmount > 0 ? 'Falta Alcançar' : 'Meta Atingida!'}
            </Text>
            <Text style={[
              styles.itemValue, 
              { color: remainingAmount > 0 ? COLORS.primary : COLORS.success }
            ]}>
              {remainingAmount > 0 ? formatCurrency(remainingAmount) : '🎉'}
            </Text>
          </View>
        </Animated.View>

        <Animated.View 
          style={styles.progressContainer}
          entering={FadeIn.delay(600).duration(400)}
        >
          <View style={styles.progressBackground}>
            <Animated.View style={[styles.progressFill, progressBarStyle]} />
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const GoalIndicator: React.FC<{
  total: number;
  current: number;
}> = ({ total, current }) => {
  if (total <= 1) return null;

  return (
    <Animated.View 
      style={styles.indicatorContainer}
      entering={FadeIn.delay(800).duration(400)}
    >
      {Array.from({ length: total }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.indicator,
            index === current && styles.indicatorActive,
          ]}
        />
      ))}
    </Animated.View>
  );
};

export const RecentGoalsCard = () => {
  const { goals, statistics, isLoading } = useGoals();
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);


  const activeGoals = goals.filter(goal => goal.is_active && !goal.is_completed);

  useEffect(() => {
    if (activeGoals.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      cardScale.value = withSequence(
        withTiming(0.98, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );

      setTimeout(() => {
        setCurrentGoalIndex((prevIndex) => 
          (prevIndex + 1) % activeGoals.length
        );
        setIsTransitioning(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeGoals.length]);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
      opacity: cardOpacity.value,
    };
  });

  if (isLoading) {
    return (
      <Animated.View 
        style={[styles.container, styles.loadingContainer]}
        entering={FadeIn.duration(600)}
      >
        <View style={styles.leftColumn}>
          <Animated.View 
            style={styles.iconContainer}
            entering={FadeIn.duration(400)}
          >
            <Ionicons name="flag-outline" size={32} color={COLORS.primary} />
          </Animated.View>
          <Animated.Text 
            style={styles.title}
            entering={FadeIn.delay(200).duration(400)}
          >
            Carregando...
          </Animated.Text>
          <Animated.Text 
            style={styles.subtitle}
            entering={FadeIn.delay(300).duration(400)}
          >
            Objetivos
          </Animated.Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.rightColumn}>
          <Animated.Text 
            style={styles.loadingText}
            entering={FadeIn.delay(400).duration(400)}
          >
            Carregando dados...
          </Animated.Text>
        </View>
      </Animated.View>
    );
  }

  if (activeGoals.length === 0) {
    return (
      <Animated.View 
        style={styles.container}
        entering={FadeIn.duration(600)}
      >
        <View style={styles.leftColumn}>
          <Animated.View 
            style={styles.iconContainer}
            entering={FadeIn.duration(400)}
          >
            <Ionicons name="flag-outline" size={32} color={COLORS.primary} />
          </Animated.View>
          <Animated.Text 
            style={styles.title}
            entering={FadeIn.delay(200).duration(400)}
          >
            Meus Objetivos
          </Animated.Text>
          <Animated.Text 
            style={styles.subtitle}
            entering={FadeIn.delay(300).duration(400)}
          >
            Sem objetivos ativos
          </Animated.Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.rightColumn}>
          <Animated.View 
            style={styles.emptyState}
            entering={FadeIn.delay(400).duration(600)}
          >
            <Text style={styles.emptyText}>Crie seu primeiro objetivo</Text>
            <Text style={styles.emptySubtext}>e comece a poupar!</Text>
          </Animated.View>
        </View>
      </Animated.View>
    );
  }

  const currentGoal = activeGoals[currentGoalIndex];
  const remainingAmount = currentGoal.target_amount - currentGoal.current_amount;

  return (
    <Animated.View 
      style={[styles.container, cardAnimatedStyle]}
      entering={FadeIn.duration(800)}
    >
      <Animated.View 
        style={styles.headerContainer}
        entering={FadeIn.delay(100).duration(400)}
      >
        {activeGoals.length > 1 && (
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {currentGoalIndex + 1} de {activeGoals.length}
            </Text>
          </View>
        )}
        <GoalIndicator total={activeGoals.length} current={currentGoalIndex} />
      </Animated.View>

      <AnimatedGoalContent
        key={currentGoal.id}
        goal={currentGoal}
        remainingAmount={remainingAmount}
        onMount={() => {
        }}
      />

      {activeGoals.length === 1 && statistics && (
        <Animated.View 
          style={styles.statsRow}
          entering={FadeIn.delay(700).duration(600)}
        >
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.completed_goals}</Text>
            <Text style={styles.statLabel}>Concluídos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(statistics.total_saved)}</Text>
            <Text style={styles.statLabel}>Total Poupado</Text>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginTop: 20,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 160,
  },
  loadingContainer: {
    opacity: 0.8,
  },
  // ✅ NOVO: Header com contador
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 20,
  },
  counterContainer: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  counterText: {
    fontSize: SIZES.body4,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // ✅ NOVO: Indicadores de navegação
  indicatorContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.grayLight,
  },
  indicatorActive: {
    backgroundColor: COLORS.primary,
    width: 16,
  },
  // ✅ MELHORADO: Container principal do objetivo
  goalContent: {
    flexDirection: 'row',
    flex: 1,
  },
  leftColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: SIZES.body3,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 2,
  },
  separator: {
    width: 1,
    backgroundColor: COLORS.inputBorder,
    marginHorizontal: 16,
  },
  rightColumn: {
    flex: 1.5,
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  itemTitle: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
  },
  itemValue: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  progressBackground: {
    height: 6,
    backgroundColor: COLORS.grayLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.body4,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  loadingText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: SIZES.body4,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
});