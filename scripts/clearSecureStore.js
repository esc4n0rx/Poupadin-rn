#!/usr/bin/env node

/**
 * Script para limpar o SecureStore durante desenvolvimento
 * Execute: node scripts/clearSecureStore.js
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('🧹 Script para limpar SecureStore');
console.log('⚠️  ATENÇÃO: Isso irá deslogar todos os usuários do app');

rl.question('Deseja continuar? (s/N): ', (answer) => {
  if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
    try {
      console.log('🔄 Limpando cache do Expo...');
      execSync('npx expo start -c', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error.message);
      console.log('\n📱 Para limpar manualmente:');
      console.log('1. Desinstale o app do dispositivo/simulador');
      console.log('2. Execute: npx expo start -c');
      console.log('3. Reinstale o app');
    }
  } else {
    console.log('❌ Operação cancelada');
  }
  rl.close();
});