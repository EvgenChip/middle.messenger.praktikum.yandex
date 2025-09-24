import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/*.js'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        localStorage: 'readonly',
        // DOM Types
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLFormElement: 'readonly',
        Event: 'readonly',
        KeyboardEvent: 'readonly',
        MessageEvent: 'readonly',
        CloseEvent: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        XMLHttpRequest: 'readonly',
        WebSocket: 'readonly',
        URL: 'readonly',
        Node: 'readonly',
        // Block class
        Block: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'warn', // Предупреждение вместо ошибки
      'no-empty': 'warn',
      'no-useless-catch': 'off',
      'no-unreachable': 'warn',
      'no-async-promise-executor': 'off',

      // TypeScript правила
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',

      'indent': 'off', // Отключаем жесткие правила отступов
      'quotes': 'off',
      'semi': ['warn', 'always'],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'no-console': 'off', // Разрешаем console в тестах
    },
  },
];
