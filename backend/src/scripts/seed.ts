/**

 * Database Seed Script

 *

 * Populates the database with realistic test data for development and testing.

 * Control via .env: ENABLE_SEEDING=true/false

 *

 * Usage:

 *   npm run seed        - Run seeding

 *   npm run seed:clear  - Clear all seeded data

 */

import { AppDataSource } from "../config/database";

import { Parent, AuthProvider } from "../entities/Parent";

import { Student } from "../entities/Student";

import { Teacher } from "../entities/Teacher";

import { Admin } from "../entities/Admin";

import { Class } from "../entities/Class";

import { Subject } from "../entities/Subject";

import { Attendance, AttendanceStatus } from "../entities/Attendance";

import { Assignment, SubmissionStatus } from "../entities/Assignment";

import { Test } from "../entities/Test";

import { Behavior, BehaviorType } from "../entities/Behavior";

import { Feedback, FeedbackCategory } from "../entities/Feedback";

import { FeedbackReply, ReplySender } from "../entities/FeedbackReply";

import { Message, MessageSender } from "../entities/Message";

import { TermReport } from "../entities/TermReport";

import { Notification, NotificationType } from "../entities/Notification";

import { NotificationPreference } from "../entities/NotificationPreference";

import { hashPassword } from "../utils/password.utils";

// Check if seeding is enabled

const ENABLE_SEEDING = process.env.ENABLE_SEEDING === "true";

const SEED_PASSWORD = process.env.SEED_PASSWORD || "Test1234!";

if (!ENABLE_SEEDING) {
  console.log(
    "⚠️  Seeding is disabled. Set ENABLE_SEEDING=true in .env to enable."
  );

  process.exit(0);
}

// Helper function to generate random data

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomScore(min: number = 40, max: number = 100): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

