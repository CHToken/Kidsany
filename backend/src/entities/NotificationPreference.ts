import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Parent } from './Parent';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Parent, (parent) => parent.notificationPreferences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Parent;

  @Column()
  parentId: string;

  @Column({ type: 'boolean', default: true })
  emailNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  smsNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  inAppNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  feedbackNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  testScoreNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  attendanceNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  behaviorNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  assignmentNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  messageNotifications: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
