import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Parent } from './Parent';
import { Teacher } from './Teacher';

export enum MessageSender {
  PARENT = 'parent',
  TEACHER = 'teacher',
}

@Entity('messages')
@Index('idx_message_parent', ['parentId'])
@Index('idx_message_teacher', ['teacherId'])
@Index('idx_message_sender', ['senderType'])
@Index('idx_message_read', ['isRead'])
@Index('idx_message_read_at', ['readAt'])
@Index('idx_message_created_at', ['createdAt'])
// Critical composite indexes for inbox queries
@Index('idx_message_parent_read_created', ['parentId', 'isRead', 'createdAt'])
@Index('idx_message_teacher_read_created', ['teacherId', 'isRead', 'createdAt'])
@Index('idx_message_parent_created', ['parentId', 'createdAt'])
@Index('idx_message_teacher_created', ['teacherId', 'createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Parent, (parent) => parent.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: Parent;

  @Column()
  parentId: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.messages)
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column()
  teacherId: string;

  @Column({
    type: 'enum',
    enum: MessageSender,
  })
  senderType: MessageSender;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attachmentUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
