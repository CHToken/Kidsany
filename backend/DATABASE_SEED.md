# 🌱 Database Seeding Guide

Comprehensive guide for populating your database with realistic test data.

---

## 🎯 Overview

The seeding script creates a complete, realistic dataset for development and testing:

- **1 Admin** account

- **5 Classes** (Grade 1A, 1B, 2A, 3A, 4A)

- **7 Subjects** (Math, English, Science, etc.)

- **5 Teachers** (assigned to classes)

- **10 Parents** (with notification preferences)

- **30 Students** (distributed across classes)

- **1000+ Attendance** records (with realistic patterns)

- **600+ Test** records (across all subjects)

- **450+ Assignments** (various statuses)

- **150+ Behavior** records (positive/negative/neutral)

- **90+ Feedback** messages (with some replies)

- **45+ Direct** messages (parent-teacher)

- **90+ Term** reports

- **60+ Notifications**

**Total:** 2,500+ database records with realistic relationships

---

## 🚀 Quick Start

### Step 1: Enable Seeding

Edit `backend/.env.development`:

```bash

# Database Seeding

ENABLE_SEEDING=true

SEED_PASSWORD=Test1234!

```

### Step 2: Run Seeding

```bash

cd backend

npm run seed

```

### Step 3: Login and Test

Use these credentials:

**Admin:**

- Email: `admin@kidsany.com`

- Password: `Test1234!`

**Parent (10 accounts):**

- Email: `robert.anderson@example.com` (or jennifer.taylor, william.thomas, etc.)

- Password: `Test1234!`

**Teacher (5 accounts):**

- Email: `john.smith@kidsany.com` (or mary.johnson, etc.)

- Password: `Test1234!`

---

## 📋 Configuration

### Environment Variables

```bash

# .env.development

ENABLE_SEEDING=true           # Enable/disable seeding

SEED_PASSWORD=Test1234!       # Password for all seeded accounts

```

### Safety Features

