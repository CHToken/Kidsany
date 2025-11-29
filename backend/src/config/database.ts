import { DataSource } from 'typeorm';
import { config } from './environment';
import { DATABASE_CONFIG } from './constants';
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

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.database.synchronize,
  logging: config.database.logging,
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
    // Environment-specific pool settings
    max: DATABASE_CONFIG.POOL_SIZE,
    connectionTimeoutMillis: DATABASE_CONFIG.CONNECTION_TIMEOUT,
    idleTimeoutMillis: DATABASE_CONFIG.IDLE_TIMEOUT,
  },
});
