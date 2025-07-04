// components/CustomStatusBar.tsx
import React from 'react';
import { Platform, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomStatusBarProps {
  backgroundColor: string;
  barStyle?: 'light-content' | 'dark-content';
}

export const CustomStatusBar: React.FC<CustomStatusBarProps> = ({
  backgroundColor,
  barStyle = 'light-content',
}) => {
  const insets = useSafeAreaInsets();
  if (Platform.OS === 'android') {
    return (
      <StatusBar 
        backgroundColor={backgroundColor} 
        barStyle={barStyle}
        translucent={false} 
      />
    );
  }

  return (
    <View style={{ height: insets.top, backgroundColor }}>
      <StatusBar 
        backgroundColor={backgroundColor}
        barStyle={barStyle} 
      />
    </View>
  );
};