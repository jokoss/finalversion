const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Ensure uploads directory exists with proper permissions
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
}

// MIME type validation - more secure than file extension
const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
};

// File signature validation (magic numbers)
const FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'application/pdf': [0x25, 0x50, 0x44, 0x46]
};

// Validate file signature (magic numbers)
const validateFileSignature = (buffer, mimeType) => {
  const signature = FILE_SIGNATURES[mimeType];
  if (!signature) return true; // Skip validation for unsupported types
  
  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) {
      return false;
    }
  }
  return true;
};

// Generate secure filename
const generateSecureFilename = (originalname, mimetype) => {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const extension = ALLOWED_MIME_TYPES[mimetype] || path.extname(originalname);
  const sanitizedName = originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${timestamp}_${randomBytes}_${sanitizedName}${extension}`;
};

// Configure storage with enhanced security
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Create subdirectories based on file type for better organization
    const fileType = file.mimetype.split('/')[0];
    const subDir = path.join(uploadDir, fileType);
    
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true, mode: 0o755 });
    }
    
    cb(null, subDir);
  },
  filename: function(req, file, cb) {
    const secureFilename = generateSecureFilename(file.originalname, file.mimetype);
    
    // Log file upload attempt
    logger.securityEvent('File upload attempt', {
      originalName: file.originalname,
      secureFilename: secureFilename,
      mimetype: file.mimetype,
      size: file.size,
      userId: req.user?.id,
      ip: req.ip
    });
    
    cb(null, secureFilename);
  }
});

if (process.env.NODE_ENV === 'production') {
  console.log('✅ Using secure disk storage for Railway production deployment');
  console.log('📁 Upload directory:', uploadDir);
}

// Enhanced file filter with comprehensive validation
const fileFilter = (req, file, cb) => {
  try {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES[file.mimetype]) {
      logger.securityEvent('File upload rejected - invalid MIME type', {
        mimetype: file.mimetype,
        originalname: file.originalname,
        userId: req.user?.id,
        ip: req.ip
      });
      return cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${Object.keys(ALLOWED_MIME_TYPES).join(', ')}`), false);
    }

    // Check file extension matches MIME type
    const expectedExt = ALLOWED_MIME_TYPES[file.mimetype];
    const actualExt = path.extname(file.originalname).toLowerCase();
    
    if (expectedExt !== actualExt && file.mimetype.startsWith('image/')) {
      logger.securityEvent('File upload rejected - extension mismatch', {
        mimetype: file.mimetype,
        expectedExt,
        actualExt,
        originalname: file.originalname,
        userId: req.user?.id,
        ip: req.ip
      });
      return cb(new Error('File extension does not match MIME type'), false);
    }

    // Check for dangerous filenames
    const dangerousPatterns = [
      /\.\./,  // Directory traversal
      /[<>:"|?*]/,  // Invalid filename characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,  // Windows reserved names
      /^\./,  // Hidden files
      /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|aspx|jsp)$/i  // Executable files
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(file.originalname)) {
        logger.securityEvent('File upload rejected - dangerous filename', {
          originalname: file.originalname,
          pattern: pattern.toString(),
          userId: req.user?.id,
          ip: req.ip
        });
        return cb(new Error('Filename contains invalid or dangerous characters'), false);
      }
    }

    cb(null, true);
  } catch (error) {
    logger.error('File filter error:', error);
    cb(new Error('File validation failed'), false);
  }
};

// File signature validation middleware
const validateFileContent = (req, res, next) => {
  if (!req.file) return next();

  try {
    const filePath = req.file.path;
    const buffer = fs.readFileSync(filePath, { start: 0, end: 10 }); // Read first 10 bytes
    
    if (!validateFileSignature(buffer, req.file.mimetype)) {
      // Delete the invalid file
      fs.unlinkSync(filePath);
      
      logger.securityEvent('File upload rejected - invalid signature', {
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        userId: req.user?.id,
        ip: req.ip
      });
      
      return res.status(400).json({
        success: false,
        message: 'File content does not match declared type'
      });
    }

    next();
  } catch (error) {
    logger.error('File signature validation error:', error);
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        logger.error('Failed to delete invalid file:', unlinkError);
      }
    }
    return res.status(500).json({
      success: false,
      message: 'File validation failed'
    });
  }
};

// Export multer instance with enhanced security
exports.upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 5, // Maximum 5 files per request
    fields: 10, // Maximum 10 non-file fields
    fieldNameSize: 100, // Maximum field name size
    fieldSize: 1024 * 1024 // Maximum field value size (1MB)
  },
  fileFilter: fileFilter
});

// Enhanced error handling middleware
exports.uploadErrorHandler = (err, req, res, next) => {
  // Clean up any uploaded files on error
  if (req.file) {
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkError) {
      logger.error('Failed to cleanup file on error:', unlinkError);
    }
  }
  
  if (req.files) {
    req.files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkError) {
        logger.error('Failed to cleanup file on error:', unlinkError);
      }
    });
  }

  logger.securityEvent('File upload error', {
    error: err.message,
    code: err.code,
    userId: req.user?.id,
    ip: req.ip
  });

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 10MB.',
          code: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 5 files allowed.',
          code: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field.',
          code: 'UNEXPECTED_FILE'
        });
      case 'LIMIT_FIELD_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many fields.',
          code: 'TOO_MANY_FIELDS'
        });
      default:
        return res.status(400).json({
          success: false,
          message: err.message,
          code: 'UPLOAD_ERROR'
        });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

// File cleanup utility
exports.cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info('File cleaned up:', filePath);
    }
  } catch (error) {
    logger.error('Failed to cleanup file:', error);
  }
};

// Middleware to validate file content after upload
exports.validateFileContent = validateFileContent;

// Utility to get file info
exports.getFileInfo = (file) => {
  return {
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
    uploadedAt: new Date().toISOString()
  };
};
