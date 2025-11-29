import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Student } from './Student';
import { Message } from './Message';
import { NotificationPreference } from './NotificationPreference';

export enum AuthProvider {
  EMAIL = 'email',
  PHONE = 'phone',
}

@Entity('parents')
@Index('idx_parent_email', ['email'])
@Index('idx_parent_phone', ['phoneNumber'])
@Index('idx_parent_active', ['isActive'])
@Index('idx_parent_auth_provider', ['authProvider'])
@Index('idx_parent_last_login', ['lastLogin'])
@Index('idx_parent_created_at', ['createdAt'])
// Composite indexes for common queries
@Index('idx_parent_active_email', ['isActive', 'email'])
@Index('idx_parent_active_phone', ['isActive', 'phoneNumber'])
export class Parent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.EMAIL,
  })
  authProvider: AuthProvider;

  @Column({ type: 'varchar', length: 6, nullable: true })
  otpCode: string;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiry: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profilePicture: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @OneToMany(() => Student, (student) => student.parent)
  students: Student[];

  @OneToMany(() => Message, (message) => message.parent)
  messages: Message[];

  @OneToMany(() => NotificationPreference, (pref) => pref.parent)
  notificationPreferences: NotificationPreference[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
