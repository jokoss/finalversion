const logger = require('./logger');

// In-memory cache implementation
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      clears: 0
    };
  }

  get(key) {
    if (this.cache.has(key)) {
      const item = this.cache.get(key);
      if (item.expires && Date.now() > item.expires) {
        this.delete(key);
        this.stats.misses++;
        return null;
      }
      this.stats.hits++;
      return item.value;
    }
    this.stats.misses++;
    return null;
  }

  set(key, value, ttl = null) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    const item = {
      value,
      created: Date.now(),
      expires: ttl ? Date.now() + (ttl * 1000) : null
    };

    this.cache.set(key, item);
    this.stats.sets++;

    // Set expiration timer if TTL is specified
    if (ttl) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl * 1000);
      this.timers.set(key, timer);
    }

    logger.debug(`Cache SET: ${key} (TTL: ${ttl || 'none'})`);
    return true;
  }

  delete(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.stats.deletes++;
      
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }
      
      logger.debug(`Cache DELETE: ${key}`);
      return true;
    }
    return false;
  }

  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.cache.clear();
    this.timers.clear();
    this.stats.clears++;
    
    logger.info('Cache cleared');
  }

  has(key) {
    if (this.cache.has(key)) {
      const item = this.cache.get(key);
      if (item.expires && Date.now() > item.expires) {
        this.delete(key);
        return false;
      }
      return true;
    }
    return false;
  }

  keys() {
    const validKeys = [];
    for (const [key, item] of this.cache.entries()) {
      if (!item.expires || Date.now() <= item.expires) {
        validKeys.push(key);
      } else {
        this.delete(key);
      }
    }
    return validKeys;
  }

  size() {
    // Clean expired items first
    this.keys();
    return this.cache.size;
  }

  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.size(),
      memoryUsage: this.getMemoryUsage()
    };
  }

  getMemoryUsage() {
    let totalSize = 0;
    for (const [key, item] of this.cache.entries()) {
      totalSize += this.estimateSize(key) + this.estimateSize(item);
    }
    return `${(totalSize / 1024 / 1024).toFixed(2)} MB`;
  }

  estimateSize(obj) {
    const str = JSON.stringify(obj);
    return str.length * 2; // Rough estimate (UTF-16)
  }

  // Clean up expired items
  cleanup() {
    let cleaned = 0;
    for (const [key, item] of this.cache.entries()) {
      if (item.expires && Date.now() > item.expires) {
        this.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      logger.debug(`Cache cleanup: removed ${cleaned} expired items`);
    }
    return cleaned;
  }
}

