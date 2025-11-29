import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';
import { StudentController } from '../controllers/student.controller';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(authorizeRole('parent'));

// Get all students for the logged-in parent
router.get('/', asyncHandler(StudentController.getAllStudents));

// Get specific student details
router.get('/:studentId', asyncHandler(StudentController.getStudentById));

export default router;
