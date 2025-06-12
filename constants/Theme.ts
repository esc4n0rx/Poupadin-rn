import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#1DD1A1',
  primaryDark: '#00A085',
  secondary: '#E8F8F5',
  background: '#F0F4F3',
  white: '#FFFFFF',
  black: '#2C3E50',
  gray: '#95A5A6',
  grayLight: '#BDC3C7',
  grayDark: '#7F8C8D',
  error: '#E74C3C',
  success: '#27AE60',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  inputBackground: '#E8F5E8',
  inputBorder: '#D5E8D4',
};

export const SIZES = {
  width,
  height,
  // Padding
  padding: 20,
  paddingHorizontal: 20,
  paddingVertical: 15,
  
  // Margin
  margin: 20,
  marginHorizontal: 20,
  marginVertical: 15,
  
  // Font sizes
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  body1: 18,
  body2: 16,
  body3: 14,
  body4: 12,
  
  // Border radius
  radius: 12,
  radiusLarge: 20,
  radiusSmall: 8,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};