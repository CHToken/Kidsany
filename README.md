# Kidsany Parent Dashboard

A comprehensive parent dashboard system for monitoring student progress, attendance, behavior, and communication with teachers.

## 🏗️ Architecture

- **Backend**: Node.js + Express + TypeScript + PostgreSQL + TypeORM
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Authentication**: JWT + Cookie-based sessions + OTP
- **Security**: Helmet, CORS, Rate Limiting, SQL Injection Prevention

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## 🚀 Getting Started

### 1. Database Setup

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE kidsany_db;

# Exit psql
\q
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file for development
cp .env.example .env.development

# Update .env.development with your database credentials
# See ENVIRONMENTS.md for detailed configuration guide

# Generate strong secrets (recommended)
openssl rand -base64 32  # Use for JWT_SECRET
openssl rand -base64 32  # Use for JWT_REFRESH_SECRET
openssl rand -base64 32  # Use for COOKIE_SECRET

# Start development server (TypeORM will auto-create tables)
npm run dev
```

The backend will start on `http://localhost:5000`

**📖 For detailed environment configuration, see [backend/ENVIRONMENTS.md](backend/ENVIRONMENTS.md)**

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔒 Security Features

### 1. **SQL Injection Prevention**
- TypeORM with parameterized queries
- Input sanitization middleware
- SQL pattern detection

### 2. **Authentication & Authorization**
- JWT-based authentication
- HTTP-only cookies for token storage
- Role-based access control (Parent, Teacher, Admin)
- OTP authentication for phone login

### 3. **Rate Limiting**
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 attempts per 15 minutes
- OTP requests: 3 per 5 minutes
- File uploads: 20 per hour

### 4. **Other Security Measures**
- Helmet.js for HTTP security headers
- CORS configuration
- Cookie security (httpOnly, secure, sameSite)
- Password hashing with bcrypt
- Input validation with express-validator

## 📁 Project Structure

```
kidsany-parent-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts          # TypeORM configuration
│   │   │   ├── environment.ts       # Environment validator
│   │   │   └── constants.ts         # Environment-specific constants
│   │   ├── entities/                # Database entities
│   │   │   ├── Parent.ts
│   │   │   ├── Student.ts
│   │   │   ├── Teacher.ts
│   │   │   ├── Admin.ts
│   │   │   ├── Class.ts
│   │   │   ├── Subject.ts
│   │   │   ├── Attendance.ts
│   │   │   ├── Assignment.ts
│   │   │   ├── Test.ts
│   │   │   ├── Behavior.ts
│   │   │   ├── Feedback.ts
│   │   │   ├── FeedbackReply.ts
│   │   │   ├── Message.ts
│   │   │   ├── TermReport.ts
│   │   │   ├── Notification.ts
│   │   │   └── NotificationPreference.ts
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── rateLimiter.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   ├── controllers/             # Route controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── parent.controller.ts
│   │   │   ├── student.controller.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   ├── attendance.controller.ts
│   │   │   ├── progress.controller.ts
│   │   │   ├── assignment.controller.ts
│   │   │   ├── behavior.controller.ts
│   │   │   ├── feedback.controller.ts
│   │   │   ├── message.controller.ts
│   │   │   ├── notification.controller.ts
│   │   │   ├── report.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── routes/                  # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── parent.routes.ts
│   │   │   ├── student.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   └── admin.routes.ts
│   │   ├── services/                # Business logic
│   │   ├── utils/                   # Utility functions
│   │   │   ├── jwt.utils.ts
│   │   │   ├── password.utils.ts
│   │   │   └── otp.utils.ts
│   │   └── server.ts                # Express app entry point
│   ├── docs/                        # API documentation
│   │   ├── API_README.md
│   │   ├── openapi.yaml             # Swagger/OpenAPI spec
│   │   └── Kidsany_API.postman_collection.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── ENVIRONMENTS.md              # Environment configuration guide
│   ├── .env.example                 # Environment template
│   ├── .env.development             # Development config (not in git)
│   ├── .env.staging                 # Staging config (not in git)
│   └── .env.production              # Production config (not in git)
│
└── frontend/
    ├── src/
    │   ├── components/              # React components
    │   ├── pages/                   # Page components
    │   ├── services/                # API services
    │   │   ├── api.ts
    │   │   └── auth.service.ts
    │   ├── hooks/                   # Custom React hooks
    │   ├── types/                   # TypeScript types
    │   ├── utils/                   # Utility functions
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── tailwind.config.js
```

## 🗄️ Database Schema

### Key Entities:

1. **Parent**: Parent user accounts
2. **Student**: Student profiles linked to parents
3. **Teacher**: Teacher accounts
4. **Admin**: Administrative accounts
5. **Class**: Class information
6. **Subject**: Subject/course information
7. **Attendance**: Daily attendance records
8. **Assignment**: Assignment tracking
9. **Test**: Test scores and results
10. **Behavior**: Behavior notes and incidents
11. **Feedback**: Teacher-to-parent feedback
12. **Message**: Direct messaging between parents and teachers
13. **TermReport**: Academic term reports
14. **Notification**: In-app notifications
15. **NotificationPreference**: User notification settings

## 🔐 Authentication Flow

### Email/Password Authentication:
1. Parent registers with email and password
2. Password is hashed with bcrypt
3. JWT tokens (access + refresh) are generated
4. Tokens are stored in HTTP-only cookies
5. Access token used for API requests

