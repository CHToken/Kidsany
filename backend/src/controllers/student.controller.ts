import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Student } from '../entities/Student';
import { AppError } from '../middleware/error.middleware';

const studentRepository = AppDataSource.getRepository(Student);

export class StudentController {
  // Get all students for the logged-in parent
  static async getAllStudents(req: Request, res: Response) {
    const parentId = req.user!.id;

    const students = await studentRepository.find({
      where: { parentId, isActive: true },
      relations: ['class', 'class.teacher'],
      order: { firstName: 'ASC' },
    });

    res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      data: {
        students: students.map((student) => ({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          dateOfBirth: student.dateOfBirth,
          admissionNumber: student.admissionNumber,
          profilePicture: student.profilePicture,
          gender: student.gender,
          class: student.class
            ? {
                id: student.class.id,
                name: student.class.name,
                grade: student.class.grade,
                section: student.class.section,
                academicYear: student.class.academicYear,
                currentTerm: student.class.currentTerm,
                teacher: student.class.teacher
                  ? {
                      id: student.class.teacher.id,
                      firstName: student.class.teacher.firstName,
                      lastName: student.class.teacher.lastName,
                      email: student.class.teacher.email,
                    }
                  : null,
              }
            : null,
          createdAt: student.createdAt,
          updatedAt: student.updatedAt,
        })),
        count: students.length,
      },
    });
  }

  // Get specific student details
  static async getStudentById(req: Request, res: Response) {
    const parentId = req.user!.id;
    const { studentId } = req.params;

    const student = await studentRepository.findOne({
      where: { id: studentId, parentId, isActive: true },
      relations: ['class', 'class.teacher', 'class.teacher.subjects'],
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Student details retrieved successfully',
      data: {
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          dateOfBirth: student.dateOfBirth,
          admissionNumber: student.admissionNumber,
          profilePicture: student.profilePicture,
          gender: student.gender,
          class: student.class
            ? {
                id: student.class.id,
                name: student.class.name,
                grade: student.class.grade,
                section: student.class.section,
                academicYear: student.class.academicYear,
                currentTerm: student.class.currentTerm,
                teacher: student.class.teacher
                  ? {
                      id: student.class.teacher.id,
                      firstName: student.class.teacher.firstName,
                      lastName: student.class.teacher.lastName,
                      email: student.class.teacher.email,
                      phoneNumber: student.class.teacher.phoneNumber,
                      subjects: student.class.teacher.subjects || [],
                    }
                  : null,
              }
            : null,
          createdAt: student.createdAt,
          updatedAt: student.updatedAt,
        },
      },
    });
  }
}
