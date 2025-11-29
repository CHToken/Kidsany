import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Student } from '../entities/Student';
import { Feedback, FeedbackCategory } from '../entities/Feedback';
import { FeedbackReply, ReplySender } from '../entities/FeedbackReply';
import { AppError } from '../middleware/error.middleware';

const studentRepository = AppDataSource.getRepository(Student);
const feedbackRepository = AppDataSource.getRepository(Feedback);
const feedbackReplyRepository = AppDataSource.getRepository(FeedbackReply);

export class FeedbackController {
  // Get all feedback for a student
  static async getFeedback(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;
    const { category, isRead, limit = '50', offset = '0' } = req.query;

    // Verify student belongs to parent
    const student = await studentRepository.findOne({
      where: { id: studentId, parentId, isActive: true },
    });

    if (!student) {
      throw new AppError('Student not found or access denied', 404);
    }

    // Build query conditions
    const whereConditions: any = { studentId };

    // Filter by category
    if (category && Object.values(FeedbackCategory).includes(category as FeedbackCategory)) {
      whereConditions.category = category;
    }

    // Filter by read status
    if (isRead !== undefined) {
      whereConditions.isRead = isRead === 'true';
    }

    // Get feedback
    const [feedbacks, total] = await feedbackRepository.findAndCount({
      where: whereConditions,
      relations: ['teacher', 'replies'],
      order: { createdAt: 'DESC' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Calculate statistics
    const stats = {
      total,
      unread: feedbacks.filter((f) => !f.isRead).length,
      byCategory: {
        academic: feedbacks.filter((f) => f.category === FeedbackCategory.ACADEMIC).length,
        behavior: feedbacks.filter((f) => f.category === FeedbackCategory.BEHAVIOR).length,
        participation: feedbacks.filter((f) => f.category === FeedbackCategory.PARTICIPATION)
          .length,
        general: feedbacks.filter((f) => f.category === FeedbackCategory.GENERAL).length,
      },
    };

    res.status(200).json({
      success: true,
      message: 'Feedback retrieved successfully',
      data: {
        feedbacks: feedbacks.map((f) => ({
          id: f.id,
          title: f.title,
          message: f.message,
          category: f.category,
          isRead: f.isRead,
          readAt: f.readAt,
          replyCount: f.replies?.length || 0,
          teacher: {
            id: f.teacher.id,
            firstName: f.teacher.firstName,
            lastName: f.teacher.lastName,
            email: f.teacher.email,
          },
          createdAt: f.createdAt,
          updatedAt: f.updatedAt,
        })),
        statistics: stats,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: parseInt(offset as string) + parseInt(limit as string) < total,
        },
      },
    });
  }

  // Get specific feedback details with replies
  static async getFeedbackById(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { feedbackId } = req.params;

    // Find feedback and verify access
    const feedback = await feedbackRepository.findOne({
      where: { id: feedbackId },
      relations: ['student', 'teacher', 'replies', 'replies.parent', 'replies.teacher'],
    });

    if (!feedback) {
      throw new AppError('Feedback not found', 404);
    }

    // Verify student belongs to parent
    if (feedback.student.parentId !== parentId) {
      throw new AppError('Access denied', 403);
    }

    // Mark as read if not already
    if (!feedback.isRead) {
      feedback.isRead = true;
      feedback.readAt = new Date();
      await feedbackRepository.save(feedback);
    }

    res.status(200).json({
      success: true,
      message: 'Feedback details retrieved successfully',
      data: {
        feedback: {
          id: feedback.id,
          title: feedback.title,
          message: feedback.message,
          category: feedback.category,
          isRead: feedback.isRead,
          readAt: feedback.readAt,
          student: {
            id: feedback.student.id,
            firstName: feedback.student.firstName,
            lastName: feedback.student.lastName,
          },
          teacher: {
            id: feedback.teacher.id,
            firstName: feedback.teacher.firstName,
            lastName: feedback.teacher.lastName,
            email: feedback.teacher.email,
            phoneNumber: feedback.teacher.phoneNumber,
          },
          replies: feedback.replies
            ? feedback.replies.map((r) => ({
                id: r.id,
                message: r.message,
                senderType: r.senderType,
                sender:
                  r.senderType === ReplySender.PARENT
                    ? {
                        id: r.parent?.id,
                        firstName: r.parent?.firstName,
                        lastName: r.parent?.lastName,
                      }
                    : {
                        id: r.teacher?.id,
                        firstName: r.teacher?.firstName,
                        lastName: r.teacher?.lastName,
                      },
                isRead: r.isRead,
                readAt: r.readAt,
                createdAt: r.createdAt,
              }))
            : [],
          createdAt: feedback.createdAt,
          updatedAt: feedback.updatedAt,
        },
      },
    });
  }

  // Reply to feedback
  static async replyToFeedback(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { feedbackId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      throw new AppError('Reply message is required', 400);
    }

    // Find feedback and verify access
    const feedback = await feedbackRepository.findOne({
      where: { id: feedbackId },
      relations: ['student'],
    });

    if (!feedback) {
      throw new AppError('Feedback not found', 404);
    }

    // Verify student belongs to parent
    if (feedback.student.parentId !== parentId) {
      throw new AppError('Access denied', 403);
    }

    // Create reply
    const reply = feedbackReplyRepository.create({
      feedbackId,
      senderType: ReplySender.PARENT,
      parentId,
      message: message.trim(),
    });

    await feedbackReplyRepository.save(reply);

    res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data: {
        reply: {
          id: reply.id,
          message: reply.message,
          senderType: reply.senderType,
          createdAt: reply.createdAt,
        },
      },
    });
  }

