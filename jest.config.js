module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'unit-testing/**/*.js',
    'api-testing/**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageDirectory: 'reports/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testEnvironment: 'node',
  testMatch: [
    '**/unit-testing/**/*.test.js',
    '**/api-testing/**/*.test.js'
  ]
};
