import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Student } from './Student';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

@Entity('attendances')
@Index('idx_attendance_student', ['studentId'])
@Index('idx_attendance_date', ['date'])
@Index('idx_attendance_status', ['status'])
@Index('idx_attendance_created_at', ['createdAt'])
// Critical composite indexes for high-performance queries
@Index('idx_attendance_student_date', ['studentId', 'date'])
@Index('idx_attendance_student_status', ['studentId', 'status'])
@Index('idx_attendance_student_date_status', ['studentId', 'date', 'status'])
// For date range queries
@Index('idx_attendance_date_student', ['date', 'studentId'])
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.attendances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
