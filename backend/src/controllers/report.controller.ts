import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Student } from '../entities/Student';
import { TermReport } from '../entities/TermReport';
import { AppError } from '../middleware/error.middleware';

const studentRepository = AppDataSource.getRepository(Student);
const reportRepository = AppDataSource.getRepository(TermReport);

export class ReportController {
  // Get all term reports for a student
  static async getReports(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;
    const { academicYear, term, limit = '50', offset = '0' } = req.query;

    // Verify student belongs to parent
    const student = await studentRepository.findOne({
      where: { id: studentId, parentId, isActive: true },
    });

    if (!student) {
      throw new AppError('Student not found or access denied', 404);
    }

    // Build query conditions
    const whereConditions: any = { studentId };

    // Filter by academic year
    if (academicYear) {
      whereConditions.academicYear = parseInt(academicYear as string);
    }

    // Filter by term
    if (term) {
      whereConditions.term = term;
    }

    // Get reports
    const [reports, total] = await reportRepository.findAndCount({
      where: whereConditions,
      order: { academicYear: 'DESC', term: 'DESC' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    res.status(200).json({
      success: true,
      message: 'Term reports retrieved successfully',
      data: {
        reports: reports.map((r) => ({
          id: r.id,
          term: r.term,
          academicYear: r.academicYear,
          reportFileUrl: r.reportFileUrl,
          overallScore: r.overallScore,
          overallPercentage: r.overallPercentage,
          overallGrade: r.overallGrade,
          classRank: r.classRank,
          totalStudents: r.totalStudents,
          principalComments: r.principalComments,
          teacherComments: r.teacherComments,
          reportDate: r.reportDate,
          createdAt: r.createdAt,
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

  // Get specific report details
  static async getReportById(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { reportId } = req.params;

    // Find report and verify access
    const report = await reportRepository.findOne({
      where: { id: reportId },
      relations: ['student', 'student.class'],
    });

    if (!report) {
      throw new AppError('Report not found', 404);
    }

    // Verify student belongs to parent
    if (report.student.parentId !== parentId) {
      throw new AppError('Access denied', 403);
    }

    res.status(200).json({
      success: true,
      message: 'Report details retrieved successfully',
      data: {
        report: {
          id: report.id,
          term: report.term,
          academicYear: report.academicYear,
          reportFileUrl: report.reportFileUrl,
          overallScore: report.overallScore,
          overallPercentage: report.overallPercentage,
          overallGrade: report.overallGrade,
          classRank: report.classRank,
          totalStudents: report.totalStudents,
          principalComments: report.principalComments,
          teacherComments: report.teacherComments,
          reportDate: report.reportDate,
          student: {
            id: report.student.id,
            firstName: report.student.firstName,
            lastName: report.student.lastName,
            admissionNumber: report.student.admissionNumber,
            class: report.student.class
              ? {
                  name: report.student.class.name,
                  grade: report.student.class.grade,
                }
              : null,
          },
          createdAt: report.createdAt,
          updatedAt: report.updatedAt,
        },
      },
    });
  }

  // Get download link for a report
  static async downloadReport(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { reportId } = req.params;

    // Find report and verify access
    const report = await reportRepository.findOne({
      where: { id: reportId },
      relations: ['student'],
    });

    if (!report) {
      throw new AppError('Report not found', 404);
    }

    // Verify student belongs to parent
    if (report.student.parentId !== parentId) {
      throw new AppError('Access denied', 403);
    }

    res.status(200).json({
      success: true,
      message: 'Report download link retrieved successfully',
      data: {
        reportId: report.id,
        reportFileUrl: report.reportFileUrl,
        term: report.term,
        academicYear: report.academicYear,
      },
    });
  }

  // Get report statistics for a student
  static async getReportStatistics(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;

    // Verify student belongs to parent
    const student = await studentRepository.findOne({
      where: { id: studentId, parentId, isActive: true },
    });

    if (!student) {
      throw new AppError('Student not found or access denied', 404);
    }

    // Get all reports for the student
    const reports = await reportRepository.find({
      where: { studentId },
      order: { academicYear: 'ASC', term: 'ASC' },
    });

    if (reports.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No reports found for this student',
        data: {
          statistics: null,
          reports: [],
        },
      });
    }

    // Calculate statistics
    const totalReports = reports.length;
    const averageScore =
      reports.reduce((sum, r) => sum + Number(r.overallPercentage || 0), 0) / totalReports;

    const bestReport = reports.reduce((best, current) =>
      Number(current.overallPercentage || 0) > Number(best.overallPercentage || 0)
        ? current
        : best
    );

    const latestReport = reports[reports.length - 1];

    // Calculate trend (comparing first and latest reports)
    let trend = 'stable';
    if (reports.length >= 2) {
      const firstScore = Number(reports[0].overallPercentage || 0);
      const latestScore = Number(latestReport.overallPercentage || 0);

      if (latestScore > firstScore + 5) trend = 'improving';
      else if (latestScore < firstScore - 5) trend = 'declining';
    }

    // Group by academic year
    const byYear: { [key: number]: any } = {};

    reports.forEach((report) => {
      if (!byYear[report.academicYear]) {
        byYear[report.academicYear] = {
          year: report.academicYear,
          reports: [],
          averagePercentage: 0,
        };
      }

      byYear[report.academicYear].reports.push({
        term: report.term,
        overallPercentage: report.overallPercentage,
        overallGrade: report.overallGrade,
      });
    });

    // Calculate average for each year
    Object.keys(byYear).forEach((year) => {
      const yearReports = byYear[parseInt(year)].reports;
      byYear[parseInt(year)].averagePercentage =
        Math.round(
          (yearReports.reduce(
            (sum: number, r: any) => sum + Number(r.overallPercentage || 0),
            0
          ) /
            yearReports.length) *
            10
        ) / 10;
    });

    res.status(200).json({
      success: true,
      message: 'Report statistics retrieved successfully',
      data: {
        statistics: {
          totalReports,
          averageScore: Math.round(averageScore * 10) / 10,
          trend,
          bestPerformance: {
            term: bestReport.term,
            academicYear: bestReport.academicYear,
            percentage: bestReport.overallPercentage,
            grade: bestReport.overallGrade,
          },
          latestReport: {
            id: latestReport.id,
            term: latestReport.term,
            academicYear: latestReport.academicYear,
            percentage: latestReport.overallPercentage,
            grade: latestReport.overallGrade,
            rank: latestReport.classRank,
          },
        },
        byAcademicYear: Object.values(byYear),
      },
    });
  }
}
