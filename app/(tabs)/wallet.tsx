// app/(tabs)/wallet.tsx
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function WalletScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Carteira</ThemedText>
      <ThemedText>Em breve...</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});