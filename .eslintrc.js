module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'react',
    'react-native',
    'react-hooks',
    'import',
    'unicorn',
    'prettier',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  env: {
    'react-native/react-native': true,
    es2021: true,
    node: true,
    jest: true,
  },
  rules: {
    'prettier/prettier': 'error',
    'react/react-in-jsx-scope': 'off',

    // Strict No-Nested-Ternary rules
    'no-nested-ternary': 'error',
    'unicorn/no-nested-ternary': 'error',
    'unicorn/no-lonely-if': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-string-starts-ends-with': 'error',
    'unicorn/no-useless-spread': 'error',
    'unicorn/prefer-date-now': 'error',
    'unicorn/prefer-modern-math-apis': 'error',

    // Destructuring enforcement
    'prefer-destructuring': [
      'error',
      {
        VariableDeclarator: {
          array: false,
          object: true,
        },
        AssignmentExpression: {
          array: false,
          object: false,
        },
      },
      {
        enforceForRenamedProperties: false,
      },
    ],

    // No default export enforcement
    'import/no-default-export': 'error',
    'import/no-duplicates': 'error',

    // React Native specific rules
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'off',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'off',
    'react-native/no-raw-text': 'off',

    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  overrides: [
    {
      files: ['*.config.js', '.*rc.js', 'jest.setup.js', 'App.tsx'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
};
