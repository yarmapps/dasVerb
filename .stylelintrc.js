module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-react-native'],
  rules: {
    'react-native/css-property-no-unknown': true,
    'react-native/font-weight-no-ignored-values': true,
    'value-keyword-case': null,
    'function-name-case': null,
    'alpha-value-notation': 'number',
    'selector-pseudo-class-no-unknown': null,
    'unit-no-unknown': null,
    'property-no-unknown': null,
  },
  overrides: [
    {
      files: ['**/*.styles.ts', '**/*.styles.tsx', 'App.styles.ts'],
      customSyntax: 'postcss-styled-components',
    },
  ],
};
