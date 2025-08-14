module.exports = {
  extends: [
    'expo',
    '@typescript-eslint/recommended'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // Vertical slicing enforcement
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../*/features/*'],
            message: 'Cross-feature imports not allowed. Use EventBus instead.'
          }
        ]
      }
    ],
    // State management rules
    'prefer-const': 'error',
    'no-var': 'error'
  }
};