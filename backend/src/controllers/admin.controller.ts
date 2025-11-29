import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Admin } from '../entities/Admin';
import { AppError } from '../middleware/error.middleware';
import { hashPassword, comparePassword } from '../utils/password.utils';

const adminRepository = AppDataSource.getRepository(Admin);

// Define dynamic settings interface
interface SystemSettings {
  [key: string]: any;
}

// In-memory settings storage (in production, use database or Redis)
let systemSettings: SystemSettings = {
  maintenance: {
    enabled: false,
    message: 'System is under maintenance. Please try again later.',
    estimatedRestoreTime: null,
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    digestEnabled: true,
    digestTime: '08:00',
  },
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 900, // 15 minutes in seconds
    sessionTimeout: 3600, // 1 hour in seconds
    passwordMinLength: 8,
    requireSpecialChar: true,
    requireNumber: true,
    requireUppercase: true,
  },
  features: {
    messagesEnabled: true,
    feedbackEnabled: true,
    fileUploadEnabled: false,
    maxFileSize: 10485760, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  },
  academic: {
    currentAcademicYear: 2024,
    currentTerm: 'Term 1',
    gradeScale: {
      A: 90,
      B: 80,
      C: 70,
      D: 60,
      F: 0,
    },
    attendanceThreshold: 75, // minimum attendance percentage
  },
  display: {
    itemsPerPage: 50,
    maxRecordsReturn: 100,
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    currency: 'USD',
    language: 'en',
  },
  integrations: {
    paymentGateway: {
      enabled: false,
      provider: 'stripe',
    },
    smsProvider: {
      enabled: false,
      provider: 'twilio',
    },
    emailProvider: {
      enabled: false,
      provider: 'sendgrid',
    },
  },
  customFields: {},
};

