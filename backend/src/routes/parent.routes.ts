import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(authorizeRole('parent'));

// Parent profile routes
router.get('/profile', (req, res) => {
  res.json({ message: 'Get parent profile' });
});

router.put('/profile', (req, res) => {
  res.json({ message: 'Update parent profile' });
});

// Notification preferences
router.get('/notification-preferences', (req, res) => {
  res.json({ message: 'Get notification preferences' });
});

router.put('/notification-preferences', (req, res) => {
  res.json({ message: 'Update notification preferences' });
});

export default router;
