const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss');
const validator = require('validator');
const logger = require('../utils/logger');
const { AuthenticationError, ValidationError } = require('../utils/errorHandler');

// XSS Protection middleware
const xssProtection = (req, res, next) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

// Recursively sanitize object properties
const sanitizeObject = (obj) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = xss(value, {
        whiteList: {}, // No HTML tags allowed
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script']
      });
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? xss(item, { whiteList: {} }) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// SQL Injection Protection
const sqlInjectionProtection = (req, res, next) => {
  const checkForSQLInjection = (value) => {
    if (typeof value !== 'string') return false;
    
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /(--|\/\*|\*\/|;)/g,
      /(\b(CHAR|NCHAR|VARCHAR|NVARCHAR)\s*\()/gi,
      /(\b(CAST|CONVERT|SUBSTRING|ASCII|CHAR_LENGTH)\s*\()/gi
    ];
    
    return sqlPatterns.some(pattern => pattern.test(value));
  };
  
  const checkObject = (obj, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string' && checkForSQLInjection(value)) {
        logger.securityEvent('SQL Injection attempt detected', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.originalUrl,
          field: currentPath,
          value: value.substring(0, 100) // Log first 100 chars only
        });
        
        throw new ValidationError(`Invalid characters detected in ${currentPath}`, key);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        checkObject(value, currentPath);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'string' && checkForSQLInjection(item)) {
            throw new ValidationError(`Invalid characters detected in ${currentPath}[${index}]`, key);
          }
        });
      }
    }
  };
  
  try {
    if (req.body && typeof req.body === 'object') {
      checkObject(req.body, 'body');
    }
    
    if (req.query && typeof req.query === 'object') {
      checkObject(req.query, 'query');
    }
    
    if (req.params && typeof req.params === 'object') {
      checkObject(req.params, 'params');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// NoSQL Injection Protection
const noSQLInjectionProtection = (req, res, next) => {
  const checkForNoSQLInjection = (obj) => {
    if (typeof obj !== 'object' || obj === null) return false;
    
    const dangerousKeys = ['$where', '$ne', '$gt', '$lt', '$gte', '$lte', '$in', '$nin', '$regex', '$exists', '$type'];
    
    for (const key of Object.keys(obj)) {
      if (dangerousKeys.includes(key)) {
        return true;
      }
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkForNoSQLInjection(obj[key])) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  try {
    if (req.body && checkForNoSQLInjection(req.body)) {
      logger.securityEvent('NoSQL Injection attempt detected', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        body: JSON.stringify(req.body).substring(0, 200)
      });
      
      throw new ValidationError('Invalid query parameters detected');
    }
    
    if (req.query && checkForNoSQLInjection(req.query)) {
      logger.securityEvent('NoSQL Injection attempt detected in query', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        query: JSON.stringify(req.query).substring(0, 200)
      });
      
      throw new ValidationError('Invalid query parameters detected');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Request size limiter
const requestSizeLimiter = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxSizeBytes = typeof maxSize === 'string' ? 
      parseInt(maxSize) * (maxSize.includes('mb') ? 1024 * 1024 : 1024) : 
      maxSize;
    
    if (contentLength > maxSizeBytes) {
      logger.securityEvent('Request size limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        contentLength,
        maxSize: maxSizeBytes
      });
      
      return res.status(413).json({
        success: false,
        message: 'Request entity too large'
      });
    }
    
    next();
  };
};

// User-Agent validation
const userAgentValidation = (req, res, next) => {
  const userAgent = req.get('User-Agent');
  
  if (!userAgent) {
    logger.securityEvent('Missing User-Agent header', {
      ip: req.ip,
      url: req.originalUrl
    });
    
    return res.status(400).json({
      success: false,
      message: 'User-Agent header is required'
    });
  }
  
  // Check for suspicious user agents
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /burp/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /acunetix/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    logger.securityEvent('Suspicious User-Agent detected', {
      ip: req.ip,
      userAgent,
      url: req.originalUrl
    });
    
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  next();
};

// Content-Type validation
const contentTypeValidation = (allowedTypes = ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded']) => {
  return (req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE') {
      return next();
    }
    
    const contentType = req.get('Content-Type');
    
    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type header is required'
      });
    }
    
    const isAllowed = allowedTypes.some(type => contentType.includes(type));
    
    if (!isAllowed) {
      logger.securityEvent('Invalid Content-Type', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        contentType,
        allowedTypes
      });
      
      return res.status(415).json({
        success: false,
        message: `Unsupported Content-Type. Allowed types: ${allowedTypes.join(', ')}`
      });
    }
    
    next();
  };
};

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://your-domain.com',
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.securityEvent('CORS violation', {
        origin,
        allowedOrigins
      });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: 86400 // 24 hours
};

// Helmet configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false, // Disable for compatibility
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'X-Permitted-Cross-Domain-Policies': 'none'
  });
  
  next();
};

// IP-based security checks
const ipSecurityCheck = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Check for private IP ranges trying to access from outside
  const isPrivateIP = (ip) => {
    return /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(ip) || ip === '127.0.0.1';
  };
  
  // Log suspicious IP patterns
  if (req.get('X-Forwarded-For') && req.get('X-Forwarded-For').split(',').length > 3) {
    logger.securityEvent('Suspicious X-Forwarded-For header', {
      ip: clientIP,
      xForwardedFor: req.get('X-Forwarded-For'),
      userAgent: req.get('User-Agent'),
      url: req.originalUrl
    });
  }
  
  next();
};

module.exports = {
  xssProtection,
  sqlInjectionProtection,
  noSQLInjectionProtection,
  requestSizeLimiter,
  userAgentValidation,
  contentTypeValidation,
  corsOptions,
  helmetConfig,
  securityHeaders,
  ipSecurityCheck,
  cors: cors(corsOptions),
  helmet: helmet(helmetConfig)
};
