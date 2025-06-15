import { COLORS, SIZES } from '@/constants/Theme';
import React, { useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface CodeInputProps {
  length?: number;
  onCodeChange: (code: string) => void;
  error?: string;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  length = 6,
  onCodeChange,
  error,
}) => {
  const [code, setCode] = useState<string[]>(new Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChangeText = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Enviar código completo para o parent
    const fullCode = newCode.join('');
    onCodeChange(fullCode);

    // Mover para próximo input se não estiver vazio
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Código de Verificação</Text>
      <View style={styles.codeContainer}>
        {Array.from({ length }).map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref; }}
            style={[
              styles.codeInput,
              focusedIndex === index && styles.codeInputFocused,
              error && styles.codeInputError,
            ]}
            value={code[index]}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            onFocus={() => setFocusedIndex(index)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
          />
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    marginBottom: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  codeInput: {
    width: 45,
    height: 56,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: 'transparent',
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  codeInputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  codeInputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: SIZES.body4,
    color: COLORS.error,
    marginTop: 8,
    textAlign: 'center',
  },
});