  // Get all replies for a feedback
  static async getFeedbackReplies(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { feedbackId } = req.params;

    // Find feedback and verify access
    const feedback = await feedbackRepository.findOne({
      where: { id: feedbackId },
      relations: ['student'],
    });

    if (!feedback) {
      throw new AppError('Feedback not found', 404);
    }

    // Verify student belongs to parent
    if (feedback.student.parentId !== parentId) {
      throw new AppError('Access denied', 403);
    }

    // Get replies
    const replies = await feedbackReplyRepository.find({
      where: { feedbackId },
      relations: ['parent', 'teacher'],
      order: { createdAt: 'ASC' },
    });

    res.status(200).json({
      success: true,
      message: 'Feedback replies retrieved successfully',
      data: {
        replies: replies.map((r) => ({
          id: r.id,
          message: r.message,
          senderType: r.senderType,
          sender:
            r.senderType === ReplySender.PARENT
              ? {
                  id: r.parent?.id,
                  firstName: r.parent?.firstName,
                  lastName: r.parent?.lastName,
                }
              : {
                  id: r.teacher?.id,
                  firstName: r.teacher?.firstName,
                  lastName: r.teacher?.lastName,
                },
          isRead: r.isRead,
          readAt: r.readAt,
          createdAt: r.createdAt,
        })),
        count: replies.length,
      },
    });
  }

  // Mark feedback as read
  static async markAsRead(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { feedbackId } = req.params;

    // Find feedback and verify access
    const feedback = await feedbackRepository.findOne({
      where: { id: feedbackId },
      relations: ['student'],
    });

    if (!feedback) {
      throw new AppError('Feedback not found', 404);
    }

    // Verify student belongs to parent
    if (feedback.student.parentId !== parentId) {
      throw new AppError('Access denied', 403);
    }

    // Mark as read
    if (!feedback.isRead) {
      feedback.isRead = true;
      feedback.readAt = new Date();
      await feedbackRepository.save(feedback);
    }

    res.status(200).json({
      success: true,
      message: 'Feedback marked as read',
      data: {
        feedbackId: feedback.id,
        readAt: feedback.readAt,
      },
    });
  }
}