### Phone/OTP Authentication:
1. Parent requests OTP with phone number
2. 6-digit OTP is generated and sent via SMS
3. Parent verifies OTP
4. JWT tokens are generated upon successful verification

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register with email/password
- `POST /login` - Login with email/password
- `POST /request-otp` - Request OTP for phone login
- `POST /verify-otp` - Verify OTP and login
- `POST /logout` - Logout user
- `POST /request-password-reset` - Request password reset
- `POST /reset-password` - Reset password with token

### Parent (`/api/parent`)
- `GET /profile` - Get parent profile
- `PUT /profile` - Update parent profile
- `GET /notification-preferences` - Get notification preferences
- `PUT /notification-preferences` - Update notification preferences

### Students (`/api/students`)
- `GET /` - Get all students for parent
- `GET /:studentId` - Get specific student details

### Dashboard (`/api/dashboard`)
- `GET /home/:studentId` - Dashboard home data
- `GET /attendance/:studentId` - Attendance records
- `GET /progress/:studentId` - Progress and test scores
- `GET /assignments/:studentId` - Assignments
- `GET /behavior/:studentId` - Behavior records
- `GET /feedback/:studentId` - Feedback from teachers
- `POST /feedback/:feedbackId/reply` - Reply to feedback
- `GET /messages` - Direct messages
- `POST /messages` - Send message to teacher
- `GET /reports/:studentId` - Term reports
- `GET /notifications` - Get notifications
- `PATCH /notifications/:notificationId/read` - Mark as read

### Admin (`/api/admin`)
- `GET /profile` - Get admin profile
- `PUT /profile` - Update admin profile
- `PUT /change-password` - Change password
- `GET /settings` - Get all system settings
- `GET /settings/:category` - Get specific setting category
- `PUT /settings` - Update system settings
- `PUT /settings/value` - Update specific setting value
- `POST /settings/reset` - Reset settings to default
- `POST /maintenance/toggle` - Toggle maintenance mode
- `POST /features/:feature/toggle` - Toggle feature flag
- `GET /statistics` - Get system statistics
- `GET /settings/export` - Export settings as JSON
- `POST /settings/import` - Import settings from JSON

**📖 Full API documentation:** [backend/docs/API_README.md](backend/docs/API_README.md)

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with nodemon for hot reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Runs with Vite HMR
```

### Build for Production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 📝 Implementation Status

### ✅ Completed Backend Features:

1. **All Controllers Implemented** (13 controllers):
   - ✅ Authentication controller
   - ✅ Parent profile controller
   - ✅ Student controller
   - ✅ Dashboard data controller
   - ✅ Attendance controller
   - ✅ Progress/Tests controller
   - ✅ Assignment controller
   - ✅ Behavior controller
   - ✅ Feedback controller
   - ✅ Message controller
   - ✅ Notification controller
   - ✅ Report controller
   - ✅ Admin controller

2. **Multi-Environment Support**:
   - ✅ Development, Staging, Production environments
   - ✅ Type-safe configuration system
   - ✅ Environment-specific behaviors
   - ✅ Complete documentation (ENVIRONMENTS.md)

3. **API Documentation**:
   - ✅ Comprehensive API README
   - ✅ OpenAPI/Swagger specification
   - ✅ Postman collection (60+ endpoints)

### 🚧 Next Steps:

1. **Create frontend components**:
   - Login/Register pages
   - Dashboard home
   - Student cards
   - Attendance charts
   - Progress tracking
   - Assignment list
   - Behavior reports
   - Feedback system
   - Messaging interface
   - Notification center

3. **Add additional features**:
   - File upload for attachments
   - Email notifications (integrate SMTP)
   - SMS integration for OTP
   - PDF generation for reports
   - Data visualization with charts
   - Real-time updates with WebSockets

4. **Testing**:
   - Unit tests
   - Integration tests
   - E2E tests

5. **Deployment**:
   - Set up production database
   - Configure environment variables
   - Deploy backend (e.g., Railway, Heroku, AWS)
   - Deploy frontend (e.g., Vercel, Netlify)

## 🔧 Environment Configuration

### Multi-Environment Support

The backend supports **three distinct environments**:

1. **Development** (`.env.development`) - For local development
   - Auto-sync database (no migrations needed)
   - Detailed logging and debugging
   - Relaxed security for testing
   - OTP/tokens returned in API responses

2. **Staging** (`.env.staging`) - For pre-production testing
   - Production-like settings
   - Real email/SMS services
   - Migration-based database updates

3. **Production** (`.env.production`) - For live deployment
   - Maximum security settings
   - Strict rate limiting
   - No debug features
   - Strong secrets required

### Quick Start (Development)

```bash
# Copy example to development environment
cp backend/.env.example backend/.env.development

# Set environment variable
export NODE_ENV=development

# Start backend
cd backend && npm run dev
```

### Environment-Specific Features

| Feature | Development | Staging | Production |
|---------|-------------|---------|------------|
| Auto-sync DB | ✅ | ❌ | ❌ |
| Debug Logs | ✅ | ⚠️ | ❌ |
| Rate Limiting | Relaxed | Strict | Strict |
| Return OTP | ✅ | ❌ | ❌ |
| Stack Traces | ✅ | ✅ | ❌ |

**📖 Complete environment guide:** [backend/ENVIRONMENTS.md](backend/ENVIRONMENTS.md)

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📚 Technologies Used

### Backend
- **Express.js** - Web framework
- **TypeORM** - ORM for PostgreSQL
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting
- **Express Validator** - Input validation

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Axios** - HTTP client
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Recharts** - Data visualization

## 📄 License

MIT

## 👥 Contributing

Contributions are welcome! Please read the contributing guidelines first.

## 📧 Support

For support, email support@kidsany.com or create an issue in the repository.
