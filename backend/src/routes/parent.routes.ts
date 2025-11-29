import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';
import { ParentController } from '../controllers/parent.controller';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(authorizeRole('parent'));

// Parent profile routes
router.get('/profile', asyncHandler(ParentController.getProfile));
router.put('/profile', asyncHandler(ParentController.updateProfile));
router.post('/profile/picture', asyncHandler(ParentController.uploadProfilePicture));
router.post('/change-password', asyncHandler(ParentController.changePassword));

// Notification preferences
router.get('/notification-preferences', asyncHandler(ParentController.getNotificationPreferences));
router.put('/notification-preferences', asyncHandler(ParentController.updateNotificationPreferences));

export default router;
