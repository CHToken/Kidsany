# 🏛️ System Architecture & Data Flow

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Frontend (Port 5173)                   │  │
│  │  ┌────────────┐  ┌──────────┐  ┌──────────────────────┐ │  │
│  │  │   Pages    │  │  Stores  │  │     Components       │ │  │
│  │  │ - Login    │  │ - Auth   │  │  - Dashboard         │ │  │
│  │  │ - Dashboard│  │ - Student│  │  - Charts            │ │  │
│  │  │ - Profile  │  │ - UI     │  │  - Forms             │ │  │
│  │  └────────────┘  └──────────┘  └──────────────────────┘ │  │
│  │                                                            │  │
│  │  ┌───────────────────────────────────────────────────┐   │  │
│  │  │          Services (API Communication)             │   │  │
│  │  │  - AuthService  - DashboardService                │   │  │
│  │  │  - StudentService  - NotificationService          │   │  │
│  │  └───────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTPS (Axios)
                                 │ with JWT Tokens
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Express API (Port 5000)                      │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         Security Middleware Stack                   │  │  │
│  │  │  1. Helmet (Security Headers)                       │  │  │
│  │  │  2. CORS (Cross-Origin)                             │  │  │
│  │  │  3. Rate Limiter (DDoS Protection)                  │  │  │
│  │  │  4. Input Sanitization                              │  │  │
│  │  │  5. SQL Injection Detection                         │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                          ↓                                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │              Route Layer                            │  │  │
│  │  │  /api/auth          - Authentication                │  │  │
│  │  │  /api/parent        - Parent profile                │  │  │
│  │  │  /api/students      - Student data                  │  │  │
│  │  │  /api/dashboard     - Dashboard data                │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                          ↓                                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         Authentication Middleware                   │  │  │
│  │  │  - Verify JWT Token                                 │  │  │
│  │  │  - Check Authorization                              │  │  │
│  │  │  - Rate Limiting                                    │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                          ↓                                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │            Controller Layer                         │  │  │
│  │  │  - AuthController                                   │  │  │
│  │  │  - DashboardController                              │  │  │
│  │  │  - StudentController                                │  │  │
│  │  │  - FeedbackController                               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ↓ TypeORM
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                          │  │
│  │                                                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │   Parents   │  │  Students   │  │  Teachers   │      │  │
│  │  │             │  │             │  │             │      │  │
│  │  │ - id        │  │ - id        │  │ - id        │      │  │
│  │  │ - email     │  │ - parentId  │  │ - email     │      │  │
│  │  │ - password  │  │ - classId   │  │ - password  │      │  │
│  │  └──────┬──────┘  └──────┬──────┘  └─────────────┘      │  │
│  │         │                │                                 │  │
│  │         │ 1:M            │ M:1                            │  │
│  │         └────────┬───────┘                                │  │
│  │                  │                                         │  │
│  │  ┌───────────────┴──────────────────────────────────┐    │  │
│  │  │            Related Tables                         │    │  │
│  │  │  - Attendance      - Assignments                  │    │  │
│  │  │  - Tests           - Behavior                     │    │  │
│  │  │  - Feedback        - Messages                     │    │  │
│  │  │  - TermReports     - Notifications                │    │  │
│  │  └──────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow: Parent Login

```
1. User enters email/password
   │
   ↓
2. Frontend validates input
   │
   ↓
3. POST /api/auth/login
   │
   ↓
4. Rate limiter checks (5 req/15min)
   │
   ↓
5. Input sanitization
   │
   ↓
6. SQL injection detection
   │
   ↓
7. AuthController.loginWithEmail()
   │
   ├─→ Find parent by email
   ├─→ Compare password (bcrypt)
   ├─→ Generate JWT tokens
   ├─→ Set HTTP-only cookies
   └─→ Return user data + token
   │
   ↓
8. Frontend stores token
   │
   ↓
9. Redirect to dashboard
```

## 🔄 Data Flow: Viewing Student Attendance

