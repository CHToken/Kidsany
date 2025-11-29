import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Parent } from '../entities/Parent';
import { Student } from '../entities/Student';
import { Teacher } from '../entities/Teacher';
import { Admin } from '../entities/Admin';
import { Class } from '../entities/Class';
import { Subject } from '../entities/Subject';
import { Attendance } from '../entities/Attendance';
import { Assignment } from '../entities/Assignment';
import { Test } from '../entities/Test';
import { Behavior } from '../entities/Behavior';
import { Feedback } from '../entities/Feedback';
import { FeedbackReply } from '../entities/FeedbackReply';
import { Message } from '../entities/Message';
import { TermReport } from '../entities/TermReport';
import { NotificationPreference } from '../entities/NotificationPreference';
import { Notification } from '../entities/Notification';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'kidsany_db',
  synchronize: process.env.NODE_ENV === 'development', // Only in development
  logging: process.env.NODE_ENV === 'development',
  entities: [
    Parent,
    Student,
    Teacher,
    Admin,
    Class,
    Subject,
    Attendance,
    Assignment,
    Test,
    Behavior,
    Feedback,
    FeedbackReply,
    Message,
    TermReport,
    NotificationPreference,
    Notification,
  ],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
  // Security: Enable parameterized queries (TypeORM does this by default)
  extra: {
    // Additional security settings
    max: 20, // Maximum pool size
    connectionTimeoutMillis: 5000,
  },
});
