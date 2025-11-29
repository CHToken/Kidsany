# 🚀 Quick Start Guide - Kidsany Parent Dashboard

Get up and running in 5 minutes!

## ⚡ Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Terminal/Command Prompt

## 📦 Installation

### 1. Database Setup (2 minutes)

```bash
# Start PostgreSQL and create database
psql -U postgres
CREATE DATABASE kidsany_db;
\q
```

### 2. Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# Minimum required:
# DB_USERNAME=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=$(openssl rand -base64 32)

# Start backend (will auto-create tables)
npm run dev
```

✅ Backend running at `http://localhost:5000`

### 3. Frontend Setup (1 minute)

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

✅ Frontend running at `http://localhost:5173`

## 🧪 Test the Setup

### 1. Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Register a Parent
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

## 📚 What's Included

### ✅ Backend Features
- Parent authentication (email/password + phone/OTP)
- JWT-based authorization
- Password hashing with bcrypt
- SQL injection prevention
- Rate limiting
- Input validation
- Error handling
- Database entities for all features

### ✅ Frontend Setup
- React + TypeScript
- Vite for fast development
- Tailwind CSS
- Axios with interceptors
- Authentication service
- API configuration

### ✅ Security
- Helmet security headers
- CORS configuration
- HTTP-only cookies
- Rate limiting (100 req/15min general, 5 req/15min auth)
- SQL injection detection
- Input sanitization

## 🎯 Next Steps

### 1. Create Sample Data

You can use a database client or create a seed script to add:
- Teachers
- Classes
- Students (linked to parents)
- Subjects

### 2. Implement Remaining Controllers

Check `backend/src/controllers/` and implement:
- Student controller
- Dashboard controller
- Feedback controller
- Message controller

### 3. Build Frontend Components

Check `frontend/src/` and create:
- Login/Register pages
- Dashboard layout
- Student cards
- Attendance viewer
- Progress charts

### 4. Add Features

- File upload for term reports
- Email notifications
- SMS for OTP
- Real-time updates
- Data visualizations

## 📖 Documentation

- **Full README**: See `README.md` for complete documentation
- **Deployment Guide**: See `DEPLOYMENT.md` for production deployment
- **API Endpoints**: Documented in README.md

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Backend (5000)
lsof -ti:5000 | xargs kill -9

# Frontend (5173)
lsof -ti:5173 | xargs kill -9
```

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Verify credentials in .env match your PostgreSQL setup
```

### TypeScript Errors
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 💡 Tips

1. **Development Flow**: Keep both terminals open (backend + frontend)
2. **Hot Reload**: Both backend (nodemon) and frontend (Vite) support hot reload
3. **Database Sync**: TypeORM auto-syncs schema in development mode
4. **Testing API**: Use Postman or Thunder Client for API testing
5. **Environment Variables**: Never commit `.env` files

## 🎓 Learning Resources

### Backend
- [TypeORM Documentation](https://typeorm.io/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [JWT Authentication](https://jwt.io/introduction)

### Frontend
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📞 Support

Having issues? Check:
1. README.md for detailed documentation
2. Console logs for error messages
3. Database connection settings
4. Node.js version (should be 18+)

## 🎉 Success Indicators

You're all set when you can:
- ✅ Access health endpoint
- ✅ Register a new parent
- ✅ Login successfully
- ✅ Receive JWT token
- ✅ See no errors in console

**Ready to build something amazing! 🚀**
