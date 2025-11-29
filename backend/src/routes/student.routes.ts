import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(authorizeRole('parent'));

// Get all students for the logged-in parent
router.get('/', (req, res) => {
  res.json({ message: 'Get all students for parent' });
});

// Get specific student details
router.get('/:studentId', (req, res) => {
  res.json({ message: 'Get student details' });
});

export default router;
