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

export enum NotificationType {
  FEEDBACK = 'feedback',
  TEST_SCORE = 'test_score',
  ATTENDANCE = 'attendance',
  BEHAVIOR = 'behavior',
  ASSIGNMENT = 'assignment',
  MESSAGE = 'message',
  GENERAL = 'general',
}

@Entity('notifications')
@Index('idx_notification_parent', ['parentId'])
@Index('idx_notification_type', ['type'])
@Index('idx_notification_read', ['isRead'])
@Index('idx_notification_read_at', ['readAt'])
@Index('idx_notification_created_at', ['createdAt'])
@Index('idx_notification_related_entity', ['relatedEntityId'])
// Critical composite indexes for notification center
@Index('idx_notification_parent_read_created', ['parentId', 'isRead', 'createdAt'])
@Index('idx_notification_parent_type_created', ['parentId', 'type', 'createdAt'])
@Index('idx_notification_parent_created', ['parentId', 'createdAt'])
@Index('idx_notification_parent_read', ['parentId', 'isRead'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Parent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: Parent;

  @Column()
  parentId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  link: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  relatedEntityId: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