// Redis cache implementation (if Redis is available)
class RedisCache {
  constructor(redisClient) {
    this.redis = redisClient;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      clears: 0
    };
  }

  async get(key) {
    try {
      const value = await this.redis.get(key);
      if (value !== null) {
        this.stats.hits++;
        return JSON.parse(value);
      }
      this.stats.misses++;
      return null;
    } catch (error) {
      logger.error('Redis GET error:', error);
      this.stats.misses++;
      return null;
    }
  }

  async set(key, value, ttl = null) {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      this.stats.sets++;
      logger.debug(`Redis SET: ${key} (TTL: ${ttl || 'none'})`);
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  async delete(key) {
    try {
      const result = await this.redis.del(key);
      if (result > 0) {
        this.stats.deletes++;
        logger.debug(`Redis DELETE: ${key}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Redis DELETE error:', error);
      return false;
    }
  }

  async clear() {
    try {
      await this.redis.flushdb();
      this.stats.clears++;
      logger.info('Redis cache cleared');
      return true;
    } catch (error) {
      logger.error('Redis CLEAR error:', error);
      return false;
    }
  }

  async has(key) {
    try {
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async keys(pattern = '*') {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      logger.error('Redis KEYS error:', error);
      return [];
    }
  }

  async size() {
    try {
      return await this.redis.dbsize();
    } catch (error) {
      logger.error('Redis SIZE error:', error);
      return 0;
    }
  }

  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      type: 'redis'
    };
  }
}

// Cache factory and manager
class CacheManager {
  constructor() {
    this.cache = null;
    this.defaultTTL = parseInt(process.env.CACHE_TTL) || 3600; // 1 hour default
    this.init();
  }

  init() {
    // Try to initialize Redis cache if URL is provided
    if (process.env.REDIS_URL) {
      try {
        const redis = require('redis');
        const client = redis.createClient({
          url: process.env.REDIS_URL,
          retry_strategy: (options) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              logger.warn('Redis connection refused, falling back to memory cache');
              return undefined; // Stop retrying
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
              logger.warn('Redis retry time exhausted, falling back to memory cache');
              return undefined;
            }
            return Math.min(options.attempt * 100, 3000);
          }
        });

        client.on('connect', () => {
          logger.info('✅ Redis cache connected');
          this.cache = new RedisCache(client);
        });

        client.on('error', (err) => {
          logger.warn('Redis cache error, falling back to memory cache:', err.message);
          this.cache = new MemoryCache();
        });

        // Set initial fallback
        this.cache = new MemoryCache();
        
      } catch (error) {
        logger.warn('Redis initialization failed, using memory cache:', error.message);
        this.cache = new MemoryCache();
      }
    } else {
      logger.info('No Redis URL provided, using memory cache');
      this.cache = new MemoryCache();
    }

    // Start cleanup interval for memory cache
    if (this.cache instanceof MemoryCache) {
      setInterval(() => {
        this.cache.cleanup();
      }, 5 * 60 * 1000); // Cleanup every 5 minutes
    }
  }

  // Wrapper methods
  async get(key) {
    return await this.cache.get(key);
  }

  async set(key, value, ttl = null) {
    return await this.cache.set(key, value, ttl || this.defaultTTL);
  }

  async delete(key) {
    return await this.cache.delete(key);
  }

  async clear() {
    return await this.cache.clear();
  }

  async has(key) {
    return await this.cache.has(key);
  }

  async keys(pattern) {
    return await this.cache.keys(pattern);
  }

  async size() {
    return await this.cache.size();
  }

  getStats() {
    return this.cache.getStats();
  }

  // Cache key generators
  generateKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  }

  // Common cache patterns
  async remember(key, ttl, callback) {
    let value = await this.get(key);
    if (value === null) {
      value = await callback();
      if (value !== null && value !== undefined) {
        await this.set(key, value, ttl);
      }
    }
    return value;
  }

  async forget(pattern) {
    const keys = await this.keys(pattern);
    const promises = keys.map(key => this.delete(key));
    return await Promise.all(promises);
  }

  // Cache tags for group invalidation
  async tag(tags, key, value, ttl = null) {
    await this.set(key, value, ttl);
    
    // Store tag associations
    for (const tag of tags) {
      const tagKey = this.generateKey('tag', tag);
      let taggedKeys = await this.get(tagKey) || [];
      if (!taggedKeys.includes(key)) {
        taggedKeys.push(key);
        await this.set(tagKey, taggedKeys, ttl);
      }
    }
  }

  async invalidateTag(tag) {
    const tagKey = this.generateKey('tag', tag);
    const taggedKeys = await this.get(tagKey) || [];
    
    const promises = taggedKeys.map(key => this.delete(key));
    promises.push(this.delete(tagKey));
    
    return await Promise.all(promises);
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Export cache utilities
module.exports = {
  cache: cacheManager,
  MemoryCache,
  RedisCache,
  CacheManager,
  
  // Middleware for caching responses
  cacheMiddleware: (ttl = null, keyGenerator = null) => {
    return async (req, res, next) => {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Generate cache key
      const key = keyGenerator 
        ? keyGenerator(req)
        : cacheManager.generateKey('http', req.originalUrl, JSON.stringify(req.query));

      try {
        // Try to get cached response
        const cached = await cacheManager.get(key);
        if (cached) {
          logger.debug(`Cache HIT: ${key}`);
          return res.json(cached);
        }

        // Cache miss - intercept response
        const originalJson = res.json;
        res.json = function(data) {
          // Cache the response
          cacheManager.set(key, data, ttl).catch(err => {
            logger.error('Cache set error:', err);
          });
          
          logger.debug(`Cache MISS: ${key}`);
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        logger.error('Cache middleware error:', error);
        next();
      }
    };
  },

  // Cache invalidation middleware
  invalidateMiddleware: (patterns) => {
    return async (req, res, next) => {
      // Store original methods
      const originalJson = res.json;
      const originalSend = res.send;

      // Override response methods to invalidate cache on success
      const invalidateCache = async () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            for (const pattern of patterns) {
              const keys = await cacheManager.keys(pattern);
              await Promise.all(keys.map(key => cacheManager.delete(key)));
              logger.debug(`Cache invalidated: ${pattern}`);
            }
          } catch (error) {
            logger.error('Cache invalidation error:', error);
          }
        }
      };

      res.json = function(data) {
        invalidateCache();
        return originalJson.call(this, data);
      };

      res.send = function(data) {
        invalidateCache();
        return originalSend.call(this, data);
      };

      next();
    };
  }
};
