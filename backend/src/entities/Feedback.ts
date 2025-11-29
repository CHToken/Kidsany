import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Student } from './Student';
import { Teacher } from './Teacher';
import { FeedbackReply } from './FeedbackReply';

export enum FeedbackCategory {
  ACADEMIC = 'academic',
  BEHAVIOR = 'behavior',
  PARTICIPATION = 'participation',
  GENERAL = 'general',
}

@Entity('feedbacks')
@Index('idx_feedback_student', ['studentId'])
@Index('idx_feedback_teacher', ['teacherId'])
@Index('idx_feedback_category', ['category'])
@Index('idx_feedback_read', ['isRead'])
@Index('idx_feedback_read_at', ['readAt'])
@Index('idx_feedback_created_at', ['createdAt'])
@Index('idx_feedback_updated_at', ['updatedAt'])
// Composite indexes for common queries
@Index('idx_feedback_student_created', ['studentId', 'createdAt'])
@Index('idx_feedback_student_category', ['studentId', 'category'])
@Index('idx_feedback_student_read', ['studentId', 'isRead'])
@Index('idx_feedback_teacher_created', ['teacherId', 'createdAt'])
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.feedbacks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.feedbacks)
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column()
  teacherId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: FeedbackCategory,
    default: FeedbackCategory.GENERAL,
  })
  category: FeedbackCategory;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @OneToMany(() => FeedbackReply, (reply) => reply.feedback)
  replies: FeedbackReply[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
