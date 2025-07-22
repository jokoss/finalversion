const { execSync } = require('child_process');
const path = require('path');

module.exports = async () => {
  console.log('🚀 Setting up test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-32-chars';
  process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests
  
  // Use in-memory database for tests if no test database URL is provided
  if (!process.env.TEST_DATABASE_URL) {
    process.env.DATABASE_URL = 'sqlite::memory:';
  }
  
  console.log('✅ Test environment configured');
};
