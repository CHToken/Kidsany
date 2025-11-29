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
import { Subject } from './Subject';

@Entity('tests')
@Index('idx_test_student', ['studentId'])
@Index('idx_test_subject', ['subjectId'])
@Index('idx_test_date', ['testDate'])
@Index('idx_test_type', ['testType'])
@Index('idx_test_created_at', ['createdAt'])
// Critical composite indexes for performance analytics
@Index('idx_test_student_date', ['studentId', 'testDate'])
@Index('idx_test_student_subject', ['studentId', 'subjectId'])
@Index('idx_test_student_subject_date', ['studentId', 'subjectId', 'testDate'])
@Index('idx_test_subject_date', ['subjectId', 'testDate'])
export class Test {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 100 })
  testType: string; // Quiz, Mid-term, Final, etc.

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @Column()
  subjectId: string;

  @ManyToOne(() => Student, (student) => student.tests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: string;

  @Column({ type: 'date' })
  testDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  maxScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  grade: string;

  @Column({ type: 'text', nullable: true })
  teacherComments: string;

  @Column({ type: 'text', nullable: true })
  improvementSuggestions: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
