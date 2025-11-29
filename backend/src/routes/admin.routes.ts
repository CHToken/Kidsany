import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';
import { AdminController } from '../controllers/admin.controller';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRole('admin'));

// Admin profile routes
router.get('/profile', asyncHandler(AdminController.getProfile));
router.put('/profile', asyncHandler(AdminController.updateProfile));
router.post('/change-password', asyncHandler(AdminController.changePassword));

// System settings routes
router.get('/settings', asyncHandler(AdminController.getSettings));
router.get('/settings/:category', asyncHandler(AdminController.getSettingCategory));
router.put('/settings', asyncHandler(AdminController.updateSettings));
router.patch('/settings/value', asyncHandler(AdminController.updateSettingValue));
router.post('/settings/reset', asyncHandler(AdminController.resetSettings));

// Maintenance mode
router.post('/maintenance/toggle', asyncHandler(AdminController.toggleMaintenance));

// Feature flags
router.post('/features/:feature/toggle', asyncHandler(AdminController.toggleFeature));

// System statistics
router.get('/statistics', asyncHandler(AdminController.getStatistics));

// Settings import/export
router.get('/settings/export', asyncHandler(AdminController.exportSettings));
router.post('/settings/import', asyncHandler(AdminController.importSettings));

export default router;
