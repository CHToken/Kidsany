import { isDevelopment, isProduction, isStaging, config } from './environment';

/**
 * Environment-specific constants
 * These values change based on the current environment
 */

// HTTP Status Messages
export const HTTP_MESSAGES = {
  SUCCESS: 'Request successful',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  BAD_REQUEST: 'Invalid request',
  SERVER_ERROR: 'Internal server error',
  RATE_LIMIT: 'Too many requests',
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_LIMIT: isDevelopment ? 100 : 50,
  MAX_LIMIT: isDevelopment ? 500 : 100,
  DEFAULT_OFFSET: 0,
};

// Error Detail Levels
export const ERROR_DETAIL_LEVEL = {
  SHOW_STACK: isDevelopment || isStaging,
  SHOW_VALIDATION: true,
  SHOW_DB_ERRORS: isDevelopment,
};

// CORS Configuration
export const CORS_CONFIG = {
  ORIGIN: config.frontendUrl,
  CREDENTIALS: true,
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
  // In development, allow all origins
  ...(isDevelopment && { ORIGIN: '*' }),
};

// Cookie Configuration
export const COOKIE_CONFIG = {
  HTTP_ONLY: true,
  SECURE: config.cookie.secure,
  SAME_SITE: isProduction ? 'strict' : 'lax',
  MAX_AGE: 30 * 24 * 60 * 60 * 1000, // 30 days
  PATH: '/',
};

// Rate Limit Messages
export const RATE_LIMIT_MESSAGES = {
  GENERAL: 'Too many requests from this IP, please try again later.',
  AUTH: 'Too many authentication attempts, please try again later.',
  OTP: 'Too many OTP requests, please try again later.',
};

// Database Configuration - Optimized for millions of users
export const DATABASE_CONFIG = {
  // Connection pooling for high performance
  POOL_SIZE: isDevelopment ? 10 : isProduction ? 50 : 20,
  MIN_POOL_SIZE: isDevelopment ? 2 : 10,
  CONNECTION_TIMEOUT: isDevelopment ? 10000 : 30000,
  IDLE_TIMEOUT: isDevelopment ? 30000 : 60000,
  ACQUIRE_TIMEOUT: 60000, // Max time to acquire connection from pool

  // Query optimization
  STATEMENT_TIMEOUT: isProduction ? 30000 : 0, // Kill queries after 30s in production
  ENABLE_QUERY_CACHE: !isDevelopment, // Enable query result caching
  CACHE_DURATION: 300000, // 5 minutes

  // Performance monitoring
  MAX_QUERY_EXECUTION_TIME: isProduction ? 10000 : 0, // Log slow queries > 10s
  ENABLE_QUERY_LOGGING: isDevelopment,
  LOG_QUERY_PARAMETERS: isDevelopment,

  // Read replicas (for future horizontal scaling)
  ENABLE_READ_REPLICAS: isProduction,
  READ_REPLICA_HOSTS: process.env.DB_READ_REPLICAS?.split(',') || [],

  // Batch processing
  DEFAULT_BATCH_SIZE: 1000,
  MAX_BATCH_SIZE: 5000,
};

// Session Configuration
export const SESSION_CONFIG = {
  ACCESS_TOKEN_EXPIRY: config.jwt.expiresIn,
  REFRESH_TOKEN_EXPIRY: config.jwt.refreshExpiresIn,
  SESSION_TIMEOUT: isProduction ? 3600 : isDevelopment ? 86400 : 7200, // seconds
};

// File Upload Configuration
export const FILE_UPLOAD_CONFIG = {
  MAX_SIZE: config.fileUpload.maxSize,
  ALLOWED_TYPES: config.fileUpload.allowedTypes,
  UPLOAD_PATH: config.fileUpload.uploadPath,
  TEMP_PATH: './temp',
};

// Security Configuration
export const SECURITY_CONFIG = {
  BCRYPT_ROUNDS: config.security.bcryptRounds,
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: config.security.otpExpiryMinutes,
  PASSWORD_RESET_EXPIRY_MINUTES: config.security.passwordResetExpiryMinutes,
  MIN_PASSWORD_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: isProduction ? 5 : 10,
  LOCKOUT_DURATION: isProduction ? 900 : 300, // seconds
};

