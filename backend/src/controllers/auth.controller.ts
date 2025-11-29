import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Parent, AuthProvider } from '../entities/Parent';
import { NotificationPreference } from '../entities/NotificationPreference';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { generateOTP, getOTPExpiry, verifyOTP } from '../utils/otp.utils';
import {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} from '../utils/jwt.utils';
import { AppError } from '../middleware/error.middleware';
import { FEATURES } from '../config/constants';

const parentRepository = AppDataSource.getRepository(Parent);
const notificationPrefRepository = AppDataSource.getRepository(
  NotificationPreference
);

export class ParentAuthController {
  // Register parent with email
  static async registerWithEmail(req: Request, res: Response) {
    const { firstName, lastName, email, password } = req.body;

    // Check if parent already exists
    const existingParent = await parentRepository.findOne({
      where: { email },
    });

    if (existingParent) {
      throw new AppError('Parent with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create parent
    const parent = parentRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      authProvider: AuthProvider.EMAIL,
    });

    await parentRepository.save(parent);

    // Create default notification preferences
    const notificationPref = notificationPrefRepository.create({
      parentId: parent.id,
    });
    await notificationPrefRepository.save(notificationPref);

    // Generate tokens
    const accessToken = generateAccessToken({
      id: parent.id,
      role: 'parent',
      email: parent.email!,
    });

    const refreshToken = generateRefreshToken({
      id: parent.id,
      role: 'parent',
      email: parent.email!,
    });

    setTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Parent registered successfully',
      data: {
        parent: {
          id: parent.id,
          firstName: parent.firstName,
          lastName: parent.lastName,
          email: parent.email,
        },
        accessToken,
      },
    });
  }

  // Login with email and password
  static async loginWithEmail(req: Request, res: Response) {
    const { email, password } = req.body;

    // Find parent
    const parent = await parentRepository.findOne({
      where: { email, isActive: true },
    });

    if (!parent || !parent.password) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, parent.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    parent.lastLogin = new Date();
    await parentRepository.save(parent);

    // Generate tokens
    const accessToken = generateAccessToken({
      id: parent.id,
      role: 'parent',
      email: parent.email!,
    });

    const refreshToken = generateRefreshToken({
      id: parent.id,
      role: 'parent',
      email: parent.email!,
    });

    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        parent: {
          id: parent.id,
          firstName: parent.firstName,
          lastName: parent.lastName,
          email: parent.email,
        },
        accessToken,
      },
    });
  }

  // Request OTP for phone login
  static async requestOTP(req: Request, res: Response) {
    const { phoneNumber } = req.body;

    // Find or create parent
    let parent = await parentRepository.findOne({
      where: { phoneNumber },
    });

    if (!parent) {
      // Create new parent with phone number
      parent = parentRepository.create({
        phoneNumber,
        authProvider: AuthProvider.PHONE,
        firstName: 'Parent', // Will be updated later
        lastName: phoneNumber,
      });
    }

    // Generate OTP
    const otp = generateOTP();
    parent.otpCode = otp;
    parent.otpExpiry = getOTPExpiry();

    await parentRepository.save(parent);

    // TODO: Send OTP via SMS (integrate with SMS service)
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phoneNumber,
        // In development, return OTP for testing
        ...(FEATURES.RETURN_OTP_IN_RESPONSE && { otp }),
      },
    });
  }

  // Verify OTP and login
  static async verifyOTP(req: Request, res: Response) {
    const { phoneNumber, otp } = req.body;

    const parent = await parentRepository.findOne({
      where: { phoneNumber, isActive: true },
    });

    if (!parent) {
      throw new AppError('Parent not found', 404);
    }

    // Verify OTP
    const otpVerification = verifyOTP(otp, parent.otpCode!, parent.otpExpiry!);

    if (!otpVerification.isValid) {
      throw new AppError(otpVerification.message || 'Invalid OTP', 400);
    }

    // Clear OTP
    parent.otpCode = null;
    parent.otpExpiry = null;
    parent.lastLogin = new Date();
    await parentRepository.save(parent);

    // Create notification preferences if not exists
    const existingPref = await notificationPrefRepository.findOne({
      where: { parentId: parent.id },
    });

    if (!existingPref) {
      const notificationPref = notificationPrefRepository.create({
        parentId: parent.id,
      });
      await notificationPrefRepository.save(notificationPref);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: parent.id,
      role: 'parent',
      email: parent.email || phoneNumber,
    });

    const refreshToken = generateRefreshToken({
      id: parent.id,
      role: 'parent',
      email: parent.email || phoneNumber,
    });

    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        parent: {
          id: parent.id,
          firstName: parent.firstName,
          lastName: parent.lastName,
          phoneNumber: parent.phoneNumber,
        },
        accessToken,
      },
    });
  }

  // Logout
  static async logout(req: Request, res: Response) {
    clearTokenCookies(res);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  }

  // Reset password request
  static async requestPasswordReset(req: Request, res: Response) {
    const { email } = req.body;

    const parent = await parentRepository.findOne({
      where: { email },
    });

    if (!parent) {
      // Don't reveal if email exists
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = generateOTP();
    parent.otpCode = resetToken;
    parent.otpExpiry = getOTPExpiry();

    await parentRepository.save(parent);

    // TODO: Send reset email
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to your email',
      // In development, return reset token for testing
      ...(FEATURES.RETURN_RESET_TOKEN_IN_RESPONSE && { resetToken }),
    });
  }

  // Reset password
  static async resetPassword(req: Request, res: Response) {
    const { email, resetToken, newPassword } = req.body;

    const parent = await parentRepository.findOne({
      where: { email },
    });

    if (!parent) {
      throw new AppError('Invalid reset token', 400);
    }

    // Verify reset token
    const tokenVerification = verifyOTP(
      resetToken,
      parent.otpCode!,
      parent.otpExpiry!
    );

    if (!tokenVerification.isValid) {
      throw new AppError(tokenVerification.message || 'Invalid reset token', 400);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    parent.password = hashedPassword;
    parent.otpCode = null;
    parent.otpExpiry = null;

    await parentRepository.save(parent);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  }
}
