import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Feedback } from './Feedback';
import { Parent } from './Parent';
import { Teacher } from './Teacher';

export enum ReplySender {
  PARENT = 'parent',
  TEACHER = 'teacher',
}

@Entity('feedback_replies')
@Index('idx_feedback_reply_feedback', ['feedbackId'])
@Index('idx_feedback_reply_parent', ['parentId'])
@Index('idx_feedback_reply_teacher', ['teacherId'])
@Index('idx_feedback_reply_sender', ['senderType'])
@Index('idx_feedback_reply_read', ['isRead'])
@Index('idx_feedback_reply_created_at', ['createdAt'])
// Composite indexes for threaded conversations
@Index('idx_feedback_reply_feedback_created', ['feedbackId', 'createdAt'])
@Index('idx_feedback_reply_feedback_read', ['feedbackId', 'isRead'])
export class FeedbackReply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Feedback, (feedback) => feedback.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feedbackId' })
  feedback: Feedback;

  @Column()
  feedbackId: string;

  @Column({
    type: 'enum',
    enum: ReplySender,
  })
  senderType: ReplySender;

  @ManyToOne(() => Parent, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Parent;

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => Teacher, { nullable: true })
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column({ nullable: true })
  teacherId: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
