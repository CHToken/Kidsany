import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Parent } from '../entities/Parent';
import { NotificationPreference } from '../entities/NotificationPreference';
import { AppError } from '../middleware/error.middleware';
import { hashPassword, comparePassword } from '../utils/password.utils';

const parentRepository = AppDataSource.getRepository(Parent);
const notificationPrefRepository = AppDataSource.getRepository(NotificationPreference);

export class ParentController {
  // Get parent profile
  static async getProfile(req: Request, res: Response) {
    const parentId = req.user!.id;

    const parent = await parentRepository.findOne({
      where: { id: parentId },
      relations: ['students', 'students.class'],
    });

    if (!parent) {
      throw new AppError('Parent not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        parent: {
          id: parent.id,
          firstName: parent.firstName,
          lastName: parent.lastName,
          email: parent.email,
          phoneNumber: parent.phoneNumber,
          profilePicture: parent.profilePicture,
          authProvider: parent.authProvider,
          lastLogin: parent.lastLogin,
          students: parent.students
            ? parent.students.map((s) => ({
                id: s.id,
                firstName: s.firstName,
                lastName: s.lastName,
                admissionNumber: s.admissionNumber,
                profilePicture: s.profilePicture,
                class: s.class
                  ? {
                      name: s.class.name,
                      grade: s.class.grade,
                    }
                  : null,
              }))
            : [],
          createdAt: parent.createdAt,
          updatedAt: parent.updatedAt,
        },
      },
    });
  }

  // Update parent profile
  static async updateProfile(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { firstName, lastName, phoneNumber, profilePicture } = req.body;

    const parent = await parentRepository.findOne({
      where: { id: parentId },
    });

    if (!parent) {
      throw new AppError('Parent not found', 404);
    }

    // Update fields if provided
    if (firstName) parent.firstName = firstName.trim();
    if (lastName) parent.lastName = lastName.trim();
    if (phoneNumber) {
      // Check if phone number is already used by another parent
      const existingParent = await parentRepository.findOne({
        where: { phoneNumber },
      });

      if (existingParent && existingParent.id !== parentId) {
        throw new AppError('Phone number already in use', 400);
      }

      parent.phoneNumber = phoneNumber;
    }
    if (profilePicture !== undefined) parent.profilePicture = profilePicture;

    await parentRepository.save(parent);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        parent: {
          id: parent.id,
          firstName: parent.firstName,
          lastName: parent.lastName,
          email: parent.email,
          phoneNumber: parent.phoneNumber,
          profilePicture: parent.profilePicture,
          updatedAt: parent.updatedAt,
        },
      },
    });
  }

  // Change password
  static async changePassword(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400);
    }

    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters long', 400);
    }

    const parent = await parentRepository.findOne({
      where: { id: parentId },
    });

    if (!parent || !parent.password) {
      throw new AppError('Parent not found or password not set', 404);
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, parent.password);

    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash and update new password
    parent.password = await hashPassword(newPassword);
    await parentRepository.save(parent);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  }

  // Get notification preferences
  static async getNotificationPreferences(req: Request, res: Response) {
    const parentId = req.user!.id;

    let preferences = await notificationPrefRepository.findOne({
      where: { parentId },
    });

    // Create default preferences if not exists
    if (!preferences) {
      preferences = notificationPrefRepository.create({
        parentId,
      });
      await notificationPrefRepository.save(preferences);
    }

    res.status(200).json({
      success: true,
      message: 'Notification preferences retrieved successfully',
      data: {
        preferences: {
          id: preferences.id,
          emailNotifications: preferences.emailNotifications,
          smsNotifications: preferences.smsNotifications,
          inAppNotifications: preferences.inAppNotifications,
          feedbackNotifications: preferences.feedbackNotifications,
          testScoreNotifications: preferences.testScoreNotifications,
          attendanceNotifications: preferences.attendanceNotifications,
          behaviorNotifications: preferences.behaviorNotifications,
          assignmentNotifications: preferences.assignmentNotifications,
          messageNotifications: preferences.messageNotifications,
          updatedAt: preferences.updatedAt,
        },
      },
    });
  }

  // Update notification preferences
  static async updateNotificationPreferences(req: Request, res: Response) {
    const parentId = req.user!.id;
    const {
      emailNotifications,
      smsNotifications,
      inAppNotifications,
      feedbackNotifications,
      testScoreNotifications,
      attendanceNotifications,
      behaviorNotifications,
      assignmentNotifications,
      messageNotifications,
    } = req.body;

    let preferences = await notificationPrefRepository.findOne({
      where: { parentId },
    });

    // Create if not exists
    if (!preferences) {
      preferences = notificationPrefRepository.create({
        parentId,
      });
    }

    // Update fields if provided
    if (emailNotifications !== undefined)
      preferences.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) preferences.smsNotifications = smsNotifications;
    if (inAppNotifications !== undefined)
      preferences.inAppNotifications = inAppNotifications;
    if (feedbackNotifications !== undefined)
      preferences.feedbackNotifications = feedbackNotifications;
    if (testScoreNotifications !== undefined)
      preferences.testScoreNotifications = testScoreNotifications;
    if (attendanceNotifications !== undefined)
      preferences.attendanceNotifications = attendanceNotifications;
    if (behaviorNotifications !== undefined)
      preferences.behaviorNotifications = behaviorNotifications;
    if (assignmentNotifications !== undefined)
      preferences.assignmentNotifications = assignmentNotifications;
    if (messageNotifications !== undefined)
      preferences.messageNotifications = messageNotifications;

    await notificationPrefRepository.save(preferences);

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: {
        preferences: {
          emailNotifications: preferences.emailNotifications,
          smsNotifications: preferences.smsNotifications,
          inAppNotifications: preferences.inAppNotifications,
          feedbackNotifications: preferences.feedbackNotifications,
          testScoreNotifications: preferences.testScoreNotifications,
          attendanceNotifications: preferences.attendanceNotifications,
          behaviorNotifications: preferences.behaviorNotifications,
          assignmentNotifications: preferences.assignmentNotifications,
          messageNotifications: preferences.messageNotifications,
          updatedAt: preferences.updatedAt,
        },
      },
    });
  }

  // Upload profile picture
  static async uploadProfilePicture(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { profilePictureUrl } = req.body;

    if (!profilePictureUrl) {
      throw new AppError('Profile picture URL is required', 400);
    }

    const parent = await parentRepository.findOne({
      where: { id: parentId },
    });

    if (!parent) {
      throw new AppError('Parent not found', 404);
    }

    parent.profilePicture = profilePictureUrl;
    await parentRepository.save(parent);

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: parent.profilePicture,
      },
    });
  }
}
