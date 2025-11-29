import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
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