```
1. Parent clicks "Attendance" tab
   │
   ↓
2. GET /api/dashboard/attendance/:studentId
   │
   ↓
3. Authentication middleware
   ├─→ Extract JWT from cookie/header
   ├─→ Verify token signature
   ├─→ Decode user info
   └─→ Attach to req.user
   │
   ↓
4. Authorization check
   ├─→ Verify user role = 'parent'
   └─→ Continue if authorized
   │
   ↓
5. DashboardController.getAttendance()
   ├─→ Verify student belongs to parent
   ├─→ Query attendance records
   ├─→ Calculate statistics
   └─→ Format response
   │
   ↓
6. TypeORM executes SQL
   ├─→ Parameterized query (safe)
   ├─→ Join related tables
   └─→ Return results
   │
   ↓
7. Response sent to frontend
   │
   ↓
8. Frontend displays data
   ├─→ Attendance calendar
   ├─→ Statistics cards
   └─→ Charts
```

## 🗄️ Database Relationships

```
Parent ────────┐
    │          │
    │ 1:M      │
    │          │
    ↓          │
Student        │
    │          │
    ├──────────┘ (Self-reference: parent_id)
    │
    ├─→ Attendance (1:M)
    ├─→ Assignment (1:M)
    ├─→ Test (1:M)
    ├─→ Behavior (1:M)
    ├─→ Feedback (1:M)
    └─→ TermReport (1:M)

Teacher
    │
    ├─→ Class (1:M)
    ├─→ Subject (M:M)
    ├─→ Feedback (1:M)
    └─→ Message (1:M)

Class
    │
    └─→ Student (1:M)

Subject
    │
    └─→ Teacher (M:M)
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────┐
│           Layer 1: Network Security             │
│  - HTTPS only                                   │
│  - CORS restrictions                            │
│  - Helmet headers                               │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│       Layer 2: Request Filtering                │
│  - Rate limiting (100 req/15min)                │
│  - Input sanitization                           │
│  - SQL injection detection                      │
│  - XSS prevention                               │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│      Layer 3: Authentication                    │
│  - JWT token verification                       │
│  - Token expiration check                       │
│  - Refresh token rotation                       │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│      Layer 4: Authorization                     │
│  - Role-based access control                    │
│  - Resource ownership verification              │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│        Layer 5: Data Security                   │
│  - Parameterized queries (TypeORM)              │
│  - Password hashing (bcrypt)                    │
│  - Encrypted cookies                            │
└─────────────────────────────────────────────────┘
```

## 🔄 Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. Login (email/password)
       ↓
┌─────────────────────┐
│   Auth Controller   │
│  1. Find user       │
│  2. Verify password │ ←─ bcrypt.compare()
│  3. Generate tokens │ ←─ jwt.sign()
└──────┬──────────────┘
       │ 4. Return tokens
       ↓
┌─────────────┐
│   Client    │
│  Stores:    │
│  - Access   │ ←─ In memory / localStorage
│  - Refresh  │ ←─ HTTP-only cookie
└──────┬──────┘
       │ 5. API requests with token
       ↓
┌─────────────────────┐
│ Auth Middleware     │
│  1. Extract token   │
│  2. Verify          │ ←─ jwt.verify()
│  3. Decode payload  │
│  4. Attach to req   │
└──────┬──────────────┘
       │ 6. Process request
       ↓
┌─────────────┐
│ Controller  │
└─────────────┘
```

## 📊 Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐
│   Parent    │         │   Teacher    │
│             │         │              │
│ - id        │         │ - id         │
│ - email     │         │ - email      │
│ - password  │         │ - password   │
└──────┬──────┘         └──────┬───────┘
       │ 1                     │ 1
       │                       │
       │ M                     │ M
┌──────┴──────┐         ┌──────┴───────┐
│   Student   │    M:1  │    Class     │
│             ├─────────┤              │
│ - id        │         │ - id         │
│ - parentId  │         │ - teacherId  │
│ - classId   │         │ - name       │
└──────┬──────┘         └──────────────┘
       │
       │ 1
       │
       │ M
       ├──────────────┐
       │              │
       ↓              ↓
┌────────────┐  ┌────────────┐
│ Attendance │  │ Assignment │
│            │  │            │
│ - id       │  │ - id       │
│ - studentId│  │ - studentId│
│ - date     │  │ - title    │
│ - status   │  │ - dueDate  │
└────────────┘  └────────────┘
       │              │
       │              │
       ↓              ↓
  (Similar pattern for Test, Behavior,
   Feedback, TermReport, etc.)
```

## 🔄 Real-time Update Flow (Future)

