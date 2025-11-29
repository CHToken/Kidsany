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
import { Parent } from './Parent';
import { Class } from './Class';
import { Attendance } from './Attendance';
import { Assignment } from './Assignment';
import { Test } from './Test';
import { Behavior } from './Behavior';
import { Feedback } from './Feedback';
import { TermReport } from './TermReport';

@Entity('students')
@Index('idx_student_parent', ['parentId'])
@Index('idx_student_class', ['classId'])
@Index('idx_student_admission', ['admissionNumber'])
@Index('idx_student_active', ['isActive'])
@Index('idx_student_created_at', ['createdAt'])
// Composite indexes for common query patterns
@Index('idx_student_parent_active', ['parentId', 'isActive'])
@Index('idx_student_class_active', ['classId', 'isActive'])
@Index('idx_student_parent_class', ['parentId', 'classId'])
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 50, unique: true })
  admissionNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profilePicture: string;

  @Column({ type: 'varchar', length: 10 })
  gender: string;

  @ManyToOne(() => Parent, (parent) => parent.students, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: Parent;

  @Column()
  parentId: string;

  @ManyToOne(() => Class, (classEntity) => classEntity.students)
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column()
  classId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances: Attendance[];

  @OneToMany(() => Assignment, (assignment) => assignment.student)
  assignments: Assignment[];

  @OneToMany(() => Test, (test) => test.student)
  tests: Test[];

  @OneToMany(() => Behavior, (behavior) => behavior.student)
  behaviors: Behavior[];

  @OneToMany(() => Feedback, (feedback) => feedback.student)
  feedbacks: Feedback[];

  @OneToMany(() => TermReport, (report) => report.student)
  termReports: TermReport[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
