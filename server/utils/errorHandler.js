const logger = require('./logger');

class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400);
    this.field = field;
    this.type = 'validation';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.type = 'authentication';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.type = 'authorization';
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.type = 'not_found';
  }
}

class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, 500);
    this.type = 'database';
    this.originalError = originalError;
  }
}

class FileUploadError extends AppError {
  constructor(message) {
    super(message, 400);
    this.type = 'file_upload';
  }
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new NotFoundError(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    error = new ValidationError(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    error = new ValidationError(message);
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => e.message);
    const message = `Validation error: ${errors.join(', ')}`;
    error = new ValidationError(message);
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    const message = `${field} already exists`;
    error = new ValidationError(message, field);
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Invalid reference to related resource';
    error = new ValidationError(message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again!';
    error = new AuthenticationError(message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired! Please log in again.';
    error = new AuthenticationError(message);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = new FileUploadError(message);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = new FileUploadError(message);
  }

  // Send error response
  sendErrorResponse(error, req, res);
};

// Send error response based on environment
const sendErrorResponse = (err, req, res) => {
  // Check if this is a frontend route (not an API route)
  const isApiRoute = req.originalUrl.startsWith('/api/') || 
                     req.originalUrl.startsWith('/admin/api/') ||
                     req.headers.accept?.includes('application/json');

  // For frontend routes, serve HTML instead of JSON
  if (!isApiRoute) {
    logger.info('Frontend route error, serving HTML fallback', {
      url: req.originalUrl,
      method: req.method,
      error: err.message
    });

    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Analytical Testing Laboratory</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .container { max-width: 600px; margin: 0 auto; }
            .error { color: #e74c3c; margin: 20px 0; }
            .links { margin: 30px 0; }
            .links a { display: inline-block; margin: 10px; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; }
            .links a:hover { background: #2980b9; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Analytical Testing Laboratory</h1>
            <div class="error">
              <p>The application is loading. Please refresh the page in a moment.</p>
            </div>
            <div class="links">
              <a href="/">Home</a>
              <a href="/api/health">Server Health</a>
              <a href="/api">API Status</a>
            </div>
            <script>
              // Auto-refresh after 3 seconds
              setTimeout(() => {
                window.location.reload();
              }, 3000);
            </script>
          </div>
        </body>
      </html>
    `);
  }

  // For API routes, continue with JSON responses
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      type: err.type || 'error',
      field: err.field || null,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  // Programming or other unknown error: don't leak error details but provide helpful info
  logger.error('Programming Error', {
    error: err,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  // Send informative but safe message
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'An internal server error occurred. Please try again later.',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    requestId: req.headers['x-request-id'] || 'unknown',
    support: {
      message: 'If this error persists, please contact support',
      api: {
        health: '/api/health',
        diagnostics: '/api/diagnostics'
      }
    }
  });
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection', {
    error: err.message,
    stack: err.stack,
    promise: promise
  });
  
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  
  // Close server & exit process
  process.exit(1);
});

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  FileUploadError,
  errorHandler,
  asyncHandler
};
