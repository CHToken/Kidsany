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
import { Teacher } from './Teacher';

export enum BehaviorType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
}

@Entity('behaviors')
@Index('idx_behavior_student', ['studentId'])
@Index('idx_behavior_teacher', ['teacherId'])
@Index('idx_behavior_date', ['date'])
@Index('idx_behavior_type', ['type'])
@Index('idx_behavior_category', ['category'])
@Index('idx_behavior_acknowledged', ['acknowledgedByParent'])
@Index('idx_behavior_incident', ['isIncident'])
@Index('idx_behavior_created_at', ['createdAt'])
// Composite indexes for behavior tracking
@Index('idx_behavior_student_date', ['studentId', 'date'])
@Index('idx_behavior_student_type', ['studentId', 'type'])
@Index('idx_behavior_student_acknowledged', ['studentId', 'acknowledgedByParent'])
@Index('idx_behavior_student_type_date', ['studentId', 'type', 'date'])
export class Behavior {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (student) => student.behaviors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: string;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column()
  teacherId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: BehaviorType,
    default: BehaviorType.NEUTRAL,
  })
  type: BehaviorType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', nullable: true })
  points: number; // For rewards/badges system

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string; // Discipline, Participation, Conduct, etc.

  @Column({ type: 'boolean', default: false })
  isIncident: boolean;

  @Column({ type: 'boolean', default: false })
  acknowledgedByParent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
