import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Student } from '../entities/Student';
import { Test } from '../entities/Test';
import { Subject } from '../entities/Subject';
import { AppError } from '../middleware/error.middleware';
import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

const studentRepository = AppDataSource.getRepository(Student);
const testRepository = AppDataSource.getRepository(Test);
const subjectRepository = AppDataSource.getRepository(Subject);

export class ProgressController {
  // Get academic progress for a student
  static async getProgress(req: Request, res: Response) {
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

    // Get all tests for the student
    const tests = await testRepository.find({
      where: { studentId },
      relations: ['subject'],
      order: { testDate: 'DESC' },
    });

    // Group tests by subject
    const subjectProgress: { [key: string]: any } = {};

    tests.forEach((test) => {
      const subjectId = test.subject.id;

      if (!subjectProgress[subjectId]) {
        subjectProgress[subjectId] = {
          subjectId: test.subject.id,
          subjectName: test.subject.name,
          subjectCode: test.subject.code,
          tests: [],
          averageScore: 0,
          averagePercentage: 0,
          totalTests: 0,
          highestScore: 0,
          lowestScore: 100,
        };
      }

      subjectProgress[subjectId].tests.push({
        id: test.id,
        title: test.title,
        testType: test.testType,
        score: test.score,
        maxScore: test.maxScore,
        percentage: test.percentage,
        grade: test.grade,
        testDate: test.testDate,
        teacherComments: test.teacherComments,
      });

      subjectProgress[subjectId].totalTests++;

      // Update statistics
      const percentage = Number(test.percentage || 0);
      if (percentage > subjectProgress[subjectId].highestScore) {
        subjectProgress[subjectId].highestScore = percentage;
      }
      if (percentage < subjectProgress[subjectId].lowestScore) {
        subjectProgress[subjectId].lowestScore = percentage;
      }
    });

    // Calculate averages for each subject
    Object.keys(subjectProgress).forEach((subjectId) => {
      const subject = subjectProgress[subjectId];
      const totalPercentage = subject.tests.reduce(
        (sum: number, test: any) => sum + Number(test.percentage || 0),
        0
      );
      subject.averagePercentage =
        subject.totalTests > 0 ? Math.round((totalPercentage / subject.totalTests) * 10) / 10 : 0;

      const totalScore = subject.tests.reduce(
        (sum: number, test: any) => sum + Number(test.score || 0),
        0
      );
      subject.averageScore =
        subject.totalTests > 0 ? Math.round((totalScore / subject.totalTests) * 10) / 10 : 0;
    });

    // Calculate overall average
    const allPercentages = tests.map((t) => Number(t.percentage || 0));
    const overallAverage =
      allPercentages.length > 0
        ? Math.round(
            (allPercentages.reduce((sum, p) => sum + p, 0) / allPercentages.length) * 10
          ) / 10
        : 0;

    res.status(200).json({
      success: true,
      message: 'Academic progress retrieved successfully',
      data: {
        studentName: `${student.firstName} ${student.lastName}`,
        class: student.class
          ? {
              name: student.class.name,
              grade: student.class.grade,
            }
          : null,
        overallAverage,
        totalTests: tests.length,
        subjects: Object.values(subjectProgress),
      },
    });
  }

