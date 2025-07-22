module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test directories
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/server/tests/setup.js'],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/tests/**',
    '!server/node_modules/**',
    '!server/migrations/**',
    '!server/scripts/**',
    '!server/config/**',
    '!**/node_modules/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Module paths
  moduleDirectories: ['node_modules', 'server'],
  
  // Transform files
  transform: {},
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/client/',
    '/coverage/'
  ],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Global setup and teardown
  globalSetup: '<rootDir>/server/tests/globalSetup.js',
  globalTeardown: '<rootDir>/server/tests/globalTeardown.js',
  
  // Module name mapping for absolute imports
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/server/$1',
    '^@utils/(.*)$': '<rootDir>/server/utils/$1',
    '^@models/(.*)$': '<rootDir>/server/models/$1',
    '^@controllers/(.*)$': '<rootDir>/server/controllers/$1',
    '^@middleware/(.*)$': '<rootDir>/server/middleware/$1',
    '^@routes/(.*)$': '<rootDir>/server/routes/$1'
  }
};
