import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';
import { DashboardController } from '../controllers/dashboard.controller';
import { AttendanceController } from '../controllers/attendance.controller';
import { ProgressController } from '../controllers/progress.controller';
import { AssignmentController } from '../controllers/assignment.controller';
import { BehaviorController } from '../controllers/behavior.controller';
import { FeedbackController } from '../controllers/feedback.controller';
import { MessageController } from '../controllers/message.controller';
import { NotificationController } from '../controllers/notification.controller';
import { ReportController } from '../controllers/report.controller';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(authorizeRole('parent'));

// Dashboard home data
router.get('/home/:studentId', asyncHandler(DashboardController.getHomeDashboard));

// Dashboard summary
router.get('/summary/:studentId', asyncHandler(DashboardController.getSummary));

// Attendance
router.get('/attendance/:studentId', asyncHandler(AttendanceController.getAttendance));
router.get('/attendance/:studentId/chart', asyncHandler(AttendanceController.getAttendanceChart));
router.get('/attendance/:studentId/monthly', asyncHandler(AttendanceController.getMonthlySummary));

// Progress/Tests
router.get('/progress/:studentId', asyncHandler(ProgressController.getProgress));
router.get('/tests/:studentId', asyncHandler(ProgressController.getTests));
router.get('/test/:testId', asyncHandler(ProgressController.getTestById));
router.get('/progress/:studentId/comparison', asyncHandler(ProgressController.getSubjectComparison));

// Assignments
router.get('/assignments/:studentId', asyncHandler(AssignmentController.getAssignments));
router.get('/assignment/:assignmentId', asyncHandler(AssignmentController.getAssignmentById));
router.get('/assignments/:studentId/upcoming', asyncHandler(AssignmentController.getUpcomingAssignments));
router.get('/assignments/:studentId/overdue', asyncHandler(AssignmentController.getOverdueAssignments));

// Behavior
router.get('/behavior/:studentId', asyncHandler(BehaviorController.getBehavior));
router.patch('/behavior/:behaviorId/acknowledge', asyncHandler(BehaviorController.acknowledgeBehavior));
router.get('/behavior/:studentId/summary', asyncHandler(BehaviorController.getBehaviorSummary));
router.get('/behavior/:studentId/trends', asyncHandler(BehaviorController.getBehaviorTrends));

// Feedback
router.get('/feedback/:studentId', asyncHandler(FeedbackController.getFeedback));
router.get('/feedback/:feedbackId', asyncHandler(FeedbackController.getFeedbackById));
router.post('/feedback/:feedbackId/reply', asyncHandler(FeedbackController.replyToFeedback));
router.get('/feedback/:feedbackId/replies', asyncHandler(FeedbackController.getFeedbackReplies));
router.patch('/feedback/:feedbackId/read', asyncHandler(FeedbackController.markAsRead));

// Messages
router.get('/messages', asyncHandler(MessageController.getMessages));
router.get('/messages/:teacherId', asyncHandler(MessageController.getMessageThread));
router.post('/messages', asyncHandler(MessageController.sendMessage));
router.patch('/messages/:messageId/read', asyncHandler(MessageController.markMessageAsRead));
router.get('/messages/unread/count', asyncHandler(MessageController.getUnreadCount));

// Term reports
router.get('/reports/:studentId', asyncHandler(ReportController.getReports));
router.get('/report/:reportId', asyncHandler(ReportController.getReportById));
router.get('/report/:reportId/download', asyncHandler(ReportController.downloadReport));
router.get('/reports/:studentId/statistics', asyncHandler(ReportController.getReportStatistics));

// Notifications
router.get('/notifications', asyncHandler(NotificationController.getNotifications));
router.patch('/notifications/:notificationId/read', asyncHandler(NotificationController.markAsRead));
router.post('/notifications/mark-all-read', asyncHandler(NotificationController.markAllAsRead));
router.delete('/notifications/:notificationId', asyncHandler(NotificationController.deleteNotification));
router.get('/notifications/unread/count', asyncHandler(NotificationController.getUnreadCount));
router.get('/notifications/by-type', asyncHandler(NotificationController.getNotificationsByType));

export default router;
