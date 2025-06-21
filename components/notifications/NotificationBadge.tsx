// components/notifications/NotificationBadge.tsx
import { COLORS } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  size = 'medium',
  animated = true 
}) => {
  const scale = useSharedValue(1);

  const getSizeValues = () => {
    switch (size) {
      case 'small':
        return { width: 16, height: 16, fontSize: 10, minWidth: 16 };
      case 'medium':
        return { width: 20, height: 20, fontSize: 12, minWidth: 20 };
      case 'large':
        return { width: 24, height: 24, fontSize: 14, minWidth: 24 };
      default:
        return { width: 20, height: 20, fontSize: 12, minWidth: 20 };
    }
  };

  const sizeValues = getSizeValues();

  React.useEffect(() => {
    if (animated && count > 0) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 200 }),
          withTiming(1, { duration: 200 })
        ),
        2,
        false
      );
    }
  }, [count, animated]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  if (count <= 0) return null;

  return (
    <Animated.View style={[
      styles.badge,
      {
        width: count > 99 ? sizeValues.minWidth + 10 : sizeValues.width,
        height: sizeValues.height,
        minWidth: sizeValues.minWidth,
      },
      animatedStyle
    ]}>
      <Text style={[styles.badgeText, { fontSize: sizeValues.fontSize }]}>
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -6,
    right: -6,
    borderWidth: 2,
    borderColor: COLORS.white,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  badgeText: {
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});