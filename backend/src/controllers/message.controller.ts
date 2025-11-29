import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Message, MessageSender } from '../entities/Message';
import { Teacher } from '../entities/Teacher';
import { AppError } from '../middleware/error.middleware';

const messageRepository = AppDataSource.getRepository(Message);
const teacherRepository = AppDataSource.getRepository(Teacher);

export class MessageController {
  // Get all messages for parent (conversation list)
  static async getMessages(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { isRead, limit = '50', offset = '0' } = req.query;

    // Build query conditions
    const whereConditions: any = { parentId };

    // Filter by read status
    if (isRead !== undefined) {
      whereConditions.isRead = isRead === 'true';
    }

    // Get messages
    const [messages, total] = await messageRepository.findAndCount({
      where: whereConditions,
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Get unread count
    const unreadCount = await messageRepository.count({
      where: { parentId, isRead: false },
    });

    // Group messages by teacher to show conversations
    const conversations: { [key: string]: any } = {};

    messages.forEach((message) => {
      const teacherId = message.teacher.id;

      if (!conversations[teacherId]) {
        conversations[teacherId] = {
          teacher: {
            id: message.teacher.id,
            firstName: message.teacher.firstName,
            lastName: message.teacher.lastName,
            email: message.teacher.email,
            profilePicture: message.teacher.profilePicture,
          },
          messages: [],
          unreadCount: 0,
          lastMessage: null,
        };
      }

      conversations[teacherId].messages.push({
        id: message.id,
        subject: message.subject,
        content: message.content,
        senderType: message.senderType,
        isRead: message.isRead,
        attachmentUrl: message.attachmentUrl,
        createdAt: message.createdAt,
      });

      if (!message.isRead && message.senderType === MessageSender.TEACHER) {
        conversations[teacherId].unreadCount++;
      }

      // Set last message
      if (
        !conversations[teacherId].lastMessage ||
        new Date(message.createdAt) >
          new Date(conversations[teacherId].lastMessage.createdAt)
      ) {
        conversations[teacherId].lastMessage = {
          content: message.content,
          senderType: message.senderType,
          createdAt: message.createdAt,
        };
      }
    });

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        conversations: Object.values(conversations),
        totalMessages: total,
        unreadCount,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: parseInt(offset as string) + parseInt(limit as string) < total,
        },
      },
    });
  }

  // Get message thread with a specific teacher
  static async getMessageThread(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { teacherId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    // Verify teacher exists
    const teacher = await teacherRepository.findOne({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }

    // Get messages between parent and teacher
    const [messages, total] = await messageRepository.findAndCount({
      where: { parentId, teacherId },
      relations: ['teacher'],
      order: { createdAt: 'ASC' }, // Chronological order for conversation
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Mark unread messages from teacher as read
    const unreadMessages = messages.filter(
      (m) => !m.isRead && m.senderType === MessageSender.TEACHER
    );

    if (unreadMessages.length > 0) {
      for (const message of unreadMessages) {
        message.isRead = true;
        message.readAt = new Date();
      }
      await messageRepository.save(unreadMessages);
    }

    res.status(200).json({
      success: true,
      message: 'Message thread retrieved successfully',
      data: {
        teacher: {
          id: teacher.id,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          phoneNumber: teacher.phoneNumber,
          profilePicture: teacher.profilePicture,
        },
        messages: messages.map((m) => ({
          id: m.id,
          subject: m.subject,
          content: m.content,
          senderType: m.senderType,
          isRead: m.isRead,
          readAt: m.readAt,
          attachmentUrl: m.attachmentUrl,
          createdAt: m.createdAt,
        })),
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: parseInt(offset as string) + parseInt(limit as string) < total,
        },
      },
    });
  }

  // Send a message to a teacher
  static async sendMessage(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { teacherId, subject, content, attachmentUrl } = req.body;

    if (!teacherId) {
      throw new AppError('Teacher ID is required', 400);
    }

    if (!content || content.trim().length === 0) {
      throw new AppError('Message content is required', 400);
    }

    // Verify teacher exists
    const teacher = await teacherRepository.findOne({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }

    // Create message
    const message = messageRepository.create({
      parentId,
      teacherId,
      senderType: MessageSender.PARENT,
      subject: subject || null,
      content: content.trim(),
      attachmentUrl: attachmentUrl || null,
    });

    await messageRepository.save(message);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: {
          id: message.id,
          subject: message.subject,
          content: message.content,
          senderType: message.senderType,
          teacher: {
            id: teacher.id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
          },
          createdAt: message.createdAt,
        },
      },
    });
  }

  // Mark a message as read
  static async markMessageAsRead(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { messageId } = req.params;

    // Find message and verify access
    const message = await messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    // Verify message belongs to parent
    if (message.parentId !== parentId) {
      throw new AppError('Access denied', 403);
    }

    // Mark as read
    if (!message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await messageRepository.save(message);
    }

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: {
        messageId: message.id,
        readAt: message.readAt,
      },
    });
  }

  // Get unread message count
  static async getUnreadCount(req: Request, res: Response) {
    const parentId = req.user!.id;

    const unreadCount = await messageRepository.count({
      where: {
        parentId,
        isRead: false,
        senderType: MessageSender.TEACHER, // Only count messages from teachers
      },
    });

    res.status(200).json({
      success: true,
      message: 'Unread count retrieved successfully',
      data: {
        unreadCount,
      },
    });
  }
}
