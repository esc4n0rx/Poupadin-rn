import { AuthProvider } from '@/contexts/AuthContext';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="reset-code" />
        <Stack.Screen name="new-password" />
      </Stack>
    </AuthProvider>
  );
}