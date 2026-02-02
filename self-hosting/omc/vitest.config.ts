import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test-helpers/setup.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: ['dist/**', 'node_modules/**', '**/*.test.ts']
    }
  },
  resolve: {
    alias: {
      '@lib': resolve(__dirname, './src/lib'),
      '@storage': resolve(__dirname, './src/storage'),
      '@analysis': resolve(__dirname, './src/analysis'),
      '@generation': resolve(__dirname, './src/generation'),
      '@publishing': resolve(__dirname, './src/publishing'),
      '@workflows': resolve(__dirname, './src/workflows'),
      '@utils': resolve(__dirname, './src/utils'),
      '@omc-types': resolve(__dirname, './src/types'),
      '@commands': resolve(__dirname, './src/commands')
    }
  }
});
