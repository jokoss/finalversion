const logger = require('./logger');

// Environment variable definitions with validation rules
const ENV_VARIABLES = {
  // Database Configuration
  DATABASE_URL: {
    required: true,
    type: 'string',
    description: 'PostgreSQL database connection URL',
    validate: (value) => {
      if (!value.startsWith('postgres://') && !value.startsWith('postgresql://')) {
        throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
      }
      return true;
    }
  },

  // Server Configuration
  NODE_ENV: {
    required: true,
    type: 'string',
    allowedValues: ['development', 'production', 'test'],
    default: 'development',
    description: 'Application environment'
  },
  
  PORT: {
    required: false,
    type: 'number',
    default: 3000,
    validate: (value) => {
      const port = parseInt(value);
      if (port < 1 || port > 65535) {
        throw new Error('PORT must be between 1 and 65535');
      }
      return true;
    },
    description: 'Server port number'
  },

  // Security Configuration
  JWT_SECRET: {
    required: true,
    type: 'string',
    validate: (value) => {
      if (value.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
      }
      return true;
    },
    description: 'JWT signing secret key'
  },

  JWT_EXPIRES_IN: {
    required: false,
    type: 'string',
    default: '24h',
    description: 'JWT token expiration time'
  },

  JWT_REFRESH_SECRET: {
    required: false,
    type: 'string',
    validate: (value) => {
      if (value && value.length < 32) {
        throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
      }
      return true;
    },
    description: 'JWT refresh token secret key'
  },

  JWT_REFRESH_EXPIRES_IN: {
    required: false,
    type: 'string',
    default: '7d',
    description: 'JWT refresh token expiration time'
  },

  // CORS Configuration
  FRONTEND_URL: {
    required: false,
    type: 'string',
    validate: (value) => {
      if (value && !value.match(/^https?:\/\/.+/)) {
        throw new Error('FRONTEND_URL must be a valid URL');
      }
      return true;
    },
    description: 'Frontend application URL for CORS'
  },

  ALLOWED_ORIGINS: {
    required: false,
    type: 'string',
    description: 'Comma-separated list of allowed CORS origins'
  },

  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: {
    required: false,
    type: 'number',
    default: 900000, // 15 minutes
    description: 'Rate limiting window in milliseconds'
  },

  RATE_LIMIT_MAX_REQUESTS: {
    required: false,
    type: 'number',
    default: 100,
    description: 'Maximum requests per window'
  },

  // File Upload Configuration
  MAX_FILE_SIZE: {
    required: false,
    type: 'number',
    default: 10485760, // 10MB
    validate: (value) => {
      const size = parseInt(value);
      if (size < 1024 || size > 104857600) { // 1KB to 100MB
        throw new Error('MAX_FILE_SIZE must be between 1KB and 100MB');
      }
      return true;
    },
    description: 'Maximum file upload size in bytes'
  },

  MAX_FILES_PER_REQUEST: {
    required: false,
    type: 'number',
    default: 5,
    validate: (value) => {
      const count = parseInt(value);
      if (count < 1 || count > 20) {
        throw new Error('MAX_FILES_PER_REQUEST must be between 1 and 20');
      }
      return true;
    },
    description: 'Maximum number of files per upload request'
  },

  // Email Configuration (if needed)
  SMTP_HOST: {
    required: false,
    type: 'string',
    description: 'SMTP server hostname'
  },

  SMTP_PORT: {
    required: false,
    type: 'number',
    default: 587,
    validate: (value) => {
      const port = parseInt(value);
      if (port < 1 || port > 65535) {
        throw new Error('SMTP_PORT must be between 1 and 65535');
      }
      return true;
    },
    description: 'SMTP server port'
  },

  SMTP_USER: {
    required: false,
    type: 'string',
    description: 'SMTP username'
  },

  SMTP_PASS: {
    required: false,
    type: 'string',
    description: 'SMTP password'
  },

  // Logging Configuration
  LOG_LEVEL: {
    required: false,
    type: 'string',
    allowedValues: ['error', 'warn', 'info', 'debug'],
    default: 'info',
    description: 'Logging level'
  },

  LOG_FILE: {
    required: false,
    type: 'string',
    description: 'Log file path'
  },

  // Cache Configuration
  REDIS_URL: {
    required: false,
    type: 'string',
    validate: (value) => {
      if (value && !value.startsWith('redis://') && !value.startsWith('rediss://')) {
        throw new Error('REDIS_URL must be a valid Redis connection string');
      }
      return true;
    },
    description: 'Redis connection URL for caching'
  },

  CACHE_TTL: {
    required: false,
    type: 'number',
    default: 3600, // 1 hour
    description: 'Default cache TTL in seconds'
  }
};

// Type conversion functions
const convertType = (value, type) => {
  switch (type) {
    case 'number':
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`Cannot convert "${value}" to number`);
      }
      return num;
    case 'boolean':
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === '1') return true;
        if (lower === 'false' || lower === '0') return false;
      }
      throw new Error(`Cannot convert "${value}" to boolean`);
    case 'string':
      return String(value);
    default:
      return value;
  }
};

