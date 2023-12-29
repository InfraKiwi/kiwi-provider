/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:@stylistic/disable-legacy',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['jest', 'unused-imports', 'import', 'unicorn', '@stylistic'],
  root: true,
  ignorePatterns: ['**/test/**/*.js', '**/examples/**/*.js', '**/loadAll*.gen.ts', '**/**.gen.*.ts'],
  env: {
    node: true,
  },
  overrides: [
    {
      files: ['**/**.js'],
      extends: ['plugin:@typescript-eslint/disable-type-checked'],
    },
    // Generated files can contain any
    {
      files: ['**/**.gen.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/consistent-indexed-object-style': 'off',
      },
    },
    {
      files: ['**schema.gen.ts'],
      rules: {
        '@stylistic/indent': ['error', 2],
        'multiline-comment-style': ['off'],
      },
    },
    {
      files: ['**/**test.ts', 'src/util/testUtils.ts'],
      env: {
        jest: true,
      },
    },
  ],

  rules: {
    quotes: [
      'error',
      'single',
      {
        allowTemplateLiterals: true,
      },
    ],
    'comma-spacing': ['error'],
    '@stylistic/comma-dangle': ['error', 'always-multiline'],
    curly: ['error', 'all'],
    'keyword-spacing': ['error'],
    'no-unused-vars': ['off'],
    '@stylistic/semi': ['error'],
    '@stylistic/array-bracket-newline': ['error', { multiline: true }],
    '@stylistic/array-element-newline': [
      'error',
      {
        ArrayExpression: 'consistent',
        ArrayPattern: { multiline: true, minItems: 5 },
      },
    ],
    '@stylistic/brace-style': ['error', '1tbs'],
    '@stylistic/function-call-argument-newline': ['error', 'consistent'],
    '@stylistic/function-call-spacing': ['error'],
    '@stylistic/function-paren-newline': ['error', 'consistent'],
    '@stylistic/indent-binary-ops': ['error', 2],
    'multiline-comment-style': ['error'],
    '@stylistic/max-len': [
      'error',
      {
        code: 120,
        tabWidth: 2,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    '@stylistic/no-trailing-spaces': 'error',
    '@stylistic/object-curly-newline': [
      'error',
      {
        multiline: true,
        consistent: true,
      },
    ],
    '@stylistic/object-property-newline': ['error'],
    '@stylistic/quote-props': ['error', 'as-needed'],
    'import/no-cycle': 'error',
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
    'unicorn/prefer-node-protocol': 'error',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: 'debug',
        args: 'none',
      },
    ],
    '@typescript-eslint/object-curly-spacing': ['error', 'always'],
    '@stylistic/lines-around-comment': [
      'error',
      {
        beforeBlockComment: true,
        allowBlockStart: true,
        allowObjectStart: true,
        allowArrayStart: true,
        allowClassStart: true,
        allowInterfaceStart: true,
        allowEnumStart: true,
        allowModuleStart: true,
        allowTypeStart: true,
      },
    ],
    '@typescript-eslint/member-delimiter-style': ['error'],
    '@typescript-eslint/quotes': [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    '@stylistic/type-annotation-spacing': ['error'],
    '@stylistic/type-generic-spacing': ['error'],
    '@stylistic/type-named-tuple-spacing': ['error'],
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          Symbol: false,
        },
        extendDefaults: true,
      },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        disallowTypeAnnotations: false,
      },
    ],
    '@typescript-eslint/no-base-to-string': [
      'error',
      {
        ignoredTypeNames: ['Error', 'RegExp', 'URL', 'URLSearchParams'],
      },
    ],
    '@typescript-eslint/no-redundant-type-constituents': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/dot-notation': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/class-literal-property-style': 'off',
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