export class AdminController {
  // Get admin profile
  static async getProfile(req: Request, res: Response) {
    const adminId = req.user!.id;

    const admin = await adminRepository.findOne({
      where: { id: adminId },
    });

    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Admin profile retrieved successfully',
      data: {
        admin: {
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: admin.role,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt,
        },
      },
    });
  }

  // Update admin profile
  static async updateProfile(req: Request, res: Response) {
    const adminId = req.user!.id;
    const { firstName, lastName, email } = req.body;

    const admin = await adminRepository.findOne({
      where: { id: adminId },
    });

    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (email && email !== admin.email) {
      const existingAdmin = await adminRepository.findOne({ where: { email } });
      if (existingAdmin) {
        throw new AppError('Email already in use', 400);
      }
      admin.email = email;
    }

    await adminRepository.save(admin);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { admin },
    });
  }

  // Change password
  static async changePassword(req: Request, res: Response) {
    const adminId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    const admin = await adminRepository.findOne({
      where: { id: adminId },
    });

    if (!admin || !admin.password) {
      throw new AppError('Admin not found', 404);
    }

    const isValid = await comparePassword(currentPassword, admin.password);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    admin.password = await hashPassword(newPassword);
    await adminRepository.save(admin);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  }

  // Get all system settings
  static async getSettings(req: Request, res: Response) {
    res.status(200).json({
      success: true,
      message: 'System settings retrieved successfully',
      data: {
        settings: systemSettings,
      },
    });
  }

  // Get specific setting category
  static async getSettingCategory(req: Request, res: Response) {
    const { category } = req.params;

    if (!systemSettings[category]) {
      throw new AppError('Setting category not found', 404);
    }

    res.status(200).json({
      success: true,
      message: `${category} settings retrieved successfully`,
      data: {
        category,
        settings: systemSettings[category],
      },
    });
  }

  // Update system settings
  static async updateSettings(req: Request, res: Response) {
    const { category, settings } = req.body;

    if (!category || !settings) {
      throw new AppError('Category and settings are required', 400);
    }

    // Validate category exists or create new
    if (!systemSettings[category]) {
      systemSettings[category] = {};
    }

    // Merge new settings with existing
    systemSettings[category] = {
      ...systemSettings[category],
      ...settings,
    };

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        category,
        settings: systemSettings[category],
      },
    });
  }

  // Update specific setting value
  static async updateSettingValue(req: Request, res: Response) {
    const { category, key, value } = req.body;

    if (!category || !key) {
      throw new AppError('Category and key are required', 400);
    }

    if (!systemSettings[category]) {
      throw new AppError('Setting category not found', 404);
    }

    systemSettings[category][key] = value;

    res.status(200).json({
      success: true,
      message: 'Setting updated successfully',
      data: {
        category,
        key,
        value,
      },
    });
  }

  // Reset settings to default
  static async resetSettings(req: Request, res: Response) {
    const { category } = req.body;

    if (!category) {
      throw new AppError('Category is required', 400);
    }

    if (!systemSettings[category]) {
      throw new AppError('Setting category not found', 404);
    }

    // Reset to default based on category
    switch (category) {
      case 'maintenance':
        systemSettings.maintenance = {
          enabled: false,
          message: 'System is under maintenance.',
          estimatedRestoreTime: null,
        };
        break;
      case 'notifications':
        systemSettings.notifications = {
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
        };
        break;
      default:
        throw new AppError('Cannot reset this category', 400);
    }

    res.status(200).json({
      success: true,
      message: 'Settings reset to default',
      data: {
        category,
        settings: systemSettings[category],
      },
    });
  }

  // Toggle maintenance mode
  static async toggleMaintenance(req: Request, res: Response) {
    const { enabled, message, estimatedRestoreTime } = req.body;

    const currentEnabled = systemSettings.maintenance.enabled;
    systemSettings.maintenance.enabled = enabled !== undefined ? enabled : !currentEnabled;

    if (message) systemSettings.maintenance.message = message;
    if (estimatedRestoreTime) {
      systemSettings.maintenance.estimatedRestoreTime = estimatedRestoreTime;
    }

    res.status(200).json({
      success: true,
      message: `Maintenance mode ${systemSettings.maintenance.enabled ? 'enabled' : 'disabled'}`,
      data: {
        maintenance: systemSettings.maintenance,
      },
    });
  }

  // Toggle feature flag
  static async toggleFeature(req: Request, res: Response) {
    const { feature } = req.params;
    const { enabled } = req.body;

    if (systemSettings.features[feature] === undefined) {
      throw new AppError('Feature not found', 404);
    }

    const currentValue = systemSettings.features[feature];
    systemSettings.features[feature] = enabled !== undefined ? enabled : !currentValue;

    res.status(200).json({
      success: true,
      message: `Feature ${feature} ${systemSettings.features[feature] ? 'enabled' : 'disabled'}`,
      data: {
        feature,
        enabled: systemSettings.features[feature],
      },
    });
  }

  // Get system statistics
  static async getStatistics(req: Request, res: Response) {
    const stats = {
      users: {
        totalParents: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalAdmins: 0,
        activeToday: 0,
      },
      activity: {
        totalLogins: 0,
        totalMessages: 0,
        totalFeedback: 0,
        totalNotifications: 0,
      },
      academic: {
        currentAcademicYear: systemSettings.academic.currentAcademicYear,
        currentTerm: systemSettings.academic.currentTerm,
        totalClasses: 0,
        totalSubjects: 0,
      },
      system: {
        uptime: process.uptime(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
        maintenanceMode: systemSettings.maintenance.enabled,
      },
    };

    res.status(200).json({
      success: true,
      message: 'System statistics retrieved successfully',
      data: { stats },
    });
  }

  // Export settings as JSON
  static async exportSettings(req: Request, res: Response) {
    res.status(200).json({
      success: true,
      message: 'Settings exported successfully',
      data: {
        settings: systemSettings,
        exportedAt: new Date().toISOString(),
      },
    });
  }

  // Import settings from JSON
  static async importSettings(req: Request, res: Response) {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      throw new AppError('Valid settings object is required', 400);
    }

    // Validate and merge settings
    Object.keys(settings).forEach((category) => {
      if (systemSettings[category]) {
        systemSettings[category] = {
          ...systemSettings[category],
          ...settings[category],
        };
      } else {
        systemSettings[category] = settings[category];
      }
    });

    res.status(200).json({
      success: true,
      message: 'Settings imported successfully',
      data: {
        importedCategories: Object.keys(settings),
      },
    });
  }
}
