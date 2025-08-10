// @ts-check
import eslint from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Global ignores replace .eslintignore in flat config
  { ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.pnpm/**', '**/build/**', '**/playwright-report/**', '**/test-results/**'] },

  // Base JS rules
  eslint.configs.recommended,

  // TypeScript rules, including type-aware rules
  tseslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        // use the project service for multi-tsconfig monorepos
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },

  // Repo-wide rules for TS, TSX, JS
  {
    files: ['**/*.{ts,tsx,js,mjs,cjs}'],
    plugins: {
      import: pluginImport,
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'jsx-a11y': jsxA11y
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      // React basics
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Imports hygiene
      'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } }],
      // monorepo TS paths are resolved by TS, not ESLint
      'import/no-unresolved': 'off',

      // a11y starter
      'jsx-a11y/alt-text': 'warn'
    }
  },

  // Optionally relax type-aware linting for config and scripts
  tseslint.config({
    files: ['**/*.config.{js,cjs,mjs}', '**/vitest.config.{ts,js}', '**/vite.config.{ts,js}', '**/scripts/**/*.{ts,js}', 'test-config/**/*.{ts,cts,mts}'],
    extends: [tseslint.configs.disableTypeChecked]
  })
);