async function seed() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // Initialize database connection

    await AppDataSource.initialize();

    console.log("✅ Database connected\n");

    // Hash password once

    const hashedPassword = await hashPassword(SEED_PASSWORD);

    // Step 1: Create Admin

    console.log("👤 Creating admin account...");

    const adminRepo = AppDataSource.getRepository(Admin);

    let admin = await adminRepo.findOne({
      where: { email: "admin@kidsany.com" },
    });

    if (!admin) {
      admin = adminRepo.create({
        firstName: "System",

        lastName: "Administrator",

        email: "admin@kidsany.com",

        password: hashedPassword,
      });

      await adminRepo.save(admin);

      console.log("✅ Admin created: admin@kidsany.com / " + SEED_PASSWORD);
    } else {
      console.log("ℹ️  Admin already exists");
    }

    // Step 2: Create Classes

    console.log("\n📚 Creating classes...");

    const classRepo = AppDataSource.getRepository(Class);

    const classData = [
      { name: "Grade 1A", grade: "Grade 1", academicYear: 2024, capacity: 30 },

      { name: "Grade 1B", grade: "Grade 1", academicYear: 2024, capacity: 30 },

      { name: "Grade 2A", grade: "Grade 2", academicYear: 2024, capacity: 28 },

      { name: "Grade 3A", grade: "Grade 3", academicYear: 2024, capacity: 25 },

      { name: "Grade 4A", grade: "Grade 4", academicYear: 2024, capacity: 25 },
    ];

    const classes: Class[] = [];

    for (const data of classData) {
      let classEntity = await classRepo.findOne({ where: { name: data.name } });

      if (!classEntity) {
        classEntity = classRepo.create(data);

        await classRepo.save(classEntity);
      }

      classes.push(classEntity);
    }

    console.log(`✅ Created ${classes.length} classes`);

    // Step 3: Create Subjects

    console.log("\n📖 Creating subjects...");

    const subjectRepo = AppDataSource.getRepository(Subject);

    const subjectNames = [
      "Mathematics",
      "English",
      "Science",
      "History",
      "Geography",
      "Art",
      "Physical Education",
    ];

    const subjects: Subject[] = [];

    for (const name of subjectNames) {
      let subject = await subjectRepo.findOne({ where: { name } });

      if (!subject) {
        subject = subjectRepo.create({
          name,
          code: name.substring(0, 3).toUpperCase(),
        });

        await subjectRepo.save(subject);
      }

      subjects.push(subject);
    }

    console.log(`✅ Created ${subjects.length} subjects`);

    // Step 4: Create Teachers

    console.log("\n👨‍🏫 Creating teachers...");

    const teacherRepo = AppDataSource.getRepository(Teacher);

    const teacherData = [
      {
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@kidsany.com",
        phoneNumber: "+1234567801",
      },

      {
        firstName: "Mary",
        lastName: "Johnson",
        email: "mary.johnson@kidsany.com",
        phoneNumber: "+1234567802",
      },

      {
        firstName: "David",
        lastName: "Williams",
        email: "david.williams@kidsany.com",
        phoneNumber: "+1234567803",
      },

      {
        firstName: "Sarah",
        lastName: "Brown",
        email: "sarah.brown@kidsany.com",
        phoneNumber: "+1234567804",
      },

      {
        firstName: "Michael",
        lastName: "Davis",
        email: "michael.davis@kidsany.com",
        phoneNumber: "+1234567805",
      },
    ];

    const teachers: Teacher[] = [];

    for (let i = 0; i < teacherData.length; i++) {
      let teacher = await teacherRepo.findOne({
        where: { email: teacherData[i].email },
      });

      if (!teacher) {
        teacher = teacherRepo.create({
          ...teacherData[i],

          password: hashedPassword,

          subjects: [subjects[i % subjects.length]],
        });

        await teacherRepo.save(teacher);
      }

      teachers.push(teacher);
    }

    console.log(`✅ Created ${teachers.length} teachers`);

    // Assign teachers to classes

    for (let i = 0; i < classes.length; i++) {
      classes[i].teacher = teachers[i % teachers.length];

      await classRepo.save(classes[i]);
    }

    // Step 5: Create Parents

    console.log("\n👨‍👩‍👧‍👦 Creating parents...");

    const parentRepo = AppDataSource.getRepository(Parent);

    const parentData = [
      {
        firstName: "Robert",
        lastName: "Anderson",
        email: "robert.anderson@example.com",
        phoneNumber: "+1234567901",
      },

      {
        firstName: "Jennifer",
        lastName: "Taylor",
        email: "jennifer.taylor@example.com",
        phoneNumber: "+1234567902",
      },

      {
        firstName: "William",
        lastName: "Thomas",
        email: "william.thomas@example.com",
        phoneNumber: "+1234567903",
      },

      {
        firstName: "Linda",
        lastName: "Moore",
        email: "linda.moore@example.com",
        phoneNumber: "+1234567904",
      },

      {
        firstName: "Richard",
        lastName: "Martin",
        email: "richard.martin@example.com",
        phoneNumber: "+1234567905",
      },

      {
        firstName: "Barbara",
        lastName: "Jackson",
        email: "barbara.jackson@example.com",
        phoneNumber: "+1234567906",
      },

      {
        firstName: "Joseph",
        lastName: "White",
        email: "joseph.white@example.com",
        phoneNumber: "+1234567907",
      },

      {
        firstName: "Susan",
        lastName: "Harris",
        email: "susan.harris@example.com",
        phoneNumber: "+1234567908",
      },

      {
        firstName: "Thomas",
        lastName: "Clark",
        email: "thomas.clark@example.com",
        phoneNumber: "+1234567909",
      },

      {
        firstName: "Jessica",
        lastName: "Lewis",
        email: "jessica.lewis@example.com",
        phoneNumber: "+1234567910",
      },
    ];

    const parents: Parent[] = [];

    for (const data of parentData) {
      let parent = await parentRepo.findOne({ where: { email: data.email } });

      if (!parent) {
        parent = parentRepo.create({
          ...data,

          password: hashedPassword,

          authProvider: AuthProvider.EMAIL,
        });

        await parentRepo.save(parent);

        // Create notification preferences

        const notifPrefRepo = AppDataSource.getRepository(
          NotificationPreference
        );

        const notifPref = notifPrefRepo.create({ parentId: parent.id });

        await notifPrefRepo.save(notifPref);
      }

      parents.push(parent);
    }

    console.log(
      `✅ Created ${parents.length} parents (password: ${SEED_PASSWORD})`
    );

    // Step 6: Create Students

    console.log("\n👶 Creating students...");

    const studentRepo = AppDataSource.getRepository(Student);

    const firstNames = [
      "Emma",
      "Liam",
      "Olivia",
      "Noah",
      "Ava",
      "Ethan",
      "Sophia",
      "Mason",
      "Isabella",
      "Lucas",
      "Mia",
      "Oliver",
      "Charlotte",
      "Elijah",
      "Amelia",
    ];

    const students: Student[] = [];

    for (let i = 0; i < 30; i++) {
      const parent = parents[i % parents.length];

      const classEntity = classes[i % classes.length];

      const firstName = firstNames[i % firstNames.length];

      const admissionNumber = `STU${2024}${String(i + 1).padStart(4, "0")}`;

      let student = await studentRepo.findOne({ where: { admissionNumber } });

      if (!student) {
        student = studentRepo.create({
          firstName,

          lastName: parent.lastName,

          dateOfBirth: new Date(2015 + (i % 5), i % 12, (i % 28) + 1),

          admissionNumber,

          gender: i % 2 === 0 ? "Male" : "Female",

          parentId: parent.id,

          classId: classEntity.id,
        });

        await studentRepo.save(student);
      }

      students.push(student);
    }

    console.log(`✅ Created ${students.length} students`);

    // Step 7: Create Attendance Records

    console.log("\n📅 Creating attendance records...");

    const attendanceRepo = AppDataSource.getRepository(Attendance);

    const startDate = new Date(2024, 0, 1); // Jan 1, 2024

    const endDate = new Date(); // Today

    const statuses = [
      AttendanceStatus.PRESENT,
      AttendanceStatus.ABSENT,
      AttendanceStatus.LATE,
      AttendanceStatus.EXCUSED,
    ];

    let attendanceCount = 0;

    for (const student of students.slice(0, 10)) {
      // First 10 students

      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        // Skip weekends

        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          const status =
            Math.random() > 0.15
              ? AttendanceStatus.PRESENT
              : randomElement(statuses);

          const attendance = attendanceRepo.create({
            studentId: student.id,

            date: new Date(currentDate),

            status,

            reason:
              status !== AttendanceStatus.PRESENT ? "Random reason" : null,
          });

          await attendanceRepo.save(attendance);

          attendanceCount++;
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    console.log(`✅ Created ${attendanceCount} attendance records`);

    // Step 8: Create Tests

    console.log("\n📝 Creating test records...");

    const testRepo = AppDataSource.getRepository(Test);

    let testCount = 0;

    for (const student of students.slice(0, 10)) {
      for (const subject of subjects) {
        for (let i = 0; i < 3; i++) {
          // 3 tests per subject

          const score = randomScore(50, 100);

          const maxScore = 100;

          const test = testRepo.create({
            title: `${subject.name} Test ${i + 1}`,

            testType: randomElement(["Quiz", "Mid-term", "Final"]),

            subjectId: subject.id,

            studentId: student.id,

            testDate: randomDate(new Date(2024, 0, 1), new Date()),

            score,

            maxScore,

            percentage: (score / maxScore) * 100,

            grade:
              score >= 90
                ? "A"
                : score >= 80
                ? "B"
                : score >= 70
                ? "C"
                : score >= 60
                ? "D"
                : "F",

            teacherComments: "Good effort!",
          });

          await testRepo.save(test);

          testCount++;
        }
      }
    }

    console.log(`✅ Created ${testCount} test records`);

    // Step 9: Create Assignments

    console.log("\n📚 Creating assignments...");

    const assignmentRepo = AppDataSource.getRepository(Assignment);

    let assignmentCount = 0;

    for (const student of students.slice(0, 10)) {
      for (const subject of subjects.slice(0, 3)) {
        for (let i = 0; i < 5; i++) {
          const status = randomElement([
            SubmissionStatus.SUBMITTED,
            SubmissionStatus.GRADED,
            SubmissionStatus.NOT_SUBMITTED,
          ]);

          const assignment = assignmentRepo.create({
            title: `${subject.name} Assignment ${i + 1}`,

            description: `Complete the exercises on page ${randomInt(10, 100)}`,

            subjectId: subject.id,

            studentId: student.id,

            dueDate: randomDate(
              new Date(),
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            ),

            submissionStatus: status,

            submittedAt:
              status !== SubmissionStatus.NOT_SUBMITTED
                ? randomDate(new Date(2024, 0, 1), new Date())
                : null,

            score:
              status === SubmissionStatus.GRADED ? randomScore(60, 100) : null,

            maxScore: status === SubmissionStatus.GRADED ? 100 : null,
          });

          await assignmentRepo.save(assignment);

          assignmentCount++;
        }
      }
    }

    console.log(`✅ Created ${assignmentCount} assignments`);

    // Step 10: Create Behavior Records

    console.log("\n⭐ Creating behavior records...");

    const behaviorRepo = AppDataSource.getRepository(Behavior);

    let behaviorCount = 0;

    for (const student of students.slice(0, 10)) {
      const teacher = randomElement(teachers);

      for (let i = 0; i < 5; i++) {
        const type = randomElement([
          BehaviorType.POSITIVE,
          BehaviorType.NEGATIVE,
          BehaviorType.NEUTRAL,
        ]);

        const behavior = behaviorRepo.create({
          studentId: student.id,

          teacherId: teacher.id,

          date: randomDate(new Date(2024, 0, 1), new Date()),

          type,

          title:
            type === BehaviorType.POSITIVE
              ? "Excellent Participation"
              : type === BehaviorType.NEGATIVE
              ? "Disruptive Behavior"
              : "General Note",

          description: "Behavior note description",

          points:
            type === BehaviorType.POSITIVE
              ? randomInt(1, 5)
              : type === BehaviorType.NEGATIVE
              ? -randomInt(1, 3)
              : 0,

          category: randomElement([
            "Discipline",
            "Participation",
            "Conduct",
            "Attendance",
          ]),

          isIncident: type === BehaviorType.NEGATIVE && Math.random() > 0.7,

          acknowledgedByParent: Math.random() > 0.5,
        });

        await behaviorRepo.save(behavior);

        behaviorCount++;
      }
    }

    console.log(`✅ Created ${behaviorCount} behavior records`);

    // Step 11: Create Feedback & Replies

    console.log("\n💬 Creating feedback records...");

    const feedbackRepo = AppDataSource.getRepository(Feedback);

    const feedbackReplyRepo = AppDataSource.getRepository(FeedbackReply);

    let feedbackCount = 0;

    for (const student of students.slice(0, 10)) {
      const teacher = randomElement(teachers);

      for (let i = 0; i < 3; i++) {
        const feedback = feedbackRepo.create({
          studentId: student.id,

          teacherId: teacher.id,

          title: "Weekly Progress Update",

          message: "Your child is showing good progress this week.",

          category: randomElement([
            FeedbackCategory.ACADEMIC,
            FeedbackCategory.BEHAVIOR,
            FeedbackCategory.PARTICIPATION,
          ]),

          isRead: Math.random() > 0.5,
        });

        await feedbackRepo.save(feedback);

        // Add reply

        if (Math.random() > 0.5) {
          const reply = feedbackReplyRepo.create({
            feedbackId: feedback.id,

            senderType: ReplySender.PARENT,

            parentId: student.parentId,

            message: "Thank you for the update!",
          });

          await feedbackReplyRepo.save(reply);
        }

        feedbackCount++;
      }
    }

    console.log(`✅ Created ${feedbackCount} feedback records`);

    // Step 12: Create Messages

    console.log("\n✉️ Creating messages...");

    const messageRepo = AppDataSource.getRepository(Message);

    let messageCount = 0;

    for (const parent of parents.slice(0, 5)) {
      const teacher = randomElement(teachers);

      for (let i = 0; i < 3; i++) {
        const message = messageRepo.create({
          parentId: parent.id,

          teacherId: teacher.id,

          senderType:
            i % 2 === 0 ? MessageSender.PARENT : MessageSender.TEACHER,

          subject: "Question about homework",

          content: "I have a question regarding the recent assignment.",

          isRead: Math.random() > 0.3,
        });

        await messageRepo.save(message);

        messageCount++;
      }
    }

    console.log(`✅ Created ${messageCount} messages`);

    // Step 13: Create Term Reports

    console.log("\n📊 Creating term reports...");

    const reportRepo = AppDataSource.getRepository(TermReport);

    let reportCount = 0;

    for (const student of students.slice(0, 10)) {
      for (let term = 1; term <= 3; term++) {
        const report = reportRepo.create({
          studentId: student.id,

          term: `Term ${term}`,

          academicYear: 2024,

          reportFileUrl: `/reports/student_${student.id}_term${term}_2024.pdf`,

          overallScore: randomScore(65, 95),

          overallPercentage: randomScore(65, 95),

          overallGrade: randomElement(["A", "B", "C"]),

          classRank: randomInt(1, 30),

          totalStudents: 30,

          principalComments: "Good overall performance.",

          teacherComments: "Keep up the good work!",

          reportDate: new Date(2024, term * 3, 15),
        });

        await reportRepo.save(report);

        reportCount++;
      }
    }

    console.log(`✅ Created ${reportCount} term reports`);

    // Step 14: Create Notifications

    console.log("\n🔔 Creating notifications...");

    const notificationRepo = AppDataSource.getRepository(Notification);

    let notificationCount = 0;

    for (const parent of parents.slice(0, 5)) {
      const types = [
        NotificationType.FEEDBACK,
        NotificationType.TEST_SCORE,
        NotificationType.ATTENDANCE,
        NotificationType.MESSAGE,
      ];

      for (const type of types) {
        const notification = notificationRepo.create({
          parentId: parent.id,

          type,

          title: `New ${type.replace("_", " ")}`,

          message: "You have a new notification.",

          isRead: Math.random() > 0.6,
        });

        await notificationRepo.save(notification);

        notificationCount++;
      }
    }

    console.log(`✅ Created ${notificationCount} notifications`);

    // Summary

    console.log("\n" + "=".repeat(60));

    console.log("🎉 SEEDING COMPLETED SUCCESSFULLY!\n");

    console.log("📊 Summary:");

    console.log(`   - Admin: 1`);

    console.log(`   - Classes: ${classes.length}`);

    console.log(`   - Subjects: ${subjects.length}`);

    console.log(`   - Teachers: ${teachers.length}`);

    console.log(`   - Parents: ${parents.length}`);

    console.log(`   - Students: ${students.length}`);

    console.log(`   - Attendance: ${attendanceCount} records`);

    console.log(`   - Tests: ${testCount} records`);

    console.log(`   - Assignments: ${assignmentCount} records`);

    console.log(`   - Behavior: ${behaviorCount} records`);

    console.log(`   - Feedback: ${feedbackCount} records`);

    console.log(`   - Messages: ${messageCount} records`);

    console.log(`   - Reports: ${reportCount} records`);

    console.log(`   - Notifications: ${notificationCount} records`);

    console.log("\n📧 Login Credentials:");

    console.log(`   - Admin: admin@kidsany.com / ${SEED_PASSWORD}`);

    console.log(`   - Parent: robert.anderson@example.com / ${SEED_PASSWORD}`);

    console.log(`   - Teacher: john.smith@kidsany.com / ${SEED_PASSWORD}`);

    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("❌ Seeding failed:", error);

    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

// Run seeding

seed()
  .then(() => process.exit(0))

  .catch((error) => {
    console.error("Fatal error:", error);

    process.exit(1);
  });
