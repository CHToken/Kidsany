import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Student } from '../entities/Student';
import { Assignment, SubmissionStatus } from '../entities/Assignment';
import { AppError } from '../middleware/error.middleware';
import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

const studentRepository = AppDataSource.getRepository(Student);
const assignmentRepository = AppDataSource.getRepository(Assignment);

export class AssignmentController {
  // Get all assignments for a student
  static async getAssignments(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;
    const { status, subjectId, startDate, endDate, limit = '50', offset = '0' } = req.query;

    // Verify student belongs to parent
    const student = await studentRepository.findOne({
      where: { id: studentId, parentId, isActive: true },
    });

    if (!student) {
      throw new AppError('Student not found or access denied', 404);
    }

    // Build query conditions
    const whereConditions: any = { studentId };

    // Filter by status
    if (status && Object.values(SubmissionStatus).includes(status as SubmissionStatus)) {
      whereConditions.submissionStatus = status;
    }

    // Filter by subject
    if (subjectId) {
      whereConditions.subjectId = subjectId;
    }

    // Filter by due date
    if (startDate && endDate) {
      whereConditions.dueDate = Between(
        new Date(startDate as string),
        new Date(endDate as string)
      );
    } else if (startDate) {
      whereConditions.dueDate = MoreThanOrEqual(new Date(startDate as string));
    } else if (endDate) {
      whereConditions.dueDate = LessThanOrEqual(new Date(endDate as string));
    }

    // Get assignments
    const [assignments, total] = await assignmentRepository.findAndCount({
      where: whereConditions,
      relations: ['subject'],
      order: { dueDate: 'DESC' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const currentDate = new Date();

    // Map assignments with additional info
    const mappedAssignments = assignments.map((assignment) => {
      const dueDate = new Date(assignment.dueDate);
      const isOverdue =
        assignment.submissionStatus === SubmissionStatus.NOT_SUBMITTED && dueDate < currentDate;
      const daysUntilDue = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        subject: {
          id: assignment.subject.id,
          name: assignment.subject.name,
          code: assignment.subject.code,
        },
        dueDate: assignment.dueDate,
        submissionStatus: assignment.submissionStatus,
        submittedAt: assignment.submittedAt,
        score: assignment.score,
        maxScore: assignment.maxScore,
        teacherComments: assignment.teacherComments,
        attachmentUrl: assignment.attachmentUrl,
        isOverdue,
        daysUntilDue: daysUntilDue > 0 ? daysUntilDue : null,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      };
    });

    // Calculate statistics
    const stats = {
      total,
      notSubmitted: assignments.filter((a) => a.submissionStatus === SubmissionStatus.NOT_SUBMITTED).length,
      submitted: assignments.filter((a) => a.submissionStatus === SubmissionStatus.SUBMITTED).length,
      graded: assignments.filter((a) => a.submissionStatus === SubmissionStatus.GRADED).length,
      late: assignments.filter((a) => a.submissionStatus === SubmissionStatus.LATE).length,
      overdue: mappedAssignments.filter((a) => a.isOverdue).length,
    };

    const completionRate =
      total > 0
        ? Math.round(((stats.submitted + stats.graded + stats.late) / total) * 100 * 10) / 10
        : 0;

    res.status(200).json({
      success: true,
      message: 'Assignments retrieved successfully',
      data: {
        assignments: mappedAssignments,
        statistics: {
          ...stats,
          completionRate,
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

  // Get specific assignment details
  static async getAssignmentById(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { assignmentId } = req.params;

    // Find assignment and verify access
    const assignment = await assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['subject', 'student'],
    });

    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }

    // Verify student belongs to parent
    if (assignment.student.parentId !== parentId) {
      throw new AppError('Access denied', 403);
    }

    const currentDate = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue =
      assignment.submissionStatus === SubmissionStatus.NOT_SUBMITTED && dueDate < currentDate;
    const daysUntilDue = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

    res.status(200).json({
      success: true,
      message: 'Assignment details retrieved successfully',
      data: {
        assignment: {
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          subject: {
            id: assignment.subject.id,
            name: assignment.subject.name,
            code: assignment.subject.code,
            description: assignment.subject.description,
          },
          student: {
            id: assignment.student.id,
            firstName: assignment.student.firstName,
            lastName: assignment.student.lastName,
          },
          dueDate: assignment.dueDate,
          submissionStatus: assignment.submissionStatus,
          submittedAt: assignment.submittedAt,
          score: assignment.score,
          maxScore: assignment.maxScore,
          percentage:
            assignment.score && assignment.maxScore
              ? Math.round((Number(assignment.score) / Number(assignment.maxScore)) * 100 * 10) / 10
              : null,
          teacherComments: assignment.teacherComments,
          attachmentUrl: assignment.attachmentUrl,
          isOverdue,
          daysUntilDue: daysUntilDue > 0 ? daysUntilDue : null,
          createdAt: assignment.createdAt,
          updatedAt: assignment.updatedAt,
        },
      },
    });
  }

  // Get upcoming assignments
  static async getUpcomingAssignments(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;
    const { days = '7' } = req.query;

    // Verify student belongs to parent
    const student = await studentRepository.findOne({
      where: { id: studentId, parentId, isActive: true },
    });

    if (!student) {
      throw new AppError('Student not found or access denied', 404);
    }

    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + parseInt(days as string));

    // Get upcoming assignments
    const assignments = await assignmentRepository.find({
      where: {
        studentId,
        submissionStatus: SubmissionStatus.NOT_SUBMITTED,
        dueDate: Between(currentDate, futureDate),
      },
      relations: ['subject'],
      order: { dueDate: 'ASC' },
    });

    res.status(200).json({
      success: true,
      message: 'Upcoming assignments retrieved successfully',
      data: {
        assignments: assignments.map((a) => ({
          id: a.id,
          title: a.title,
          subject: {
            id: a.subject.id,
            name: a.subject.name,
          },
          dueDate: a.dueDate,
          description: a.description,
          daysUntilDue: Math.ceil(
            (new Date(a.dueDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
        count: assignments.length,
        period: `Next ${days} days`,
      },
    });
  }

  // Get overdue assignments
  static async getOverdueAssignments(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;

    // Verify student belongs to parent
    const student = await studentRepository.findOne({
      where: { id: studentId, parentId, isActive: true },
    });

    if (!student) {
      throw new AppError('Student not found or access denied', 404);
    }

    const currentDate = new Date();

    // Get overdue assignments
    const assignments = await assignmentRepository.find({
      where: {
        studentId,
        submissionStatus: SubmissionStatus.NOT_SUBMITTED,
        dueDate: LessThanOrEqual(currentDate),
      },
      relations: ['subject'],
      order: { dueDate: 'DESC' },
    });

    res.status(200).json({
      success: true,
      message: 'Overdue assignments retrieved successfully',
      data: {
        assignments: assignments.map((a) => ({
          id: a.id,
          title: a.title,
          subject: {
            id: a.subject.id,
            name: a.subject.name,
          },
          dueDate: a.dueDate,
          description: a.description,
          daysOverdue: Math.ceil(
            (currentDate.getTime() - new Date(a.dueDate).getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
        count: assignments.length,
      },
    });
  }
}
