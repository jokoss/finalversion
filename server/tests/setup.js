const { sequelize } = require('../models');
const logger = require('../utils/logger');

// Test database setup
beforeAll(async () => {
  try {
    // Use test database
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
    
    // Connect to database
    await sequelize.authenticate();
    logger.info('Test database connected');
    
    // Sync database (create tables)
    await sequelize.sync({ force: true });
    logger.info('Test database synchronized');
  } catch (error) {
    logger.error('Test setup failed:', error);
    throw error;
  }
});

// Clean up after all tests
afterAll(async () => {
  try {
    // Drop all tables
    await sequelize.drop();
    logger.info('Test database cleaned up');
    
    // Close connection
    await sequelize.close();
    logger.info('Test database connection closed');
  } catch (error) {
    logger.error('Test cleanup failed:', error);
  }
});

// Clean up after each test
afterEach(async () => {
  try {
    // Clear all tables but keep structure
    const models = Object.keys(sequelize.models);
    for (const modelName of models) {
      await sequelize.models[modelName].destroy({ 
        where: {},
        truncate: true,
        cascade: true 
      });
    }
  } catch (error) {
    logger.error('Test cleanup after each test failed:', error);
  }
});

// Global test utilities
global.testUtils = {
  // Create test user
  createTestUser: async (userData = {}) => {
    const { User } = require('../models');
    const bcrypt = require('bcrypt');
    
    const defaultUser = {
      email: 'test@example.com',
      password: await bcrypt.hash('testpassword123', 10),
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isActive: true,
      ...userData
    };
    
    return await User.create(defaultUser);
  },
  
  // Create test admin
  createTestAdmin: async (userData = {}) => {
    return await global.testUtils.createTestUser({
      email: 'admin@example.com',
      role: 'admin',
      ...userData
    });
  },
  
  // Generate JWT token for testing
  generateTestToken: (user) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  },
  
  // Create test category
  createTestCategory: async (categoryData = {}) => {
    const { Category } = require('../models');
    
    const defaultCategory = {
      name: 'Test Category',
      description: 'Test category description',
      isActive: true,
      ...categoryData
    };
    
    return await Category.create(defaultCategory);
  },
  
  // Create test file upload
  createTestFile: () => {
    const path = require('path');
    const fs = require('fs');
    
    // Create a small test image buffer
    const testImageBuffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43
    ]);
    
    return {
      buffer: testImageBuffer,
      originalname: 'test-image.jpg',
      mimetype: 'image/jpeg',
      size: testImageBuffer.length
    };
  },
  
  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock request object
  mockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    file: null,
    files: [],
    ip: '127.0.0.1',
    ...overrides
  }),
  
  // Mock response object
  mockResponse: () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      locals: {}
    };
    return res;
  },
  
  // Mock next function
  mockNext: () => jest.fn()
};

// Jest configuration
jest.setTimeout(30000); // 30 seconds timeout for tests

// Suppress console logs during tests unless DEBUG is set
if (!process.env.DEBUG) {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = global.testUtils;
