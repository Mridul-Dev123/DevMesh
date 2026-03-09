import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import security from 'eslint-plugin-security';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  js.configs.recommended,
  prettier,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      security,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'no-duplicate-imports': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-new-buffer': 'error',
    },
  },
]);
