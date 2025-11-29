import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Student } from '../entities/Student';
import { Attendance, AttendanceStatus } from '../entities/Attendance';
import { Assignment, SubmissionStatus } from '../entities/Assignment';
import { Behavior, BehaviorType } from '../entities/Behavior';
import { Feedback } from '../entities/Feedback';
import { Test } from '../entities/Test';
import { AppError } from '../middleware/error.middleware';
import { Between, MoreThanOrEqual } from 'typeorm';

const studentRepository = AppDataSource.getRepository(Student);
const attendanceRepository = AppDataSource.getRepository(Attendance);
const assignmentRepository = AppDataSource.getRepository(Assignment);
const behaviorRepository = AppDataSource.getRepository(Behavior);
const feedbackRepository = AppDataSource.getRepository(Feedback);
const testRepository = AppDataSource.getRepository(Test);

export class DashboardController {
  // Get dashboard home data for a specific student
  static async getHomeDashboard(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;

    // Verify student belongs to parent
    const student = await studentRepository.findOne({
      where: { id: studentId, parentId, isActive: true },
      relations: ['class', 'class.teacher'],
    });

    if (!student) {
      throw new AppError('Student not found or access denied', 404);
    }

    // Get current date and date 30 days ago
    const currentDate = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);

    // Calculate attendance percentage (last 30 days)
    const recentAttendances = await attendanceRepository.find({
      where: {
        studentId,
        date: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    const totalDays = recentAttendances.length;
    const presentDays = recentAttendances.filter(
      (a) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE
    ).length;
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Get assignment completion stats
    const assignments = await assignmentRepository.find({
      where: { studentId },
    });

    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(
      (a) =>
        a.submissionStatus === SubmissionStatus.SUBMITTED ||
        a.submissionStatus === SubmissionStatus.GRADED
    ).length;
    const pendingAssignments = assignments.filter(
      (a) => a.submissionStatus === SubmissionStatus.NOT_SUBMITTED
    ).length;
    const overdueAssignments = assignments.filter(
      (a) =>
        a.submissionStatus === SubmissionStatus.NOT_SUBMITTED &&
        new Date(a.dueDate) < currentDate
    ).length;

    // Get recent behavior notes (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(currentDate.getDate() - 7);

    const recentBehaviors = await behaviorRepository.find({
      where: {
        studentId,
        date: MoreThanOrEqual(sevenDaysAgo),
      },
      relations: ['teacher'],
      order: { date: 'DESC' },
      take: 5,
    });

    const behaviorSummary = {
      positive: recentBehaviors.filter((b) => b.type === BehaviorType.POSITIVE).length,
      negative: recentBehaviors.filter((b) => b.type === BehaviorType.NEGATIVE).length,
      incidents: recentBehaviors.filter((b) => b.isIncident).length,
    };

    // Get latest feedback (last 5)
    const latestFeedback = await feedbackRepository.find({
      where: { studentId },
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const unreadFeedbackCount = latestFeedback.filter((f) => !f.isRead).length;

    // Get recent test scores (last 5)
    const recentTests = await testRepository.find({
      where: { studentId },
      relations: ['subject'],
      order: { testDate: 'DESC' },
      take: 5,
    });

    // Calculate average score from recent tests
    const averageScore =
      recentTests.length > 0
        ? recentTests.reduce((sum, test) => sum + Number(test.percentage || 0), 0) /
          recentTests.length
        : 0;

    // Get upcoming assignments (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(currentDate.getDate() + 7);

    const upcomingAssignments = await assignmentRepository.find({
      where: {
        studentId,
        submissionStatus: SubmissionStatus.NOT_SUBMITTED,
        dueDate: Between(currentDate, sevenDaysFromNow),
      },
      relations: ['subject'],
      order: { dueDate: 'ASC' },
      take: 5,
    });

    res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          admissionNumber: student.admissionNumber,
          profilePicture: student.profilePicture,
          class: student.class
            ? {
                name: student.class.name,
                grade: student.class.grade,
                section: student.class.section,
                academicYear: student.class.academicYear,
                currentTerm: student.class.currentTerm,
              }
            : null,
        },
        attendance: {
          percentage: Math.round(attendancePercentage * 10) / 10,
          totalDays,
          presentDays,
          absentDays: totalDays - presentDays,
          period: 'Last 30 days',
        },
        assignments: {
          total: totalAssignments,
          completed: completedAssignments,
          pending: pendingAssignments,
          overdue: overdueAssignments,
          completionRate:
            totalAssignments > 0
              ? Math.round((completedAssignments / totalAssignments) * 100 * 10) / 10
              : 0,
        },
        behavior: {
          summary: behaviorSummary,
          recentNotes: recentBehaviors.map((b) => ({
            id: b.id,
            type: b.type,
            title: b.title,
            description: b.description,
            date: b.date,
            isIncident: b.isIncident,
            acknowledgedByParent: b.acknowledgedByParent,
            teacher: {
              firstName: b.teacher.firstName,
              lastName: b.teacher.lastName,
            },
          })),
        },
        feedback: {
          unreadCount: unreadFeedbackCount,
          latest: latestFeedback.map((f) => ({
            id: f.id,
            title: f.title,
            message: f.message,
            category: f.category,
            isRead: f.isRead,
            createdAt: f.createdAt,
            teacher: {
              firstName: f.teacher.firstName,
              lastName: f.teacher.lastName,
            },
          })),
        },
        academicProgress: {
          averageScore: Math.round(averageScore * 10) / 10,
          recentTests: recentTests.map((t) => ({
            id: t.id,
            title: t.title,
            subject: t.subject.name,
            score: t.score,
            maxScore: t.maxScore,
            percentage: t.percentage,
            grade: t.grade,
            testDate: t.testDate,
          })),
        },
        upcomingAssignments: upcomingAssignments.map((a) => ({
          id: a.id,
          title: a.title,
          subject: a.subject.name,
          dueDate: a.dueDate,
          description: a.description,
        })),
      },
    });
  }

