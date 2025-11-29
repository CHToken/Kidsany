# Kidsany Parent Dashboard API Documentation

Complete API documentation for the Kidsany Parent Dashboard backend.

## 📚 Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)
- [Documentation Formats](#documentation-formats)

## 🚀 Getting Started

### Base URL

**Development:** `http://localhost:5000/api`
**Production:** `https://api.kidsany.com/api`

### Health Check

```bash
GET /health
```

Returns server status and timestamp.

## 🔐 Authentication

Most endpoints require JWT authentication. There are two ways to provide the token:

### 1. Authorization Header (Recommended)
```bash
Authorization: Bearer <your_access_token>
```

### 2. HTTP-Only Cookie (Automatic)
Tokens are automatically stored in secure HTTP-only cookies after login.

### Authentication Flow

#### Email/Password Registration & Login

```bash
# Register
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}

# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

#### Phone/OTP Login

```bash
# Request OTP
POST /api/auth/request-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}

# Verify OTP
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

## 📋 API Endpoints Summary

### Authentication (7 endpoints)
- `POST /auth/register` - Register with email
- `POST /auth/login` - Login with email
- `POST /auth/request-otp` - Request OTP
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/logout` - Logout
- `POST /auth/request-password-reset` - Request password reset
- `POST /auth/reset-password` - Reset password

### Parent Profile (6 endpoints)
- `GET /parent/profile` - Get profile
- `PUT /parent/profile` - Update profile
- `POST /parent/profile/picture` - Upload picture
- `POST /parent/change-password` - Change password
- `GET /parent/notification-preferences` - Get preferences
- `PUT /parent/notification-preferences` - Update preferences

### Students (2 endpoints)
- `GET /students` - Get all students
- `GET /students/:studentId` - Get student details

### Dashboard (2 endpoints)
- `GET /dashboard/home/:studentId` - Full dashboard data
- `GET /dashboard/summary/:studentId` - Quick summary

### Attendance (3 endpoints)
- `GET /dashboard/attendance/:studentId` - Get records
- `GET /dashboard/attendance/:studentId/chart` - Chart data
- `GET /dashboard/attendance/:studentId/monthly` - Monthly summary

### Progress & Tests (4 endpoints)
- `GET /dashboard/progress/:studentId` - Academic progress
- `GET /dashboard/tests/:studentId` - All tests
- `GET /dashboard/test/:testId` - Test details
- `GET /dashboard/progress/:studentId/comparison` - Subject comparison

### Assignments (4 endpoints)
- `GET /dashboard/assignments/:studentId` - All assignments
- `GET /dashboard/assignment/:assignmentId` - Assignment details
- `GET /dashboard/assignments/:studentId/upcoming` - Upcoming
- `GET /dashboard/assignments/:studentId/overdue` - Overdue

### Behavior (4 endpoints)
- `GET /dashboard/behavior/:studentId` - Behavior records
- `PATCH /dashboard/behavior/:behaviorId/acknowledge` - Acknowledge
- `GET /dashboard/behavior/:studentId/summary` - Summary
- `GET /dashboard/behavior/:studentId/trends` - Trends

### Feedback (5 endpoints)
- `GET /dashboard/feedback/:studentId` - All feedback
- `GET /dashboard/feedback/:feedbackId` - Feedback details
- `POST /dashboard/feedback/:feedbackId/reply` - Reply
- `GET /dashboard/feedback/:feedbackId/replies` - Get replies
- `PATCH /dashboard/feedback/:feedbackId/read` - Mark as read

### Messages (5 endpoints)
- `GET /dashboard/messages` - All messages
- `GET /dashboard/messages/:teacherId` - Thread with teacher
- `POST /dashboard/messages` - Send message
- `PATCH /dashboard/messages/:messageId/read` - Mark as read
- `GET /dashboard/messages/unread/count` - Unread count

### Term Reports (4 endpoints)
- `GET /dashboard/reports/:studentId` - All reports
- `GET /dashboard/report/:reportId` - Report details
- `GET /dashboard/report/:reportId/download` - Download link
- `GET /dashboard/reports/:studentId/statistics` - Statistics

### Notifications (6 endpoints)
- `GET /dashboard/notifications` - All notifications
- `PATCH /dashboard/notifications/:notificationId/read` - Mark as read
- `POST /dashboard/notifications/mark-all-read` - Mark all as read
- `DELETE /dashboard/notifications/:notificationId` - Delete
- `GET /dashboard/notifications/unread/count` - Unread count
- `GET /dashboard/notifications/by-type` - Group by type

**Total: 60+ Endpoints**

## ⚠️ Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## 🚦 Rate Limiting

### Default Limits

- **General API**: 100 requests per 15 minutes
- **Auth Endpoints**: 5 requests per 15 minutes
- **OTP Requests**: 3 requests per 5 minutes
- **File Uploads**: 20 requests per hour

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

## 📄 Pagination

List endpoints support pagination using `limit` and `offset` query parameters:

```bash
GET /api/students?limit=20&offset=0
```

**Response includes pagination metadata:**

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 100,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

## 📖 Documentation Formats

### Postman Collection

Import `Kidsany_API.postman_collection.json` into Postman:

1. Open Postman
2. Click **Import**
3. Select the JSON file
4. Collection will be imported with all 60+ endpoints
5. Set environment variables (`baseUrl`, `accessToken`, `studentId`)

### Swagger/OpenAPI

View interactive API documentation:

1. Install Swagger UI or Swagger Editor
2. Load `openapi.yaml`
3. Interactive documentation with "Try it out" feature

**Online Swagger Editor:** https://editor.swagger.io/

## 🔒 Security Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** - Never commit tokens to version control
3. **Rotate JWT secrets regularly**
4. **Use environment variables** for sensitive configuration
5. **Implement request logging** for security monitoring
6. **Validate all inputs** on both client and server
7. **Use parameterized queries** to prevent SQL injection (already implemented)
8. **Implement CORS properly** for your frontend domain

## 🛠️ Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Login and save token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "SecurePass123!"}' \
  | jq -r '.data.accessToken')

# Get students (authenticated)
curl http://localhost:5000/api/students \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman

1. Import the Postman collection
2. Register or login using auth endpoints
3. The `accessToken` will be automatically saved
4. All subsequent requests will use the saved token

### Using HTTPie

```bash
# Install httpie
pip install httpie

# Login
http POST :5000/api/auth/login \
  email=john@example.com \
  password=SecurePass123!

# Get students
http :5000/api/students \
  Authorization:"Bearer YOUR_TOKEN_HERE"
```

## 📞 Support

For API support or questions:
- **Email**: support@kidsany.com
- **Documentation**: `/backend/docs/`
- **Issues**: Create an issue in the repository

## 🔄 Changelog

### Version 1.0.0 (Current)
- Initial release with 60+ endpoints
- Complete CRUD operations for all entities
- JWT authentication with refresh tokens
- Role-based access control
- Comprehensive filtering and pagination
- Real-time notification support
