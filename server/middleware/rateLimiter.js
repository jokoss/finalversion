const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const logger = require('../utils/logger');

// Store for tracking requests (in production, use Redis)
const requestStore = new Map();

// Clean up old entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestStore.entries()) {
    if (now - data.resetTime > 15 * 60 * 1000) {
      requestStore.delete(key);
    }
  }
}, 15 * 60 * 1000);

// Custom store implementation
const customStore = {
  incr: (key, cb) => {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    
    if (!requestStore.has(key)) {
      requestStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return cb(null, 1, new Date(now + windowMs));
    }
    
    const data = requestStore.get(key);
    
    // Reset if window expired
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
    } else {
      data.count++;
    }
    
    cb(null, data.count, new Date(data.resetTime));
  },
  
  decrement: (key) => {
    if (requestStore.has(key)) {
      const data = requestStore.get(key);
      data.count = Math.max(0, data.count - 1);
    }
  },
  
  resetKey: (key) => {
    requestStore.delete(key);
  }
};

// Rate limit handler
const rateLimitHandler = (req, res) => {
  logger.securityEvent('Rate limit exceeded', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id
  });
  
  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later.',
    retryAfter: Math.round(req.rateLimit.resetTime / 1000)
  });
};

// Skip successful requests for certain endpoints
const skipSuccessfulRequests = (req, res) => {
  return res.statusCode < 400;
};

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many API requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: customStore,
  handler: rateLimitHandler,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: customStore,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true // Don't count successful logins
});

// Upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 uploads per hour
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: customStore,
  handler: rateLimitHandler
});

// Admin operations rate limiter
const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // limit each IP to 50 admin requests per 5 minutes
  message: 'Too many admin requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: customStore,
  handler: rateLimitHandler
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: customStore,
  handler: rateLimitHandler
});

// Slow down middleware for repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes at full speed
  delayMs: 500, // slow down subsequent requests by 500ms per request
  maxDelayMs: 20000, // maximum delay of 20 seconds
  skipSuccessfulRequests: skipSuccessfulRequests
});

// Create custom rate limiter
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;
  
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    store: customStore,
    handler: rateLimitHandler,
    skipSuccessfulRequests,
    skipFailedRequests
  });
};

// Middleware to add rate limit info to response headers
const rateLimitInfo = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Add rate limit info to response
    if (req.rateLimit) {
      res.set({
        'X-RateLimit-Limit': req.rateLimit.limit,
        'X-RateLimit-Remaining': req.rateLimit.remaining,
        'X-RateLimit-Reset': new Date(req.rateLimit.resetTime).toISOString()
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// IP whitelist middleware
const createIPWhitelist = (whitelist = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
      logger.securityEvent('IP not whitelisted', {
        ip: clientIP,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl
      });
      
      return res.status(403).json({
        success: false,
        message: 'Access denied from this IP address'
      });
    }
    
    next();
  };
};

// Distributed rate limiting (for multiple server instances)
const distributedRateLimit = (options = {}) => {
  // In production, this would use Redis or another shared store
  // For now, we'll use the same in-memory store
  return createRateLimiter(options);
};

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  adminLimiter,
  passwordResetLimiter,
  speedLimiter,
  createRateLimiter,
  rateLimitInfo,
  createIPWhitelist,
  distributedRateLimit
};
