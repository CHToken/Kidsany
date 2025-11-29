import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(authorizeRole('parent'));

// Dashboard home data
router.get('/home/:studentId', (req, res) => {
  res.json({ message: 'Get dashboard home data' });
});

// Attendance
router.get('/attendance/:studentId', (req, res) => {
  res.json({ message: 'Get student attendance' });
});

// Progress/Tests
router.get('/progress/:studentId', (req, res) => {
  res.json({ message: 'Get student progress and test scores' });
});

// Assignments
router.get('/assignments/:studentId', (req, res) => {
  res.json({ message: 'Get student assignments' });
});

// Behavior
router.get('/behavior/:studentId', (req, res) => {
  res.json({ message: 'Get student behavior records' });
});

// Feedback
router.get('/feedback/:studentId', (req, res) => {
  res.json({ message: 'Get feedback for student' });
});

router.post('/feedback/:feedbackId/reply', (req, res) => {
  res.json({ message: 'Reply to feedback' });
});

// Messages
router.get('/messages', (req, res) => {
  res.json({ message: 'Get all messages' });
});

router.post('/messages', (req, res) => {
  res.json({ message: 'Send message to teacher' });
});

// Term reports
router.get('/reports/:studentId', (req, res) => {
  res.json({ message: 'Get term reports' });
});

// Notifications
router.get('/notifications', (req, res) => {
  res.json({ message: 'Get notifications' });
});

router.patch('/notifications/:notificationId/read', (req, res) => {
  res.json({ message: 'Mark notification as read' });
});

export default router;