  // Get dashboard summary (lighter version)
  static async getSummary(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;

    // Verify student belongs to parent
    const student = await studentRepository.findOne({
      where: { id: studentId, parentId, isActive: true },
      relations: ['class'],
    });

    if (!student) {
      throw new AppError('Student not found or access denied', 404);
    }

    const currentDate = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);

    // Quick counts
    const [
      totalAttendances,
      presentCount,
      totalAssignments,
      completedAssignments,
      unreadFeedback,
      recentTests,
    ] = await Promise.all([
      attendanceRepository.count({
        where: {
          studentId,
          date: MoreThanOrEqual(thirtyDaysAgo),
        },
      }),
      attendanceRepository.count({
        where: {
          studentId,
          date: MoreThanOrEqual(thirtyDaysAgo),
          status: AttendanceStatus.PRESENT,
        },
      }),
      assignmentRepository.count({ where: { studentId } }),
      assignmentRepository.count({
        where: {
          studentId,
          submissionStatus: SubmissionStatus.GRADED,
        },
      }),
      feedbackRepository.count({
        where: {
          studentId,
          isRead: false,
        },
      }),
      testRepository.find({
        where: { studentId },
        order: { testDate: 'DESC' },
        take: 5,
      }),
    ]);

    const attendancePercentage =
      totalAttendances > 0 ? (presentCount / totalAttendances) * 100 : 0;

    const averageScore =
      recentTests.length > 0
        ? recentTests.reduce((sum, test) => sum + Number(test.percentage || 0), 0) /
          recentTests.length
        : 0;

    res.status(200).json({
      success: true,
      message: 'Summary retrieved successfully',
      data: {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        attendancePercentage: Math.round(attendancePercentage * 10) / 10,
        assignmentsCompleted: completedAssignments,
        totalAssignments,
        unreadFeedback,
        averageScore: Math.round(averageScore * 10) / 10,
      },
    });
  }
}
