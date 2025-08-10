import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.spec.ts', '**/*.spec.tsx'],
    reporters: ['default'],
    coverage: {
      reporter: ['text', 'lcov'],
      all: false
    }
  }
});