module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest', 'unused-imports', 'import', 'unicorn'],
  root: true,
  ignorePatterns: ['**/**.gen.ts', '**/**.gen.*.ts', '**/test*/*.js'],

  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': ['error', { varsIgnorePattern: 'debug', args: 'none' }],
    'jest/valid-expect': [
      'error',
      {
        maxArgs: 3,
      },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: ':matches(PropertyDefinition, MethodDefinition)[accessibility="private"]',
        message: 'Use #private instead',
      },
    ],
    'import/no-cycle': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        disallowTypeAnnotations: false,
      },
    ],
    'unicorn/prefer-node-protocol': 'error',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