// Email Configuration
export const EMAIL_CONFIG = {
  FROM: config.email.from,
  FROM_NAME: config.email.fromName,
  ENABLED: config.features.emailNotifications,
  // Email templates
  TEMPLATES: {
    WELCOME: 'welcome',
    PASSWORD_RESET: 'password-reset',
    OTP: 'otp-verification',
    NOTIFICATION: 'notification',
  },
};

// SMS Configuration
export const SMS_CONFIG = {
  ENABLED: config.features.smsNotifications,
  FROM: config.sms.twilioPhoneNumber || '+1234567890',
  // SMS templates
  TEMPLATES: {
    OTP: (otp: string) => `Your Kidsany verification code is: ${otp}. Valid for ${config.security.otpExpiryMinutes} minutes.`,
    PASSWORD_RESET: (code: string) =>
      `Your password reset code is: ${code}. Valid for ${config.security.passwordResetExpiryMinutes} minutes.`,
  },
};

// Logging Configuration
export const LOGGING_CONFIG = {
  LEVEL: config.logging.level,
  FILE_PATH: config.logging.filePath,
  CONSOLE_ENABLED: true,
  FILE_ENABLED: isProduction || isStaging,
  // Log sensitive data only in development
  LOG_REQUESTS: isDevelopment,
  LOG_RESPONSES: isDevelopment,
  LOG_ERRORS: true,
};

// API Documentation
export const API_DOCS_CONFIG = {
  ENABLED: config.features.apiDocs,
  SWAGGER_PATH: '/api-docs',
  POSTMAN_PATH: '/postman',
};

// Debug Routes
export const DEBUG_CONFIG = {
  ENABLED: config.features.debugRoutes,
  ROUTES: {
    HEALTH_DETAILED: '/debug/health',
    DATABASE: '/debug/database',
    CACHE: '/debug/cache',
    CONFIG: '/debug/config',
  },
};

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  // How many notifications to fetch by default
  DEFAULT_LIMIT: 50,
  // Auto-mark as read after viewing
  AUTO_MARK_READ: true,
  // Notification types
  TYPES: {
    FEEDBACK: 'feedback',
    TEST_SCORE: 'test_score',
    ATTENDANCE: 'attendance',
    BEHAVIOR: 'behavior',
    ASSIGNMENT: 'assignment',
    MESSAGE: 'message',
    GENERAL: 'general',
  },
};

// Academic Configuration
export const ACADEMIC_CONFIG = {
  CURRENT_YEAR: new Date().getFullYear(),
  GRADE_SCALE: {
    A: 90,
    B: 80,
    C: 70,
    D: 60,
    F: 0,
  },
  ATTENDANCE_THRESHOLD: 75, // Minimum acceptable attendance %
};

// Cache Configuration (if using Redis)
export const CACHE_CONFIG = {
  ENABLED: Boolean(process.env.REDIS_HOST),
  TTL: {
    SHORT: 300, // 5 minutes
    MEDIUM: 1800, // 30 minutes
    LONG: 3600, // 1 hour
  },
  KEYS: {
    STUDENT_DATA: 'student:',
    ATTENDANCE: 'attendance:',
    SETTINGS: 'settings:',
  },
};

// Environment-specific feature flags
export const FEATURES = {
  EMAIL_NOTIFICATIONS: config.features.emailNotifications,
  SMS_NOTIFICATIONS: config.features.smsNotifications,
  FILE_UPLOADS: config.features.fileUploads,
  DEBUG_ROUTES: config.features.debugRoutes,
  API_DOCS: config.features.apiDocs,
  SHOW_STACK_TRACE: config.features.showStackTrace,

  // Return sensitive data in development
  RETURN_OTP_IN_RESPONSE: isDevelopment,
  RETURN_RESET_TOKEN_IN_RESPONSE: isDevelopment,

  // Enable detailed error messages
  DETAILED_ERRORS: isDevelopment || isStaging,

  // Enable request logging
  LOG_REQUESTS: isDevelopment,
};

// Export environment type for type checking
export { isDevelopment, isProduction, isStaging };
