module.exports = {
  extends: ['expo', '@react-native-community'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/prefer-const': 'error',
    'react-native/no-inline-styles': 'error',
    'react-native/no-color-literals': 'error',
  },
};