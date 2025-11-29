import { Router } from 'express';
import { ParentAuthController } from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/error.middleware';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.middleware';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.middleware';

const router = Router();

// Validation rules
const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  handleValidationErrors,
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const phoneValidation = [
  body('phoneNumber')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Valid phone number is required'),
  handleValidationErrors,
];

const otpValidation = [
  body('phoneNumber')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Valid phone number is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  handleValidationErrors,
];

const resetPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('resetToken').notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  handleValidationErrors,
];

// Routes
router.post(
  '/register',
  authLimiter,
  registerValidation,
  asyncHandler(ParentAuthController.registerWithEmail)
);

router.post(
  '/login',
  authLimiter,
  loginValidation,
  asyncHandler(ParentAuthController.loginWithEmail)
);

router.post(
  '/request-otp',
  otpLimiter,
  phoneValidation,
  asyncHandler(ParentAuthController.requestOTP)
);

router.post(
  '/verify-otp',
  authLimiter,
  otpValidation,
  asyncHandler(ParentAuthController.verifyOTP)
);

router.post('/logout', asyncHandler(ParentAuthController.logout));

router.post(
  '/request-password-reset',
  authLimiter,
  [body('email').isEmail().withMessage('Valid email is required'), handleValidationErrors],
  asyncHandler(ParentAuthController.requestPasswordReset)
);

router.post(
  '/reset-password',
  authLimiter,
  resetPasswordValidation,
  asyncHandler(ParentAuthController.resetPassword)
);

export default router;
