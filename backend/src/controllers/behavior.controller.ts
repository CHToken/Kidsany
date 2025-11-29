import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Student } from '../entities/Student';
import { Behavior, BehaviorType } from '../entities/Behavior';
import { AppError } from '../middleware/error.middleware';
import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

const studentRepository = AppDataSource.getRepository(Student);
const behaviorRepository = AppDataSource.getRepository(Behavior);

export class BehaviorController {
  // Get behavior records for a student
  static async getBehavior(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;
    const { type, category, startDate, endDate, limit = '50', offset = '0' } = req.query;

    // Verify student belongs to parent
    const student = await studentRepository.findOne({
      where: { id: studentId, parentId, isActive: true },
    });

    if (!student) {
      throw new AppError('Student not found or access denied', 404);
    }

    // Build query conditions
    const whereConditions: any = { studentId };

    // Filter by type
    if (type && Object.values(BehaviorType).includes(type as BehaviorType)) {
      whereConditions.type = type;
    }

    // Filter by category
    if (category) {
      whereConditions.category = category;
    }

    // Filter by date
    if (startDate && endDate) {
      whereConditions.date = Between(new Date(startDate as string), new Date(endDate as string));
    } else if (startDate) {
      whereConditions.date = MoreThanOrEqual(new Date(startDate as string));
    } else if (endDate) {
      whereConditions.date = LessThanOrEqual(new Date(endDate as string));
    }

    // Get behavior records
    const [behaviors, total] = await behaviorRepository.findAndCount({
      where: whereConditions,
      relations: ['teacher'],
      order: { date: 'DESC' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Calculate statistics
    const stats = {
      total,
      positive: behaviors.filter((b) => b.type === BehaviorType.POSITIVE).length,
      negative: behaviors.filter((b) => b.type === BehaviorType.NEGATIVE).length,
      neutral: behaviors.filter((b) => b.type === BehaviorType.NEUTRAL).length,
      incidents: behaviors.filter((b) => b.isIncident).length,
      unacknowledged: behaviors.filter((b) => !b.acknowledgedByParent).length,
    };

    res.status(200).json({
      success: true,
      message: 'Behavior records retrieved successfully',
      data: {
        behaviors: behaviors.map((b) => ({
          id: b.id,
          date: b.date,
          type: b.type,
          title: b.title,
          description: b.description,
          category: b.category,
          points: b.points,
          isIncident: b.isIncident,
          acknowledgedByParent: b.acknowledgedByParent,
          acknowledgedAt: b.acknowledgedAt,
          teacher: {
            id: b.teacher.id,
            firstName: b.teacher.firstName,
            lastName: b.teacher.lastName,
            email: b.teacher.email,
          },
          createdAt: b.createdAt,
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

  // Acknowledge a behavior record
  static async acknowledgeBehavior(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { behaviorId } = req.params;

    // Find behavior and verify access
    const behavior = await behaviorRepository.findOne({
      where: { id: behaviorId },
      relations: ['student'],
    });

    if (!behavior) {
      throw new AppError('Behavior record not found', 404);
    }

    // Verify student belongs to parent
    if (behavior.student.parentId !== parentId) {
      throw new AppError('Access denied', 403);
    }

    // Update acknowledgment
    behavior.acknowledgedByParent = true;
    behavior.acknowledgedAt = new Date();

    await behaviorRepository.save(behavior);

    res.status(200).json({
      success: true,
      message: 'Behavior record acknowledged successfully',
      data: {
        behaviorId: behavior.id,
        acknowledgedAt: behavior.acknowledgedAt,
      },
    });
  }

  // Get behavior summary (statistics)
  static async getBehaviorSummary(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;
    const { period = 'month' } = req.query; // 'week', 'month', 'year', 'all'

    // Verify student belongs to parent
    const student = await studentRepository.findOne({
      where: { id: studentId, parentId, isActive: true },
    });

    if (!student) {
      throw new AppError('Student not found or access denied', 404);
    }

    const currentDate = new Date();
    let startDate = new Date();

    // Calculate start date based on period
    switch (period) {
      case 'week':
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setMonth(currentDate.getMonth() - 1);
    }

    // Get behavior records for the period
    const behaviors = await behaviorRepository.find({
      where: {
        studentId,
        date: MoreThanOrEqual(startDate),
      },
      relations: ['teacher'],
      order: { date: 'DESC' },
    });

    // Calculate statistics
    const summary = {
      period,
      total: behaviors.length,
      positive: behaviors.filter((b) => b.type === BehaviorType.POSITIVE).length,
      negative: behaviors.filter((b) => b.type === BehaviorType.NEGATIVE).length,
      neutral: behaviors.filter((b) => b.type === BehaviorType.NEUTRAL).length,
      incidents: behaviors.filter((b) => b.isIncident).length,
      totalPoints: behaviors.reduce((sum, b) => sum + (b.points || 0), 0),
      unacknowledged: behaviors.filter((b) => !b.acknowledgedByParent).length,
    };

    // Group by category
    const byCategory: { [key: string]: number } = {};
    behaviors.forEach((b) => {
      if (b.category) {
        byCategory[b.category] = (byCategory[b.category] || 0) + 1;
      }
    });

    // Recent incidents
    const recentIncidents = behaviors
      .filter((b) => b.isIncident)
      .slice(0, 5)
      .map((b) => ({
        id: b.id,
        date: b.date,
        title: b.title,
        description: b.description,
        acknowledgedByParent: b.acknowledgedByParent,
      }));

    res.status(200).json({
      success: true,
      message: 'Behavior summary retrieved successfully',
      data: {
        summary,
        byCategory,
        recentIncidents,
      },
    });
  }

  // Get behavior trends
  static async getBehaviorTrends(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;
    const { months = '6' } = req.query;

    // Verify student belongs to parent
    const student = await studentRepository.findOne({
      where: { id: studentId, parentId, isActive: true },
    });

    if (!student) {
      throw new AppError('Student not found or access denied', 404);
    }

    const currentDate = new Date();
    const startDate = new Date();
    startDate.setMonth(currentDate.getMonth() - parseInt(months as string));

    // Get behavior records
    const behaviors = await behaviorRepository.find({
      where: {
        studentId,
        date: Between(startDate, currentDate),
      },
      order: { date: 'ASC' },
    });

    // Group by month
    const monthlyTrends: { [key: string]: any } = {};

    behaviors.forEach((behavior) => {
      const monthKey = `${behavior.date.getFullYear()}-${String(
        behavior.date.getMonth() + 1
      ).padStart(2, '0')}`;

      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = {
          month: monthKey,
          positive: 0,
          negative: 0,
          neutral: 0,
          incidents: 0,
          totalPoints: 0,
        };
      }

      if (behavior.type === BehaviorType.POSITIVE) monthlyTrends[monthKey].positive++;
      if (behavior.type === BehaviorType.NEGATIVE) monthlyTrends[monthKey].negative++;
      if (behavior.type === BehaviorType.NEUTRAL) monthlyTrends[monthKey].neutral++;
      if (behavior.isIncident) monthlyTrends[monthKey].incidents++;
      monthlyTrends[monthKey].totalPoints += behavior.points || 0;
    });

    res.status(200).json({
      success: true,
      message: 'Behavior trends retrieved successfully',
      data: {
        period: `Last ${months} months`,
        trends: Object.values(monthlyTrends),
      },
    });
  }
}
