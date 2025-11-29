import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Student } from './Student';

@Entity('term_reports')
@Index('idx_term_report_student', ['studentId'])
@Index('idx_term_report_term', ['term'])
@Index('idx_term_report_year', ['academicYear'])
@Index('idx_term_report_date', ['reportDate'])
@Index('idx_term_report_created_at', ['createdAt'])
// Composite indexes for report retrieval
@Index('idx_term_report_student_year', ['studentId', 'academicYear'])
@Index('idx_term_report_student_term', ['studentId', 'term'])
@Index('idx_term_report_student_year_term', ['studentId', 'academicYear', 'term'])
@Index('idx_term_report_year_term', ['academicYear', 'term'])
export class TermReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.termReports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: string;

  @Column({ type: 'varchar', length: 50 })
  term: string; // Term 1, Term 2, etc.

  @Column({ type: 'int' })
  academicYear: number;

  @Column({ type: 'varchar', length: 255 })
  reportFileUrl: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  overallScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  overallPercentage: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  overallGrade: string;

  @Column({ type: 'int', nullable: true })
  classRank: number;

  @Column({ type: 'int', nullable: true })
  totalStudents: number;

  @Column({ type: 'text', nullable: true })
  principalComments: string;

  @Column({ type: 'text', nullable: true })
  teacherComments: string;

  @Column({ type: 'date', nullable: true })
  reportDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
