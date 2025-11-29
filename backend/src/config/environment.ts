import * as dotenv from 'dotenv';
import * as path from 'path';

// Define environment types
export type Environment = 'development' | 'staging' | 'production' | 'test';

// Load environment-specific .env file
const NODE_ENV = (process.env.NODE_ENV as Environment) || 'development';

// Load .env.{environment} file if it exists
const envFile = `.env.${NODE_ENV}`;
const envPath = path.resolve(process.cwd(), envFile);

dotenv.config({ path: envPath });

// If environment-specific file doesn't exist, try .env
if (!process.env.DB_HOST) {
  dotenv.config();
}

// Environment helper functions
export const isDevelopment = NODE_ENV === 'development';
export const isStaging = NODE_ENV === 'staging';
export const isProduction = NODE_ENV === 'production';
export const isTest = NODE_ENV === 'test';

// Type-safe environment configuration
export interface EnvironmentConfig {
  // Server
  port: number;
  nodeEnv: Environment;

  // Database
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
  };

  // JWT
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };

  // Cookie
  cookie: {
    secret: string;
    secure: boolean;
  };

  // Frontend
  frontendUrl: string;

  // Email
  email: {
    sendgridApiKey?: string;
    from: string;
    fromName: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
  };

  // SMS
  sms: {
    twilioAccountSid?: string;
    twilioAuthToken?: string;
    twilioPhoneNumber?: string;
  };

  // File Upload
  fileUpload: {
    maxSize: number;
    uploadPath: string;
    allowedTypes: string[];
  };

  // AWS S3
  aws?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3Bucket: string;
  };

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    authMax: number;
    otpMax: number;
  };

  // Security
  security: {
    bcryptRounds: number;
    otpExpiryMinutes: number;
    passwordResetExpiryMinutes: number;
  };

  // Logging
  logging: {
    level: string;
    filePath: string;
  };

  // Feature Flags
  features: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    fileUploads: boolean;
    debugRoutes: boolean;
    apiDocs: boolean;
    showStackTrace: boolean;
  };
}

/**
 * Get a required environment variable
 * Throws error if not found
 */
