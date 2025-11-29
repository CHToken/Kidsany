import rateLimit from 'express-rate-limit';
import { config } from '../config/environment';
import { RATE_LIMIT_MESSAGES } from '../config/constants';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: RATE_LIMIT_MESSAGES.GENERAL,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMaxAttempts,
  message: {
    success: false,
    message: RATE_LIMIT_MESSAGES.AUTH,
  },
  skipSuccessfulRequests: false,
});

// OTP request limiter
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: config.rateLimit.otpMaxAttempts,
  message: {
    success: false,
    message: RATE_LIMIT_MESSAGES.OTP,
  },
});

// File upload limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.',
  },
});
