const { ValidationError } = require('./errorHandler');

class Validator {
  static isEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isStrongPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidPhoneNumber(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  static sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, '');
  }

  static validateRequired(fields, data) {
    const missing = [];
    
    for (const field of fields) {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  static validateEmail(email, fieldName = 'email') {
    if (!email) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    
    if (!this.isEmail(email)) {
      throw new ValidationError(`Invalid ${fieldName} format`, fieldName);
    }
    
    return email.toLowerCase().trim();
  }

  static validatePassword(password, fieldName = 'password') {
    if (!password) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    
    if (password.length < 8) {
      throw new ValidationError(`${fieldName} must be at least 8 characters long`, fieldName);
    }
    
    if (!this.isStrongPassword(password)) {
      throw new ValidationError(
        `${fieldName} must contain at least one uppercase letter, one lowercase letter, one number, and one special character`,
        fieldName
      );
    }
    
    return password;
  }

  static validateString(value, fieldName, options = {}) {
    const { minLength = 0, maxLength = 255, required = false } = options;
    
    if (!value && required) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    
    if (!value) return value;
    
    if (typeof value !== 'string') {
      throw new ValidationError(`${fieldName} must be a string`, fieldName);
    }
    
    const sanitized = this.sanitizeString(value);
    
    if (sanitized.length < minLength) {
      throw new ValidationError(`${fieldName} must be at least ${minLength} characters long`, fieldName);
    }
    
    if (sanitized.length > maxLength) {
      throw new ValidationError(`${fieldName} must be no more than ${maxLength} characters long`, fieldName);
    }
    
    return sanitized;
  }

  static validateNumber(value, fieldName, options = {}) {
    const { min, max, required = false, integer = false } = options;
    
    if (value === undefined || value === null) {
      if (required) {
        throw new ValidationError(`${fieldName} is required`, fieldName);
      }
      return value;
    }
    
    const num = Number(value);
    
    if (isNaN(num)) {
      throw new ValidationError(`${fieldName} must be a valid number`, fieldName);
    }
    
    if (integer && !Number.isInteger(num)) {
      throw new ValidationError(`${fieldName} must be an integer`, fieldName);
    }
    
    if (min !== undefined && num < min) {
      throw new ValidationError(`${fieldName} must be at least ${min}`, fieldName);
    }
    
    if (max !== undefined && num > max) {
      throw new ValidationError(`${fieldName} must be no more than ${max}`, fieldName);
    }
    
    return num;
  }

  static validateBoolean(value, fieldName, required = false) {
    if (value === undefined || value === null) {
      if (required) {
        throw new ValidationError(`${fieldName} is required`, fieldName);
      }
      return value;
    }
    
    if (typeof value === 'boolean') {
      return value;
    }
    
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0') return false;
    }
    
    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
    }
    
    throw new ValidationError(`${fieldName} must be a boolean value`, fieldName);
  }

  static validateArray(value, fieldName, options = {}) {
    const { minLength = 0, maxLength, required = false } = options;
    
    if (!value && required) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    
    if (!value) return value;
    
    if (!Array.isArray(value)) {
      throw new ValidationError(`${fieldName} must be an array`, fieldName);
    }
    
    if (value.length < minLength) {
      throw new ValidationError(`${fieldName} must have at least ${minLength} items`, fieldName);
    }
    
    if (maxLength && value.length > maxLength) {
      throw new ValidationError(`${fieldName} must have no more than ${maxLength} items`, fieldName);
    }
    
    return value;
  }

  static validateDate(value, fieldName, required = false) {
    if (!value && required) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    
    if (!value) return value;
    
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      throw new ValidationError(`${fieldName} must be a valid date`, fieldName);
    }
    
    return date;
  }

  static validateFileUpload(file, options = {}) {
    const {
      required = false,
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fieldName = 'file'
    } = options;
    
    if (!file && required) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    
    if (!file) return null;
    
    if (file.size > maxSize) {
      throw new ValidationError(`${fieldName} size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`, fieldName);
    }
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new ValidationError(`${fieldName} must be one of: ${allowedTypes.join(', ')}`, fieldName);
    }
    
    return file;
  }

  static validateId(id, fieldName = 'id') {
    if (!id) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    
    // For numeric IDs
    if (typeof id === 'string' && /^\d+$/.test(id)) {
      return parseInt(id, 10);
    }
    
    if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
      return id;
    }
    
    throw new ValidationError(`${fieldName} must be a valid ID`, fieldName);
  }

  static validatePagination(query) {
    const page = this.validateNumber(query.page || 1, 'page', { min: 1, integer: true });
    const limit = this.validateNumber(query.limit || 10, 'limit', { min: 1, max: 100, integer: true });
    const offset = (page - 1) * limit;
    
    return { page, limit, offset };
  }

  static validateSortOrder(order, allowedFields = []) {
    if (!order) return {};
    
    const sorts = [];
    const orderPairs = order.split(',');
    
    for (const pair of orderPairs) {
      const [field, direction = 'ASC'] = pair.trim().split(':');
      
      if (allowedFields.length > 0 && !allowedFields.includes(field)) {
        throw new ValidationError(`Invalid sort field: ${field}. Allowed fields: ${allowedFields.join(', ')}`);
      }
      
      if (!['ASC', 'DESC', 'asc', 'desc'].includes(direction)) {
        throw new ValidationError(`Invalid sort direction: ${direction}. Use ASC or DESC`);
      }
      
      sorts.push([field, direction.toUpperCase()]);
    }
    
    return sorts;
  }
}

module.exports = Validator;