function getRequired(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get an optional environment variable with default
 */
function getOptional(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Get a boolean environment variable
 */
function getBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get a number environment variable
 */
function getNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  if (isNaN(num)) return defaultValue;
  return num;
}

/**
 * Validate required environment variables for production
 */
function validateProduction(): void {
  const requiredVars = [
    'DB_HOST',
    'DB_PASSWORD',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'COOKIE_SECRET',
  ];

  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Production environment missing required variables: ${missing.join(', ')}\n` +
        'Please set these in your .env.production file or environment.'
    );
  }

  // Validate JWT secrets are strong in production
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn(
      '⚠️  WARNING: JWT_SECRET should be at least 32 characters in production!'
    );
  }

  // Warn if using default/weak passwords
  const weakPasswords = ['password', 'admin', 'root', '123456'];
  if (process.env.DB_PASSWORD && weakPasswords.includes(process.env.DB_PASSWORD)) {
    throw new Error('⛔ Cannot use weak database password in production!');
  }
}

/**
 * Build and validate environment configuration
 */
export function buildConfig(): EnvironmentConfig {
  // Validate production environment
  if (isProduction) {
    validateProduction();
  }

  const config: EnvironmentConfig = {
    port: getNumber('PORT', 5000),
    nodeEnv: NODE_ENV,

    database: {
      host: getRequired('DB_HOST'),
      port: getNumber('DB_PORT', 5432),
      username: getRequired('DB_USERNAME'),
      password: getRequired('DB_PASSWORD'),
      database: getRequired('DB_DATABASE'),
      synchronize: getBoolean('TYPEORM_SYNC', isDevelopment),
      logging: getBoolean('TYPEORM_LOGGING', isDevelopment),
    },

    jwt: {
      secret: getRequired('JWT_SECRET'),
      expiresIn: getOptional('JWT_EXPIRES_IN', '7d'),
      refreshSecret: getRequired('JWT_REFRESH_SECRET'),
      refreshExpiresIn: getOptional('JWT_REFRESH_EXPIRES_IN', '30d'),
    },

    cookie: {
      secret: getRequired('COOKIE_SECRET'),
      secure: getBoolean('COOKIE_SECURE', isProduction || isStaging),
    },

    frontendUrl: getOptional(
      'FRONTEND_URL',
      isDevelopment ? 'http://localhost:5173' : 'https://app.kidsany.com'
    ),

    email: {
      sendgridApiKey: getOptional('SENDGRID_API_KEY', ''),
      from: getOptional('EMAIL_FROM', 'noreply@kidsany.com'),
      fromName: getOptional('EMAIL_FROM_NAME', 'Kidsany'),
      smtpHost: getOptional('SMTP_HOST', ''),
      smtpPort: getNumber('SMTP_PORT', 587),
      smtpUser: getOptional('SMTP_USER', ''),
      smtpPassword: getOptional('SMTP_PASSWORD', ''),
    },

    sms: {
      twilioAccountSid: getOptional('TWILIO_ACCOUNT_SID', ''),
      twilioAuthToken: getOptional('TWILIO_AUTH_TOKEN', ''),
      twilioPhoneNumber: getOptional('TWILIO_PHONE_NUMBER', ''),
    },

    fileUpload: {
      maxSize: getNumber('MAX_FILE_SIZE', 10485760), // 10MB default
      uploadPath: getOptional('UPLOAD_PATH', './uploads'),
      allowedTypes: getOptional(
        'ALLOWED_FILE_TYPES',
        'image/jpeg,image/png,image/gif,application/pdf'
      ).split(','),
    },

    rateLimit: {
      windowMs: getNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
      maxRequests: getNumber('RATE_LIMIT_MAX_REQUESTS', isDevelopment ? 1000 : 100),
      authMax: getNumber('AUTH_RATE_LIMIT_MAX', isDevelopment ? 50 : 5),
      otpMax: getNumber('OTP_RATE_LIMIT_MAX', isDevelopment ? 30 : 3),
    },

    security: {
      bcryptRounds: getNumber('BCRYPT_ROUNDS', isProduction ? 12 : isDevelopment ? 4 : 10),
      otpExpiryMinutes: getNumber('OTP_EXPIRY_MINUTES', isDevelopment ? 30 : 5),
      passwordResetExpiryMinutes: getNumber(
        'PASSWORD_RESET_EXPIRY_MINUTES',
        isDevelopment ? 60 : 15
      ),
    },

    logging: {
      level: getOptional(
        'LOG_LEVEL',
        isDevelopment ? 'debug' : isProduction ? 'error' : 'info'
      ),
      filePath: getOptional('LOG_FILE_PATH', `./logs/${NODE_ENV}.log`),
    },

    features: {
      emailNotifications: getBoolean('ENABLE_EMAIL_NOTIFICATIONS', false),
      smsNotifications: getBoolean('ENABLE_SMS_NOTIFICATIONS', false),
      fileUploads: getBoolean('ENABLE_FILE_UPLOADS', isDevelopment),
      debugRoutes: getBoolean('ENABLE_DEBUG_ROUTES', isDevelopment || isStaging),
      apiDocs: getBoolean('ENABLE_API_DOCS', isDevelopment || isStaging),
      showStackTrace: getBoolean('SHOW_STACK_TRACE', isDevelopment || isStaging),
    },
  };

  // Log configuration (without sensitive data)
  console.log('🔧 Environment Configuration:');
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Database: ${config.database.host}:${config.database.port}/${config.database.database}`);
  console.log(`   DB Sync: ${config.database.synchronize ? '✅ ON' : '⛔ OFF'}`);
  console.log(`   Frontend URL: ${config.frontendUrl}`);
  console.log(`   Log Level: ${config.logging.level}`);
  console.log(`   Email Notifications: ${config.features.emailNotifications ? '✅' : '⛔'}`);
  console.log(`   SMS Notifications: ${config.features.smsNotifications ? '✅' : '⛔'}`);

  if (isDevelopment) {
    console.log('💡 Development mode features:');
    console.log('   - OTP returned in API responses');
    console.log('   - Detailed error messages');
    console.log('   - Database auto-sync enabled');
    console.log('   - Relaxed rate limiting');
  }

  if (isProduction) {
    console.log('🔒 Production mode active:');
    console.log('   - Strict security settings');
    console.log('   - No debug features');
    console.log('   - Database migrations required');
  }

  return config;
}

// Build and export configuration
export const config = buildConfig();

// Export environment
export const environment = NODE_ENV;
