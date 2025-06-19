// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// O 'name' aqui é uma string para maior flexibilidade com os nomes dos SFSymbols
type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Mapeamento de SF Symbols para Material Icons.
 */
const MAPPING: IconMapping = {
  // Ícones existentes
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',

  // --- ÍCONES ADICIONADOS PARA A BARRA DE NAVEGAÇÃO ---
  'chart.bar.fill': 'bar-chart',
  'arrow.up.arrow.down': 'swap-vert', // Ícone para o botão central
  'wallet.pass.fill': 'account-balance-wallet',
  'person.fill': 'person',

  // --- ÍCONES PARA GOALS ---
  'flag.fill': 'flag',
  'flag-outline': 'outlined-flag',
  'target': 'gps-fixed',
  'trophy.fill': 'emoji-events',
  'chart.line.uptrend.xyaxis': 'trending-up',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name];
  if (!iconName) {
    // Fallback para ícones não mapeados
    console.warn(`IconSymbol: Mapeamento não encontrado para o SF Symbol "${name}".`);
    return <MaterialIcons name="help-outline" size={size} color={color as string} style={style} />;
  }
  return <MaterialIcons name={iconName} size={size} color={color as string} style={style} />;
}