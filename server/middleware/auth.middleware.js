const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');
const { AuthenticationError, AuthorizationError } = require('../utils/errorHandler');

/**
 * Enhanced middleware to verify user's JWT token with additional security checks
 */
exports.authenticateToken = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header exists and has the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.securityEvent('Authentication failed - Invalid authorization format', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method
      });
      
      throw new AuthenticationError('Access denied. Invalid authorization format.');
    }
    
    const token = authHeader.split(' ')[1]; // Bearer TOKEN format
    
    if (!token) {
      logger.securityEvent('Authentication failed - No token provided', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method
      });
      
      throw new AuthenticationError('Access denied. No token provided.');
    }

    // Verify token with more detailed error handling
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      logger.securityEvent('Authentication failed - Token verification error', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        error: err.name,
        tokenPrefix: token.substring(0, 10) + '...'
      });
      
      if (err.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token expired. Please login again.');
      } else if (err.name === 'JsonWebTokenError') {
        throw new AuthenticationError('Invalid token. Please login again.');
      } else {
        throw new AuthenticationError('Token verification failed.');
      }
    }
    
    // Check token age (optional additional security)
    const tokenIssuedAt = decoded.iat * 1000; // Convert to milliseconds
    const tokenAge = Date.now() - tokenIssuedAt;
    const maxTokenAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    if (tokenAge > maxTokenAge) {
      logger.securityEvent('Authentication failed - Token too old', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        userId: decoded.id,
        tokenAge: Math.round(tokenAge / (24 * 60 * 60 * 1000)) + ' days'
      });
      
      throw new AuthenticationError('Token too old. Please login again for security reasons.');
    }
    
    // Find user by id
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      logger.securityEvent('Authentication failed - User not found', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        userId: decoded.id
      });
      
      throw new AuthenticationError('User not found.');
    }
    
    if (!user.active) {
      logger.securityEvent('Authentication failed - User account disabled', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        userId: user.id,
        username: user.username
      });
      
      throw new AuthenticationError('User account is disabled. Please contact an administrator.');
    }
    
    // Verify token role matches user role (prevent role escalation if user role changed)
    if (decoded.role !== user.role) {
      logger.securityEvent('Authentication failed - Role mismatch', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        userId: user.id,
        username: user.username,
        tokenRole: decoded.role,
        userRole: user.role
      });
      
      throw new AuthenticationError('Token invalid due to role change. Please login again.');
    }
    
    // Add user and decoded token data to request object
    req.user = user;
    req.token = decoded;
    
    // Log successful authentication for audit purposes
    logger.info('User authenticated successfully', {
      userId: user.id,
      username: user.username,
      role: user.role,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method
    });
    
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return next(error);
    }
    
    logger.error('Authentication error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method
    });
    
    next(new AuthenticationError('Authentication failed.'));
  }
};

/**
 * Middleware to check if user is admin
 */
exports.isAdmin = (req, res, next) => {
  try {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
      logger.info('Admin access granted', {
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method
      });
      
      return next();
    }
    
    logger.securityEvent('Admin access denied - Insufficient privileges', {
      userId: req.user?.id,
      username: req.user?.username,
      role: req.user?.role,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method
    });
    
    throw new AuthorizationError('Access denied. Admin role required.');
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return next(error);
    }
    
    logger.error('Authorization error in isAdmin', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      ip: req.ip,
      url: req.originalUrl
    });
    
    next(new AuthorizationError('Authorization check failed.'));
  }
};

/**
 * Middleware to check if user is superadmin
 */
exports.isSuperAdmin = (req, res, next) => {
  try {
    if (req.user && req.user.role === 'superadmin') {
      logger.info('Superadmin access granted', {
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method
      });
      
      return next();
    }
    
    logger.securityEvent('Superadmin access denied - Insufficient privileges', {
      userId: req.user?.id,
      username: req.user?.username,
      role: req.user?.role,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method
    });
    
    throw new AuthorizationError('Access denied. Superadmin role required.');
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return next(error);
    }
    
    logger.error('Authorization error in isSuperAdmin', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      ip: req.ip,
      url: req.originalUrl
    });
    
    next(new AuthorizationError('Authorization check failed.'));
  }
};

/**
 * Middleware to check if user owns the resource or is admin
 */
exports.isOwnerOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    try {
      const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
      const currentUserId = req.user.id;
      const userRole = req.user.role;
      
      // Allow if user is admin/superadmin or owns the resource
      if (userRole === 'admin' || userRole === 'superadmin' || currentUserId === parseInt(resourceUserId)) {
        logger.info('Resource access granted', {
          userId: currentUserId,
          username: req.user.username,
          role: userRole,
          resourceUserId,
          accessType: currentUserId === parseInt(resourceUserId) ? 'owner' : 'admin',
          ip: req.ip,
          url: req.originalUrl,
          method: req.method
        });
        
        return next();
      }
      
      logger.securityEvent('Resource access denied - Not owner or admin', {
        userId: currentUserId,
        username: req.user.username,
        role: userRole,
        resourceUserId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method
      });
      
      throw new AuthorizationError('Access denied. You can only access your own resources.');
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return next(error);
      }
      
      logger.error('Authorization error in isOwnerOrAdmin', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        ip: req.ip,
        url: req.originalUrl
      });
      
      next(new AuthorizationError('Authorization check failed.'));
    }
  };
};

/**
 * Middleware to check if user has specific role
 */
exports.hasRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      if (userRole && rolesArray.includes(userRole)) {
        logger.info('Role-based access granted', {
          userId: req.user.id,
          username: req.user.username,
          role: userRole,
          allowedRoles: rolesArray,
          ip: req.ip,
          url: req.originalUrl,
          method: req.method
        });
        
        return next();
      }
      
      logger.securityEvent('Role-based access denied', {
        userId: req.user?.id,
        username: req.user?.username,
        role: userRole,
        allowedRoles: rolesArray,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method
      });
      
      throw new AuthorizationError(`Access denied. Required roles: ${rolesArray.join(', ')}`);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return next(error);
      }
      
      logger.error('Authorization error in hasRole', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        ip: req.ip,
        url: req.originalUrl
      });
      
      next(new AuthorizationError('Authorization check failed.'));
    }
  };
};
