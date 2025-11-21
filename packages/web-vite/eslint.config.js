import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist', '**/dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Standard rules from base config
      'prefer-const': 'warn',
      quotes: ['warn', 'single'],
      'array-bracket-spacing': ['warn', 'never'],
      'array-callback-return': 'error',
      'arrow-spacing': 'error',
      'block-scoped-var': 'error',
      'block-spacing': 'warn',
      'comma-spacing': ['error', { after: true, before: false }],
      'comma-style': ['error', 'last'],
      'computed-property-spacing': 'warn',
      curly: ['error', 'multi-line'],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'dot-notation': 'warn',
      eqeqeq: 'error',
      'for-direction': 'error',
      'func-call-spacing': 'warn',
      'guard-for-in': 'warn',
      indent: [
        'error',
        2,
        {
          SwitchCase: 1,
          ignoredNodes: ['TemplateLiteral'],
        },
      ],
      'key-spacing': [
        'warn',
        {
          beforeColon: false,
          afterColon: true,
        },
      ],
      'keyword-spacing': [
        'warn',
        {
          before: true,
          after: true,
        },
      ],
      'lines-between-class-members': ['warn', 'always'],
      'max-depth': ['error', 4],
      'max-len': [
        'error',
        {
          code: 120,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
      'max-nested-callbacks': ['error', 4],
      'max-params': ['error', 5],
      'newline-before-return': 'warn',
      'no-array-constructor': 'error',
      'no-await-in-loop': 'warn',
      'no-duplicate-imports': 'error',
      'no-else-return': 'warn',
      'no-empty-function': 'off',
      'no-eq-null': 'error',
      'no-eval': 'error',
      'no-lonely-if': 'warn',
      'no-loop-func': 'warn',
      'no-mixed-operators': 'error',
      'no-multi-assign': 'error',
      'no-multi-spaces': 'warn',
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'no-tabs': 'error',
      'no-trailing-spaces': ['warn', { skipBlankLines: true }],
      'no-unneeded-ternary': 'error',
      'no-use-before-define': [
        'warn',
        {
          functions: false,
        },
      ],
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'object-curly-spacing': ['warn', 'always'],
      'prefer-template': 'warn',
      'space-before-blocks': 'error',
      'space-in-parens': ['error', 'never'],
      'space-infix-ops': 'error',
      yoda: 'error',
      '@typescript-eslint/no-empty-interface': 0,
      '@typescript-eslint/no-explicit-any': 0,
    },
  },
]
