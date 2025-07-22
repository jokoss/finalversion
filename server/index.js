require('dotenv').config();

// Validate environment variables first
const { validateEnvironment } = require('./utils/envValidator');
try {
  validateEnvironment();
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const { sequelize } = require('./models');

// Import security middleware
const {
  corsOptions,
  helmetConfig,
  securityHeaders
} = require('./middleware/security');

// Import rate limiting
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Import error handler
const { errorHandler } = require('./utils/errorHandler');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const testRoutes = require('./routes/test.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const certificationRoutes = require('./routes/certification.routes');
const partnerRoutes = require('./routes/partner.routes');
const blogRoutes = require('./routes/blog.routes');
const testimonialRoutes = require('./routes/testimonial.routes');
const governmentContractRoutes = require('./routes/governmentContract.routes');
const debugRoutes = require('./routes/debug.routes');
const apiRoutes = require('./routes/api');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

console.log('🚀 RAILWAY CACHE-DISABLED SERVER: Starting initialization...');

// Trust proxy for Railway (specific proxy count for security)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet(helmetConfig));
app.use(securityHeaders);
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting with error handling
app.use((req, res, next) => {
  try {
    apiLimiter(req, res, next);
  } catch (error) {
    console.error('Rate limiter error:', error.message);
    next();
  }
});

// Health check endpoint (FIRST - highest priority)
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      cache: 'disabled'
    });
  } catch (error) {
    res.status(200).json({ 
      status: 'server-healthy-db-disconnected',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      cache: 'disabled',
      error: error.message
    });
  }
});

// API Routes (BEFORE static files - critical fix!)
app.use('/api/auth', (req, res, next) => {
  try { authLimiter(req, res, next); } catch (e) { next(); }
}, authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/users', userRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/government-contracts', governmentContractRoutes);
app.use('/api/admin', (req, res, next) => {
  try { authLimiter(req, res, next); } catch (e) { next(); }
}, adminRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api', apiRoutes);

// Uploads directory (after API routes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CACHE-DISABLED STATIC FILE SERVING (AFTER API routes)
const clientBuildPath = path.resolve(__dirname, '../client/build');
console.log(`🔍 Client build path: ${clientBuildPath}`);

if (require('fs').existsSync(clientBuildPath)) {
  console.log('✅ Client build directory found - serving with NO CACHE');
  
  // Serve static files with aggressive cache disabling
  app.use(express.static(clientBuildPath, {
    maxAge: 0,
    etag: false,
    lastModified: false,
    setHeaders: (res, filePath) => {
      // Aggressive cache disabling headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      res.setHeader('X-Accel-Expires', '0');
      
      console.log(`📁 Serving static file with no-cache: ${path.basename(filePath)}`);
    }
  }));
} else {
  console.log('⚠️ Client build directory not found');
}

// CACHE-DISABLED REACT APP SERVING
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.resolve(__dirname, '../client/build/index.html');
  
  if (require('fs').existsSync(indexPath)) {
    console.log(`🎯 Serving React app with no-cache for: ${req.path}`);
    
    // Aggressive cache disabling for React app
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('X-Accel-Expires', '0');
    res.setHeader('Vary', '*');
    
    res.sendFile(indexPath);
  } else {
    console.log('⚠️ React app index.html not found - serving minimal fallback');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Analytical Testing Laboratory</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
          <meta http-equiv="Pragma" content="no-cache">
          <meta http-equiv="Expires" content="0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 50px; text-align: center; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 24px; margin: 10px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; cursor: pointer; border: none; font-size: 16px; }
            .button:hover { background-color: #0056b3; }
            .status { color: #dc3545; font-weight: bold; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🧪 Analytical Testing Laboratory</h1>
            <div class="status">⚠️ React Build Not Found</div>
            <div style="margin: 30px 0;">
              <button class="button" onclick="window.location.reload();">🔄 Reload</button>
              <button class="button" onclick="window.open('/api/health', '_blank');">🔍 Health Check</button>
            </div>
            <p><small>Cache disabled - Server running on Railway</small></p>
          </div>
        </body>
      </html>
    `);
  }
});

// Error handling
app.use(errorHandler);

// Start server
console.log('🚀 Starting Railway server with cache disabled...');
const server = app.listen(PORT, HOST, () => {
  console.log(`✅ RAILWAY SUCCESS: Server running on ${HOST}:${PORT}`);
  console.log(`🚫 CACHE: Completely disabled for all static files and React app`);
  console.log(`🔍 Health: http://${HOST}:${PORT}/api/health`);
  console.log(`🌐 API: http://${HOST}:${PORT}/api`);
  
  // Database connection (non-blocking)
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connected successfully');
      return sequelize.sync({ force: false, alter: false });
    })
    .then(() => {
      console.log('✅ Database synchronized');
      
      // Setup admin user for production
      if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
        setTimeout(async () => {
          try {
            const { setupRailwayAdmin } = require('./scripts/railway-admin-setup');
            await setupRailwayAdmin();
            console.log('✅ Admin setup completed');
          } catch (error) {
            console.error('⚠️ Admin setup failed (non-critical):', error.message);
          }
        }, 2000);
      }
    })
    .catch(err => {
      console.error('⚠️ Database connection failed (server still running):', err.message);
    });
});

// Error handling
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
