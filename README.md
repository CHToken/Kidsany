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

# Create .env file from example
cp .env.example .env

# Update .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=your_password
# DB_DATABASE=kidsany_db
# JWT_SECRET=your_secret_key (generate with: openssl rand -base64 32)

# Run database migrations (TypeORM will auto-create tables in development)
npm run dev
```

The backend will start on `http://localhost:5000`

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
│   │   │   └── database.ts          # TypeORM configuration
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
│   │   │   └── auth.controller.ts
│   │   ├── routes/                  # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── parent.routes.ts
│   │   │   ├── student.routes.ts
│   │   │   └── dashboard.routes.ts
│   │   ├── services/                # Business logic
│   │   ├── utils/                   # Utility functions
│   │   │   ├── jwt.utils.ts
│   │   │   ├── password.utils.ts
│   │   │   └── otp.utils.ts
│   │   └── server.ts                # Express app entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
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

## 📝 Next Steps

### To complete the implementation:

1. **Implement remaining controllers**:
   - Parent profile controller
   - Student controller
   - Dashboard data controller
   - Feedback controller
   - Message controller
   - Notification controller

2. **Create frontend components**:
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

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=kidsany_db
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d
COOKIE_SECRET=your_cookie_secret
FRONTEND_URL=http://localhost:5173
```

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
