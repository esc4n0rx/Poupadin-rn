// app/(tabs)/stats.tsx
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function StatsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Estatísticas</ThemedText>
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