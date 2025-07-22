# Security Implementation Guide

This document outlines the comprehensive security measures implemented in the Analytical Testing Laboratory application.

## 🔒 Security Architecture Overview

The application implements a multi-layered security approach with the following components:

### Phase 1: File Upload Security
- **Enhanced Upload Middleware** (`server/middleware/upload.middleware.js`)
- **MIME Type Validation** with whitelist approach
- **File Signature Verification** using magic numbers
- **Secure Filename Generation** with cryptographic randomness
- **Directory Traversal Protection**
- **Malicious File Detection**
- **Automatic File Cleanup** on errors

### Phase 2: Environment Variable Validation
- **Comprehensive Validation System** (`server/utils/envValidator.js`)
- **Type Conversion and Validation**
- **Required Variable Enforcement**
- **Security-focused Validation Rules**
- **Startup-time Validation** with process exit on failure

### Phase 3: Enhanced Security Middleware
- **XSS Protection** with input sanitization
- **SQL Injection Prevention**
- **NoSQL Injection Protection**
- **CSRF Protection** with token validation
- **Rate Limiting** with multiple tiers
- **Request Size Limiting**
- **Content-Type Validation**
- **IP Security Checks**
- **User-Agent Validation**

### Phase 4: Caching System
- **Memory Cache** with TTL support
- **Redis Cache** integration (optional)
- **Cache Invalidation** strategies
- **Response Caching Middleware**
- **Cache Statistics** and monitoring

## 🛡️ Security Features

### File Upload Security

#### MIME Type Validation
```javascript
const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  // ... more types
};
```

#### File Signature Validation
- Validates file headers (magic numbers) to prevent MIME type spoofing
- Supports common file types with signature verification
- Automatically rejects files with mismatched signatures

#### Secure Filename Generation
- Uses cryptographic randomness for filename generation
- Prevents directory traversal attacks
- Sanitizes original filenames
- Includes timestamp and random bytes

#### Dangerous Pattern Detection
- Blocks executable file extensions
- Prevents Windows reserved names
- Detects directory traversal attempts
- Validates filename characters

### Environment Variable Security

#### Validation Rules
- **Database URLs**: Must be valid PostgreSQL connection strings
- **JWT Secrets**: Minimum 32 characters length
- **Ports**: Valid port range validation (1-65535)
- **URLs**: Proper URL format validation
- **File Sizes**: Reasonable limits (1KB - 100MB)

#### Security Checks
- Warns about unknown environment variables
- Hides sensitive values in logs
- Validates configuration consistency
- Provides detailed error messages

### Request Security

#### Rate Limiting
```javascript
// Different limits for different endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many API requests'
});
```

#### Input Validation
- XSS protection with HTML entity encoding
- SQL injection prevention with parameterized queries
- NoSQL injection protection with input sanitization
- Content-Type validation for POST/PUT requests

#### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy restrictions

### Caching Security

#### Cache Key Security
- Prevents cache poisoning with secure key generation
- Includes request context in cache keys
- Validates cache data integrity

#### Cache Invalidation
- Automatic invalidation on data changes
- Pattern-based cache clearing
- Tag-based cache management

## 🔧 Configuration

### Environment Variables

#### Required Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Security
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long

# Server
NODE_ENV=production
PORT=3000
```

#### Optional Security Variables
```bash
# CORS
FRONTEND_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=https://domain1.com,https://domain2.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
MAX_FILES_PER_REQUEST=5

# Caching
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/app.log
```

### Security Middleware Configuration

#### Helmet Configuration
```javascript
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};
```

#### CORS Configuration
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
```

## 🚨 Security Monitoring

### Logging and Alerts

#### Security Events
- Failed authentication attempts
- File upload rejections
- Rate limit violations
- Suspicious request patterns
- Environment validation failures

#### Log Levels
- **ERROR**: Security violations, system errors
- **WARN**: Suspicious activities, fallback usage
- **INFO**: Normal operations, startup events
- **DEBUG**: Detailed operation logs

### Cache Statistics
```javascript
// Monitor cache performance
const stats = cache.getStats();
console.log(`Cache hit rate: ${stats.hitRate}`);
console.log(`Cache size: ${stats.size} items`);
console.log(`Memory usage: ${stats.memoryUsage}`);
```

## 🔍 Security Testing

### File Upload Testing
```bash
# Test malicious file upload
curl -X POST http://localhost:3000/api/upload \
  -F "file=@malicious.exe" \
  -H "Authorization: Bearer your-token"

# Test oversized file
curl -X POST http://localhost:3000/api/upload \
  -F "file=@large-file.jpg" \
  -H "Authorization: Bearer your-token"
```

### Rate Limiting Testing
```bash
# Test rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

### Environment Validation Testing
```bash
# Test with invalid environment
JWT_SECRET=short node server/index.js
# Should exit with validation error
```

## 🛠️ Maintenance

### Regular Security Tasks

#### Daily
- Monitor security logs for anomalies
- Check cache performance metrics
- Review failed authentication attempts

#### Weekly
- Update security dependencies
- Review rate limiting statistics
- Clean up old log files

#### Monthly
- Security audit of uploaded files
- Review and update security policies
- Test backup and recovery procedures

### Security Updates

#### Dependency Updates
```bash
# Check for security vulnerabilities
npm audit

# Update dependencies
npm update

# Fix vulnerabilities
npm audit fix
```

#### Configuration Updates
- Review and update CORS origins
- Rotate JWT secrets periodically
- Update rate limiting thresholds based on usage

## 🚀 Deployment Security

### Production Checklist

#### Environment
- [ ] All required environment variables set
- [ ] JWT secrets are cryptographically secure
- [ ] Database connections use SSL
- [ ] HTTPS enabled for all endpoints
- [ ] CORS configured for production domains

#### File System
- [ ] Upload directory has proper permissions
- [ ] Log files are properly rotated
- [ ] Temporary files are cleaned up
- [ ] Static files served with proper headers

#### Monitoring
- [ ] Security logging enabled
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Backup systems operational

### Docker Security
```dockerfile
# Use non-root user
USER node

# Set proper file permissions
COPY --chown=node:node . .

# Limit container capabilities
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
```

## 📚 Additional Resources

### Security Standards
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

### Tools and Libraries
- [Helmet.js](https://helmetjs.github.io/) - Security headers
- [Express Rate Limit](https://github.com/nfriedly/express-rate-limit) - Rate limiting
- [Joi](https://joi.dev/) - Input validation
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Password hashing

### Monitoring Services
- [Sentry](https://sentry.io/) - Error tracking
- [LogRocket](https://logrocket.com/) - Session replay
- [DataDog](https://www.datadoghq.com/) - Infrastructure monitoring

---

## 🔐 Security Contact

For security-related issues or questions:
- Create a security issue in the repository
- Follow responsible disclosure practices
- Include detailed reproduction steps
- Provide impact assessment

**Remember**: Security is an ongoing process, not a one-time implementation. Regular reviews and updates are essential for maintaining a secure application.
