import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Notification, NotificationType } from '../entities/Notification';
import { AppError } from '../middleware/error.middleware';

const notificationRepository = AppDataSource.getRepository(Notification);

export class NotificationController {
  // Get all notifications for parent
  static async getNotifications(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { type, isRead, limit = '50', offset = '0' } = req.query;

    // Build query conditions
    const whereConditions: any = { parentId };

    // Filter by type
    if (type && Object.values(NotificationType).includes(type as NotificationType)) {
      whereConditions.type = type;
    }

    // Filter by read status
    if (isRead !== undefined) {
      whereConditions.isRead = isRead === 'true';
    }

    // Get notifications
    const [notifications, total] = await notificationRepository.findAndCount({
      where: whereConditions,
      order: { createdAt: 'DESC' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Get unread count
    const unreadCount = await notificationRepository.count({
      where: { parentId, isRead: false },
    });

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          link: n.link,
          relatedEntityId: n.relatedEntityId,
          isRead: n.isRead,
          readAt: n.readAt,
          createdAt: n.createdAt,
        })),
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

  // Mark notification as read
  static async markAsRead(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { notificationId } = req.params;

    // Find notification and verify access
    const notification = await notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    // Verify notification belongs to parent
    if (notification.parentId !== parentId) {
      throw new AppError('Access denied', 403);
    }

    // Mark as read
    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notificationRepository.save(notification);
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notificationId: notification.id,
        readAt: notification.readAt,
      },
    });
  }

  // Mark all notifications as read
  static async markAllAsRead(req: Request, res: Response) {
    const parentId = req.user!.id;

    // Get all unread notifications
    const unreadNotifications = await notificationRepository.find({
      where: { parentId, isRead: false },
    });

    if (unreadNotifications.length > 0) {
      const currentDate = new Date();

      unreadNotifications.forEach((notification) => {
        notification.isRead = true;
        notification.readAt = currentDate;
      });

      await notificationRepository.save(unreadNotifications);
    }

    res.status(200).json({
      success: true,
      message: `${unreadNotifications.length} notifications marked as read`,
      data: {
        count: unreadNotifications.length,
      },
    });
  }

  // Delete notification
  static async deleteNotification(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { notificationId } = req.params;

    // Find notification and verify access
    const notification = await notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    // Verify notification belongs to parent
    if (notification.parentId !== parentId) {
      throw new AppError('Access denied', 403);
    }

    // Delete notification
    await notificationRepository.remove(notification);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  }

  // Get unread count
  static async getUnreadCount(req: Request, res: Response) {
    const parentId = req.user!.id;

    const unreadCount = await notificationRepository.count({
      where: { parentId, isRead: false },
    });

    res.status(200).json({
      success: true,
      message: 'Unread count retrieved successfully',
      data: {
        unreadCount,
      },
    });
  }

  // Get notifications grouped by type
  static async getNotificationsByType(req: Request, res: Response) {
    const parentId = req.user!.id;

    const notifications = await notificationRepository.find({
      where: { parentId },
      order: { createdAt: 'DESC' },
    });

    // Group by type
    const byType: { [key: string]: any[] } = {};

    Object.values(NotificationType).forEach((type) => {
      byType[type] = [];
    });

    notifications.forEach((notification) => {
      byType[notification.type].push({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      });
    });

    res.status(200).json({
      success: true,
      message: 'Notifications grouped by type retrieved successfully',
      data: {
        byType,
        total: notifications.length,
      },
    });
  }
}