```
┌─────────────┐
│   Teacher   │
│  Dashboard  │
└──────┬──────┘
       │ 1. Posts feedback
       ↓
┌─────────────────────┐
│   Backend API       │
│  1. Save to DB      │
│  2. Create notif    │
│  3. Emit event      │ ←─ WebSocket
└──────┬──────────────┘
       │ 4. Real-time push
       ↓
┌─────────────────────┐
│   Parent Client     │
│  1. Receive event   │
│  2. Update UI       │
│  3. Show toast      │
└─────────────────────┘
```

## 📱 Mobile-First Responsive Design

```
Mobile (< 768px)         Tablet (768-1024px)      Desktop (> 1024px)
┌────────────────┐       ┌──────────────────┐     ┌──────────────────────┐
│  ☰ Menu        │       │  ☰ Menu          │     │  Sidebar │  Main     │
│                │       │ ┌──────────────┐ │     │  - Home  │           │
│  [Student]     │       │ │  [Student]   │ │     │  - Attend│  Dashboard│
│                │       │ └──────────────┘ │     │  - Tests │  Content  │
│  Dashboard     │       │                  │     │  - Assign│           │
│  Content       │       │  Dashboard       │     │          │           │
│                │       │  Content         │     └──────────────────────┘
│                │       │                  │
│                │       │                  │
│ ───────────── │       └──────────────────┘
│ ⌂ 📊 📧 👤   │       Bottom Nav
└────────────────┘
Bottom Nav
```

## 🎨 Component Hierarchy (Frontend)

```
App
└─ Router
   ├─ PublicRoutes
   │  ├─ LoginPage
   │  ├─ RegisterPage
   │  └─ ForgotPasswordPage
   │
   └─ PrivateRoutes
      └─ DashboardLayout
         ├─ Sidebar
         ├─ Header
         │  ├─ NotificationBell
         │  └─ UserMenu
         │
         └─ Outlet
            ├─ DashboardHome
            │  ├─ StudentSwitcher
            │  ├─ SummaryCards
            │  └─ RecentActivity
            │
            ├─ AttendancePage
            │  ├─ AttendanceCalendar
            │  ├─ StatisticsCards
            │  └─ AttendanceList
            │
            ├─ ProgressPage
            │  ├─ SubjectCards
            │  ├─ ProgressCharts
            │  └─ TestScores
            │
            └─ [Other Pages...]
```

## 💾 State Management (Zustand)

```
Store Structure:

authStore
  ├─ user
  ├─ isAuthenticated
  ├─ login()
  └─ logout()

studentStore
  ├─ students[]
  ├─ currentStudent
  ├─ fetchStudents()
  └─ setCurrentStudent()

dashboardStore
  ├─ attendances[]
  ├─ assignments[]
  ├─ tests[]
  ├─ feedbacks[]
  └─ notifications[]

uiStore
  ├─ sidebarOpen
  ├─ theme
  └─ toggleSidebar()
```

## 🔄 API Request Lifecycle

```
1. Component calls service method
   dashboardService.getAttendance(studentId)
   │
   ↓
2. Service method uses axios
   api.get('/dashboard/attendance/:studentId')
   │
   ↓
3. Axios interceptor adds JWT token
   headers: { Authorization: 'Bearer <token>' }
   │
   ↓
4. Request sent to backend
   │
   ↓
5. Backend middleware chain
   Security → Auth → Validation → Controller
   │
   ↓
6. Controller processes request
   │
   ↓
7. TypeORM queries database
   │
   ↓
8. Response sent to frontend
   │
   ↓
9. Axios interceptor handles response
   - Success: return data
   - Error 401: refresh token → retry
   - Other error: throw
   │
   ↓
10. Service method returns data
    │
    ↓
11. Component updates state
    │
    ↓
12. React re-renders UI
```

---

## 📚 Key Takeaways

1. **Layered Architecture**: Clean separation of concerns
2. **Security First**: Multiple layers of protection
3. **Type Safety**: TypeScript throughout
4. **Scalable**: Easy to add new features
5. **Maintainable**: Clear structure and patterns
6. **Modern**: Latest best practices
7. **Production-Ready**: Built for real-world use

**This architecture supports:**
- Thousands of users
- Millions of records
- Real-time updates
- Mobile responsiveness
- High security
- Easy maintenance
