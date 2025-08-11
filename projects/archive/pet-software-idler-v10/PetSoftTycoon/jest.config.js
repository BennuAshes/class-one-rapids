module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapping: {
    '^@features/(.*)$': '<rootDir>/features/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@app/(.*)$': '<rootDir>/app/$1'
  },
  collectCoverageFrom: [
    'features/**/*.{ts,tsx}',
    'shared/**/*.{ts,tsx}',
    '!**/__tests__/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}