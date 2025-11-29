import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Student } from '../entities/Student';
import { Attendance, AttendanceStatus } from '../entities/Attendance';
import { AppError } from '../middleware/error.middleware';
import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

const studentRepository = AppDataSource.getRepository(Student);
const attendanceRepository = AppDataSource.getRepository(Attendance);

export class AttendanceController {
  // Get attendance records for a student
  static async getAttendance(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;
    const { startDate, endDate, status, limit = '50', offset = '0' } = req.query;

    // Verify student belongs to parent
    const student = await studentRepository.findOne({
      where: { id: studentId, parentId, isActive: true },
    });

    if (!student) {
      throw new AppError('Student not found or access denied', 404);
    }

    // Build query conditions
    const whereConditions: any = { studentId };

    // Date filtering
    if (startDate && endDate) {
      whereConditions.date = Between(new Date(startDate as string), new Date(endDate as string));
    } else if (startDate) {
      whereConditions.date = MoreThanOrEqual(new Date(startDate as string));
    } else if (endDate) {
      whereConditions.date = LessThanOrEqual(new Date(endDate as string));
    }

    // Status filtering
    if (status && Object.values(AttendanceStatus).includes(status as AttendanceStatus)) {
      whereConditions.status = status;
    }

    // Get attendance records
    const [attendances, total] = await attendanceRepository.findAndCount({
      where: whereConditions,
      order: { date: 'DESC' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Calculate statistics
    const stats = {
      total: total,
      present: attendances.filter((a) => a.status === AttendanceStatus.PRESENT).length,
      absent: attendances.filter((a) => a.status === AttendanceStatus.ABSENT).length,
      late: attendances.filter((a) => a.status === AttendanceStatus.LATE).length,
      excused: attendances.filter((a) => a.status === AttendanceStatus.EXCUSED).length,
    };

    stats.total = total;
    const presentCount = stats.present + stats.late; // Count late as present
    const attendanceRate = total > 0 ? (presentCount / total) * 100 : 0;

    res.status(200).json({
      success: true,
      message: 'Attendance records retrieved successfully',
      data: {
        attendances: attendances.map((a) => ({
          id: a.id,
          date: a.date,
          status: a.status,
          reason: a.reason,
          notes: a.notes,
          createdAt: a.createdAt,
        })),
        statistics: {
          ...stats,
          attendanceRate: Math.round(attendanceRate * 10) / 10,
        },
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: parseInt(offset as string) + parseInt(limit as string) < total,
        },
      },
    });
  }

  // Get attendance chart data (monthly/weekly breakdown)
  static async getAttendanceChart(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;
    const { period = 'month' } = req.query; // 'week', 'month', 'year'

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
      default:
        startDate.setMonth(currentDate.getMonth() - 1);
    }

    // Get attendance data for the period
    const attendances = await attendanceRepository.find({
      where: {
        studentId,
        date: Between(startDate, currentDate),
      },
      order: { date: 'ASC' },
    });

    // Group by date for chart
    const chartData: { [key: string]: any } = {};

    attendances.forEach((attendance) => {
      const dateKey = attendance.date.toISOString().split('T')[0];
      if (!chartData[dateKey]) {
        chartData[dateKey] = {
          date: dateKey,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        };
      }

      switch (attendance.status) {
        case AttendanceStatus.PRESENT:
          chartData[dateKey].present++;
          break;
        case AttendanceStatus.ABSENT:
          chartData[dateKey].absent++;
          break;
        case AttendanceStatus.LATE:
          chartData[dateKey].late++;
          break;
        case AttendanceStatus.EXCUSED:
          chartData[dateKey].excused++;
          break;
      }
    });

    const chartArray = Object.values(chartData);

    // Calculate overall statistics
    const totalRecords = attendances.length;
    const presentCount = attendances.filter(
      (a) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE
    ).length;
    const absentCount = attendances.filter((a) => a.status === AttendanceStatus.ABSENT).length;
    const lateCount = attendances.filter((a) => a.status === AttendanceStatus.LATE).length;
    const excusedCount = attendances.filter((a) => a.status === AttendanceStatus.EXCUSED).length;

    const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

    res.status(200).json({
      success: true,
      message: 'Attendance chart data retrieved successfully',
      data: {
        period,
        startDate,
        endDate: currentDate,
        chartData: chartArray,
        summary: {
          totalDays: totalRecords,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          excused: excusedCount,
          attendanceRate: Math.round(attendanceRate * 10) / 10,
        },
      },
    });
  }

  // Get attendance summary by month
  static async getMonthlySummary(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;
    const { year } = req.query;

    // Verify student belongs to parent
    const student = await studentRepository.findOne({
      where: { id: studentId, parentId, isActive: true },
    });

    if (!student) {
      throw new AppError('Student not found or access denied', 404);
    }

    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

    const startDate = new Date(targetYear, 0, 1); // Jan 1
    const endDate = new Date(targetYear, 11, 31); // Dec 31

    // Get all attendance for the year
    const attendances = await attendanceRepository.find({
      where: {
        studentId,
        date: Between(startDate, endDate),
      },
    });

    // Group by month
    const monthlySummary = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(targetYear, i).toLocaleString('default', { month: 'long' }),
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
      attendanceRate: 0,
    }));

    attendances.forEach((attendance) => {
      const month = new Date(attendance.date).getMonth();
      monthlySummary[month].total++;

      switch (attendance.status) {
        case AttendanceStatus.PRESENT:
          monthlySummary[month].present++;
          break;
        case AttendanceStatus.ABSENT:
          monthlySummary[month].absent++;
          break;
        case AttendanceStatus.LATE:
          monthlySummary[month].late++;
          break;
        case AttendanceStatus.EXCUSED:
          monthlySummary[month].excused++;
          break;
      }
    });

    // Calculate attendance rate for each month
    monthlySummary.forEach((month) => {
      const presentDays = month.present + month.late;
      month.attendanceRate = month.total > 0 ? Math.round((presentDays / month.total) * 100 * 10) / 10 : 0;
    });

    res.status(200).json({
      success: true,
      message: 'Monthly attendance summary retrieved successfully',
      data: {
        year: targetYear,
        months: monthlySummary,
      },
    });
  }
}
