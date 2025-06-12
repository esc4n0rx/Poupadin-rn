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

  return (
    <>
      <StatusBar 
        backgroundColor={backgroundColor} 
        barStyle={barStyle}
        translucent={true}
      />
      {/* Para iOS, criar uma view que preenche a área da status bar */}
      {Platform.OS === 'ios' && (
        <View 
          style={{
            height: insets.top,
            backgroundColor: backgroundColor,
          }} 
        />
      )}
    </>
  );
};