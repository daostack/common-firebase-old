module.exports = {
  testMatch: [
    '**/tests/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageReporters: [
    'json-summary',
    'text',
    'lcov'
  ]
};