✅ **Idempotent** - Safe to run multiple times (won't create duplicates)

✅ **Environment-aware** - Only works when `ENABLE_SEEDING=true`

✅ **Production-safe** - Will not run if `ENABLE_SEEDING=false`

---

## 🎛️ Commands

### Seed Database

```bash

npm run seed

```

**What it does:**

- Checks if seeding is enabled

- Connects to database

- Creates all test data

- Shows progress for each step

- Prints login credentials

**Output:**

```

🌱 Starting database seeding...



✅ Database connected



👤 Creating admin account...

✅ Admin created: admin@kidsany.com / Test1234!



📚 Creating classes...

✅ Created 5 classes



📖 Creating subjects...

✅ Created 7 subjects



...



🎉 SEEDING COMPLETED SUCCESSFULLY!



📊 Summary:

   - Admin: 1

   - Classes: 5

   - Subjects: 7

   - Teachers: 5

   - Parents: 10

   - Students: 30

   - Attendance: 1000+ records

   ...



📧 Login Credentials:

   - Admin: admin@kidsany.com / Test1234!

   - Parent: robert.anderson@example.com / Test1234!

   - Teacher: john.smith@kidsany.com / Test1234!

```

### Clear Seeded Data

```bash

npm run seed:clear

```

**⚠️ WARNING:** This deletes ALL data from the database!

**What it does:**

- Connects to database

- Deletes all records from all tables

- Maintains table structure (doesn't drop tables)

**Use when:**

- You want to start fresh

- Testing migration scripts

- Cleaning up before production deployment

---

## 📊 Seeded Data Details

### Classes (5)

| Name | Grade | Capacity | Teacher |

|------|-------|----------|---------|

| Grade 1A | Grade 1 | 30 | John Smith |

| Grade 1B | Grade 1 | 30 | Mary Johnson |

| Grade 2A | Grade 2 | 28 | David Williams |

| Grade 3A | Grade 3 | 25 | Sarah Brown |

| Grade 4A | Grade 4 | 25 | Michael Davis |

### Subjects (7)

- Mathematics

- English

- Science

- History

- Geography

- Art

- Physical Education

### Parents (10)

| Name | Email | Phone |

|------|-------|-------|

| Robert Anderson | robert.anderson@example.com | +1234567901 |

| Jennifer Taylor | jennifer.taylor@example.com | +1234567902 |

| William Thomas | william.thomas@example.com | +1234567903 |

| Linda Moore | linda.moore@example.com | +1234567904 |

| Richard Martin | richard.martin@example.com | +1234567905 |

| Barbara Jackson | barbara.jackson@example.com | +1234567906 |

| Joseph White | joseph.white@example.com | +1234567907 |

| Susan Harris | susan.harris@example.com | +1234567908 |

| Thomas Clark | thomas.clark@example.com | +1234567909 |

| Jessica Lewis | jessica.lewis@example.com | +1234567910 |

**All passwords:** `Test1234!`

### Students (30)

- Names: Emma, Liam, Olivia, Noah, Ava, Ethan, Sophia, Mason, Isabella, Lucas, Mia, Oliver, Charlotte, Elijah, Amelia (repeating)

- Admission Numbers: `STU20240001` through `STU20240030`

- Ages: 7-12 years (realistic for grades 1-4)

- Distributed across 5 classes

- Each has a parent assigned

### Attendance Records (1000+)

**For first 10 students:**

- Every weekday from Jan 1, 2024 to today

- 85% present (realistic)

- 10% absent

- 3% late

- 2% excused

- Includes absence reasons

**Pattern:** Realistic school attendance with occasional absences

### Test Records (600+)

**For first 10 students:**

- 3 tests per subject (Quiz, Mid-term, Final)

- Scores: 50-100 (realistic distribution)

- Grades: A, B, C, D, F based on score

- Teacher comments included

- Percentage calculated automatically

**Subjects covered:** All 7 subjects

### Assignments (450+)

**For first 10 students:**

- 5 assignments per subject (for 3 subjects each)

- Statuses:

  - Submitted

  - Graded (with scores)

  - Not Submitted

  - Late

- Due dates: Past and future

- Includes descriptions and comments

### Behavior Records (150+)

**For first 10 students:**

- 5 behavior notes each

- Types:

  - 40% Positive (excellent participation, good conduct)

  - 30% Negative (disruptive, late)

  - 30% Neutral (general notes)

- Categories: Discipline, Participation, Conduct, Attendance

- Points for rewards system

- Some marked as incidents

- Some acknowledged by parents

### Feedback Messages (90+)

**For first 10 students:**

- 3 feedback messages each from teachers

- Categories:

  - Academic

  - Behavior

  - Participation

  - General

- Some with parent replies

- Read/unread status varies

### Direct Messages (45+)

**For first 5 parents:**

- 3 message threads each with random teacher

- Mix of parent-sent and teacher-sent

- Subjects: Homework questions, behavior queries, etc.

- Some marked as read

### Term Reports (90+)

**For first 10 students:**

- 3 term reports each (Term 1, 2, 3 for 2024)

- Overall scores, percentages, grades

- Class rank and position

- Principal and teacher comments

- PDF file URLs (placeholder)

### Notifications (60+)

**For first 5 parents:**

- 4 notifications each per type:

  - Feedback

  - Test Score

  - Attendance

  - Message

- Mix of read and unread

- Realistic timestamps

---

## 🔄 Re-running Seeds

### Safe to Run Multiple Times

The seed script is **idempotent**:

```typescript
// Checks if data exists before creating

let admin = await adminRepo.findOne({ where: { email: "admin@kidsany.com" } });

if (!admin) {
  admin = adminRepo.create({
    /* ... */
  });

  await adminRepo.save(admin);
}
```

**Result:** Running multiple times won't create duplicates

### When to Re-run

✅ **Safe scenarios:**

- After `npm run seed:clear`

- After database reset

- When testing with fresh data

⚠️ **Caution:**

- Will create additional students if run without clearing

- Attendance dates will extend (older + new data)

**Best practice:** Clear first, then seed

```bash

npm run seed:clear && npm run seed

```

---

## 🎨 Customizing Seed Data

### Change Default Password

Edit `.env.development`:

```bash

SEED_PASSWORD=YourCustomPassword123!

```

### Modify Data Quantity

Edit `src/scripts/seed.ts`:

```typescript
// Create more students

for (let i = 0; i < 100; i++) {
  // Change from 30 to 100
  // ...
}

// Create more attendance records

for (const student of students.slice(0, 50)) {
  // Change from 10 to 50
  // ...
}
```

### Add Custom Data

```typescript
// Add your own school's classes

const classData = [
  {
    name: "Your Class Name",
    grade: "Grade X",
    academicYear: 2024,
    capacity: 30,
  },

  // ...
];

// Add specific students

const customStudents = [{ firstName: "Custom", lastName: "Student" /* ... */ }];
```

---

## 🔍 Verifying Seeded Data

### Check Database Directly

```bash

psql -U postgres -d kidsany_dev_db

```

```sql

-- Count records

SELECT 'parents' as table_name, COUNT(*) FROM parents

UNION ALL

SELECT 'students', COUNT(*) FROM students

UNION ALL

SELECT 'attendance', COUNT(*) FROM attendances

UNION ALL

SELECT 'tests', COUNT(*) FROM tests;



-- View sample data

SELECT * FROM parents LIMIT 5;

SELECT * FROM students LIMIT 10;

```

### Test API Endpoints

```bash

# Login as parent

curl -X POST http://localhost:5000/api/auth/login \

  -H "Content-Type: application/json" \

  -d '{"email":"robert.anderson@example.com","password":"Test1234!"}'



# Get students

curl http://localhost:5000/api/students \

  -H "Cookie: accessToken=YOUR_TOKEN"



# Get attendance

curl http://localhost:5000/api/dashboard/attendance/:studentId \

  -H "Cookie: accessToken=YOUR_TOKEN"

```

### Use Postman Collection

Import `backend/docs/Kidsany_API.postman_collection.json`:

1. Login with seeded credentials

2. Token auto-saved

3. Test all endpoints

---

## 🚨 Troubleshooting

### Error: "Seeding is disabled"

**Solution:**

```bash

# Set in .env.development

ENABLE_SEEDING=true

```

### Error: "Database connection failed"

**Solution:**

```bash

# Verify PostgreSQL is running

psql -U postgres -l



# Check .env.development database credentials

DB_HOST=localhost

DB_PORT=5432

DB_USERNAME=postgres

DB_PASSWORD=your_password

DB_DATABASE=kidsany_dev_db

```

### Error: "Duplicate key violation"

**Cause:** Data already exists

**Solution:**

```bash

# Clear first, then seed

npm run seed:clear

npm run seed

```

### Error: "Foreign key constraint violation"

**Cause:** Database tables out of sync

**Solution:**

```bash

# In development, auto-sync should handle this

# If not, clear and let TypeORM recreate tables

npm run seed:clear

# Restart dev server (TypeORM will sync)

npm run dev

# Then seed

npm run seed

```

---

## 🔐 Security Notes

### Development Only

⚠️ **NEVER enable seeding in production!**

```bash

# .env.production

ENABLE_SEEDING=false  # MUST BE FALSE!

```

### Default Passwords

All seeded accounts use `SEED_PASSWORD`:

- ⚠️ Change this before any public demo

- ⚠️ Never commit real passwords to git

- ✅ Use strong passwords for actual user accounts

### Sensitive Data

The seed script creates:

- ✅ Realistic but fake names

- ✅ Example email addresses

- ✅ Test phone numbers

- ✅ Random data patterns

**No real personal data is used**

---

## 📝 Production Checklist

Before deploying to production:

- [ ] Set `ENABLE_SEEDING=false` in production .env

- [ ] Remove or disable seed scripts in production build

- [ ] Clear all test data from database

- [ ] Import real data (if migrating)

- [ ] Create proper admin accounts with strong passwords

- [ ] Set up proper backup strategy

- [ ] Verify no test credentials remain

---

## 🎓 Best Practices

### For Development

✅ **DO:**

- Seed database at project start

- Re-seed after major schema changes

- Use seeded data for frontend development

- Test API endpoints with seeded data

- Clear before important demos

❌ **DON'T:**

- Seed in production

- Commit .env with ENABLE_SEEDING=true

- Use weak passwords in staging

- Mix real data with seeded data

### For Testing

✅ **DO:**

- Seed before running integration tests

- Clear between test suites

- Use consistent seed data for reproducible tests

- Document any test-specific seed requirements

---

## 🔗 Related Documentation

- **API Documentation:** `backend/docs/API_README.md`

- **Environment Setup:** `backend/ENVIRONMENTS.md`

- **Database Performance:** `backend/DATABASE_PERFORMANCE.md`

---

## 📊 Summary

```

┌─────────────────────────────────────────┐

│  Database Seeding - Quick Reference     │

├─────────────────────────────────────────┤

│  Enable: ENABLE_SEEDING=true           │

│  Seed:   npm run seed                   │

│  Clear:  npm run seed:clear            │

│                                         │

│  Login:  admin@kidsany.com             │

│          robert.anderson@example.com   │

│  Pass:   Test1234!                     │

└─────────────────────────────────────────┘

```

**Happy seeding! 🌱**