  // Get all tests for a student with filtering
  static async getTests(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;
    const { subjectId, testType, startDate, endDate, limit = '50', offset = '0' } = req.query;

    // Verify student belongs to parent
    const student = await studentRepository.findOne({
      where: { id: studentId, parentId, isActive: true },
    });

    if (!student) {
      throw new AppError('Student not found or access denied', 404);
    }

    // Build query conditions
    const whereConditions: any = { studentId };

    if (subjectId) {
      whereConditions.subjectId = subjectId;
    }

    if (testType) {
      whereConditions.testType = testType;
    }

    if (startDate && endDate) {
      whereConditions.testDate = Between(
        new Date(startDate as string),
        new Date(endDate as string)
      );
    } else if (startDate) {
      whereConditions.testDate = MoreThanOrEqual(new Date(startDate as string));
    } else if (endDate) {
      whereConditions.testDate = LessThanOrEqual(new Date(endDate as string));
    }

    // Get tests
    const [tests, total] = await testRepository.findAndCount({
      where: whereConditions,
      relations: ['subject'],
      order: { testDate: 'DESC' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Calculate statistics
    const averagePercentage =
      tests.length > 0
        ? Math.round(
            (tests.reduce((sum, test) => sum + Number(test.percentage || 0), 0) / tests.length) *
              10
          ) / 10
        : 0;

    res.status(200).json({
      success: true,
      message: 'Tests retrieved successfully',
      data: {
        tests: tests.map((test) => ({
          id: test.id,
          title: test.title,
          testType: test.testType,
          subject: {
            id: test.subject.id,
            name: test.subject.name,
            code: test.subject.code,
          },
          testDate: test.testDate,
          score: test.score,
          maxScore: test.maxScore,
          percentage: test.percentage,
          grade: test.grade,
          teacherComments: test.teacherComments,
          improvementSuggestions: test.improvementSuggestions,
          createdAt: test.createdAt,
        })),
        statistics: {
          total,
          averagePercentage,
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

  // Get specific test details
  static async getTestById(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { testId } = req.params;

    // Find test and verify access
    const test = await testRepository.findOne({
      where: { id: testId },
      relations: ['subject', 'student'],
    });

    if (!test) {
      throw new AppError('Test not found', 404);
    }

    // Verify student belongs to parent
    if (test.student.parentId !== parentId) {
      throw new AppError('Access denied', 403);
    }

    res.status(200).json({
      success: true,
      message: 'Test details retrieved successfully',
      data: {
        test: {
          id: test.id,
          title: test.title,
          testType: test.testType,
          subject: {
            id: test.subject.id,
            name: test.subject.name,
            code: test.subject.code,
            description: test.subject.description,
          },
          student: {
            id: test.student.id,
            firstName: test.student.firstName,
            lastName: test.student.lastName,
          },
          testDate: test.testDate,
          score: test.score,
          maxScore: test.maxScore,
          percentage: test.percentage,
          grade: test.grade,
          teacherComments: test.teacherComments,
          improvementSuggestions: test.improvementSuggestions,
          createdAt: test.createdAt,
          updatedAt: test.updatedAt,
        },
      },
    });
  }

  // Get subject-wise performance comparison
  static async getSubjectComparison(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;

    // Verify student belongs to parent
    const student = await studentRepository.findOne({
      where: { id: studentId, parentId, isActive: true },
    });

    if (!student) {
      throw new AppError('Student not found or access denied', 404);
    }

    // Get all tests for comparison
    const tests = await testRepository.find({
      where: { studentId },
      relations: ['subject'],
    });

    // Group by subject and calculate stats
    const subjectStats: { [key: string]: any } = {};

    tests.forEach((test) => {
      const subjectId = test.subject.id;

      if (!subjectStats[subjectId]) {
        subjectStats[subjectId] = {
          subjectName: test.subject.name,
          subjectCode: test.subject.code,
          testCount: 0,
          totalPercentage: 0,
          scores: [],
        };
      }

      subjectStats[subjectId].testCount++;
      subjectStats[subjectId].totalPercentage += Number(test.percentage || 0);
      subjectStats[subjectId].scores.push(Number(test.percentage || 0));
    });

    // Calculate averages and trends
    const comparison = Object.keys(subjectStats).map((subjectId) => {
      const stats = subjectStats[subjectId];
      const average = Math.round((stats.totalPercentage / stats.testCount) * 10) / 10;
      const highest = Math.max(...stats.scores);
      const lowest = Math.min(...stats.scores);

      // Simple trend calculation (comparing first half vs second half of scores)
      let trend = 'stable';
      if (stats.scores.length >= 4) {
        const midPoint = Math.floor(stats.scores.length / 2);
        const firstHalfAvg =
          stats.scores.slice(0, midPoint).reduce((a: number, b: number) => a + b, 0) / midPoint;
        const secondHalfAvg =
          stats.scores
            .slice(midPoint)
            .reduce((a: number, b: number) => a + b, 0) /
          (stats.scores.length - midPoint);

        if (secondHalfAvg > firstHalfAvg + 5) trend = 'improving';
        else if (secondHalfAvg < firstHalfAvg - 5) trend = 'declining';
      }

      return {
        subjectName: stats.subjectName,
        subjectCode: stats.subjectCode,
        testCount: stats.testCount,
        average,
        highest,
        lowest,
        trend,
      };
    });

    // Sort by average descending
    comparison.sort((a, b) => b.average - a.average);

    res.status(200).json({
      success: true,
      message: 'Subject comparison retrieved successfully',
      data: {
        studentName: `${student.firstName} ${student.lastName}`,
        subjects: comparison,
      },
    });
  }
}
