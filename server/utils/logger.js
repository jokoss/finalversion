const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  constructor() {
    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    
    this.currentLevel = process.env.LOG_LEVEL || 'INFO';
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
      environment: process.env.NODE_ENV || 'development',
      pid: process.pid
    };

    return JSON.stringify(logEntry);
  }

  writeToFile(level, formattedMessage) {
    const filename = `${level.toLowerCase()}.log`;
    const filepath = path.join(logsDir, filename);
    
    fs.appendFile(filepath, formattedMessage + '\n', (err) => {
      if (err) {
        console.error('Failed to write to log file:', err);
      }
    });

    // Also write to combined log
    const combinedPath = path.join(logsDir, 'combined.log');
    fs.appendFile(combinedPath, formattedMessage + '\n', () => {});
  }

  shouldLog(level) {
    return this.logLevels[level] <= this.logLevels[this.currentLevel];
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output with colors
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[90m'  // Gray
    };
    
    const resetColor = '\x1b[0m';
    console.log(`${colors[level]}[${level}]${resetColor} ${message}`, meta);

    // Write to file in production
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile(level, formattedMessage);
    }
  }

  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }

  // Database operation logging
  dbOperation(operation, table, meta = {}) {
    this.info(`Database ${operation} on ${table}`, {
      operation,
      table,
      ...meta
    });
  }

  // API request logging
  apiRequest(method, path, statusCode, responseTime, meta = {}) {
    const level = statusCode >= 400 ? 'ERROR' : 'INFO';
    this.log(level, `${method} ${path} - ${statusCode}`, {
      method,
      path,
      statusCode,
      responseTime,
      ...meta
    });
  }

  // Security event logging
  securityEvent(event, details = {}) {
    this.warn(`Security Event: ${event}`, {
      event,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  // Performance logging
  performance(operation, duration, meta = {}) {
    const level = duration > 1000 ? 'WARN' : 'INFO';
    this.log(level, `Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      ...meta
    });
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;
