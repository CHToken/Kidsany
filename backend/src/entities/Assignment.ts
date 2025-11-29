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

export enum SubmissionStatus {
  NOT_SUBMITTED = 'not_submitted',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  LATE = 'late',
}

@Entity('assignments')
@Index('idx_assignment_student', ['studentId'])
@Index('idx_assignment_subject', ['subjectId'])
@Index('idx_assignment_due_date', ['dueDate'])
@Index('idx_assignment_status', ['submissionStatus'])
@Index('idx_assignment_created_at', ['createdAt'])
// Composite indexes for assignment tracking
@Index('idx_assignment_student_due', ['studentId', 'dueDate'])
@Index('idx_assignment_student_status', ['studentId', 'submissionStatus'])
@Index('idx_assignment_student_status_due', ['studentId', 'submissionStatus', 'dueDate'])
@Index('idx_assignment_due_status', ['dueDate', 'submissionStatus'])
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @Column()
  subjectId: string;

  @ManyToOne(() => Student, (student) => student.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.NOT_SUBMITTED,
  })
  submissionStatus: SubmissionStatus;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxScore: number;

  @Column({ type: 'text', nullable: true })
  teacherComments: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attachmentUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