// Validate a single environment variable
const validateEnvVar = (key, config) => {
  const value = process.env[key];
  
  // Check if required variable is missing
  if (config.required && (value === undefined || value === '')) {
    throw new Error(`Required environment variable ${key} is missing`);
  }
  
  // Use default value if not provided
  if (value === undefined || value === '') {
    if (config.default !== undefined) {
      process.env[key] = String(config.default);
      return config.default;
    }
    return undefined;
  }
  
  // Convert type
  let convertedValue;
  try {
    convertedValue = convertType(value, config.type);
  } catch (error) {
    throw new Error(`Environment variable ${key}: ${error.message}`);
  }
  
  // Check allowed values
  if (config.allowedValues && !config.allowedValues.includes(convertedValue)) {
    throw new Error(`Environment variable ${key} must be one of: ${config.allowedValues.join(', ')}`);
  }
  
  // Run custom validation
  if (config.validate) {
    try {
      config.validate(convertedValue);
    } catch (error) {
      throw new Error(`Environment variable ${key}: ${error.message}`);
    }
  }
  
  return convertedValue;
};

// Main validation function
const validateEnvironment = () => {
  const errors = [];
  const warnings = [];
  const config = {};
  
  logger.info('🔍 Validating environment variables...');
  
  // Validate each environment variable
  for (const [key, envConfig] of Object.entries(ENV_VARIABLES)) {
    try {
      const value = validateEnvVar(key, envConfig);
      config[key] = value;
      
      if (value !== undefined) {
        logger.debug(`✅ ${key}: ${envConfig.type === 'string' && key.includes('SECRET') ? '[HIDDEN]' : value}`);
      } else {
        logger.debug(`⚪ ${key}: not set (optional)`);
      }
    } catch (error) {
      errors.push(error.message);
      logger.error(`❌ ${error.message}`);
    }
  }
  
  // Check for unknown environment variables (security warning)
  const knownVars = new Set(Object.keys(ENV_VARIABLES));
  const systemVars = new Set(['PATH', 'HOME', 'USER', 'SHELL', 'PWD', 'LANG', 'TZ', 'TERM']);
  
  for (const key of Object.keys(process.env)) {
    if (!knownVars.has(key) && !systemVars.has(key) && !key.startsWith('npm_') && !key.startsWith('NODE_')) {
      warnings.push(`Unknown environment variable: ${key}`);
      logger.warn(`⚠️  Unknown environment variable: ${key}`);
    }
  }
  
  // Report results
  if (errors.length > 0) {
    logger.error(`❌ Environment validation failed with ${errors.length} error(s):`);
    errors.forEach(error => logger.error(`   - ${error}`));
    throw new Error(`Environment validation failed: ${errors.join('; ')}`);
  }
  
  if (warnings.length > 0) {
    logger.warn(`⚠️  Environment validation completed with ${warnings.length} warning(s)`);
  } else {
    logger.info('✅ Environment validation completed successfully');
  }
  
  return config;
};

// Generate environment documentation
const generateEnvDocs = () => {
  const docs = ['# Environment Variables\n'];
  
  const categories = {
    'Database Configuration': ['DATABASE_URL'],
    'Server Configuration': ['NODE_ENV', 'PORT'],
    'Security Configuration': ['JWT_SECRET', 'JWT_EXPIRES_IN', 'JWT_REFRESH_SECRET', 'JWT_REFRESH_EXPIRES_IN'],
    'CORS Configuration': ['FRONTEND_URL', 'ALLOWED_ORIGINS'],
    'Rate Limiting Configuration': ['RATE_LIMIT_WINDOW_MS', 'RATE_LIMIT_MAX_REQUESTS'],
    'File Upload Configuration': ['MAX_FILE_SIZE', 'MAX_FILES_PER_REQUEST'],
    'Email Configuration': ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'],
    'Logging Configuration': ['LOG_LEVEL', 'LOG_FILE'],
    'Cache Configuration': ['REDIS_URL', 'CACHE_TTL']
  };
  
  for (const [category, vars] of Object.entries(categories)) {
    docs.push(`## ${category}\n`);
    
    for (const varName of vars) {
      const config = ENV_VARIABLES[varName];
      if (config) {
        docs.push(`### ${varName}`);
        docs.push(`- **Description**: ${config.description}`);
        docs.push(`- **Type**: ${config.type}`);
        docs.push(`- **Required**: ${config.required ? 'Yes' : 'No'}`);
        
        if (config.default !== undefined) {
          docs.push(`- **Default**: ${config.default}`);
        }
        
        if (config.allowedValues) {
          docs.push(`- **Allowed Values**: ${config.allowedValues.join(', ')}`);
        }
        
        docs.push('');
      }
    }
  }
  
  return docs.join('\n');
};

// Export functions
module.exports = {
  validateEnvironment,
  generateEnvDocs,
  ENV_VARIABLES
};
