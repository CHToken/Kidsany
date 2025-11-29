# Deployment Guide - Kidsany Parent Dashboard

This guide provides step-by-step instructions for deploying the Kidsany Parent Dashboard to production.

## 📋 Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Backup strategy in place
- [ ] Monitoring setup configured

## 🗄️ Database Deployment

### Option 1: Managed PostgreSQL (Recommended)

**Popular Providers:**
- **Supabase** (Free tier available)
- **Neon** (Serverless PostgreSQL)
- **Railway** (Easy PostgreSQL setup)
- **AWS RDS**
- **Digital Ocean Managed Databases**

**Steps:**
1. Create a PostgreSQL database instance
2. Note the connection details (host, port, username, password, database name)
3. Update backend `.env` with production database credentials
4. Run migrations: `npm run typeorm migration:run`

### Security Considerations:
- Enable SSL/TLS connections
- Use strong passwords
- Restrict database access by IP whitelist
- Regular automated backups
- Enable connection pooling

## 🚀 Backend Deployment

### Option 1: Railway (Recommended for ease)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add

# Deploy
railway up

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=<your-secret>
# ... add all other variables
```

### Option 2: Heroku

```bash
# Install Heroku CLI
# Then:
heroku login
heroku create kidsany-api
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=<your-secret>
# ... add all other variables

# Deploy
git push heroku main
```

### Option 3: AWS EC2 + PM2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone <your-repo-url>
cd kidsany-parent-dashboard/backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Create .env file
nano .env
# Add production environment variables

# Start with PM2
pm2 start dist/server.js --name kidsany-api
pm2 save
pm2 startup
```

### Option 4: Docker

```dockerfile
# Create Dockerfile in backend directory
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/server.js"]
```

```bash
# Build and run
docker build -t kidsany-api .
docker run -p 5000:5000 --env-file .env kidsany-api
```

### Backend Environment Variables (Production)

```env
# Server
PORT=5000
NODE_ENV=production

# Database (from managed provider)
DB_HOST=your-db-host.com
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=strong_password_here
DB_DATABASE=kidsany_production

# JWT (Generate strong secrets: openssl rand -base64 32)
JWT_SECRET=<strong-secret-64-chars>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<another-strong-secret>
JWT_REFRESH_EXPIRES_IN=30d

# Cookie
COOKIE_SECRET=<cookie-secret>

# Email (Configure SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
EMAIL_FROM=noreply@kidsany.com

# Frontend URL
FRONTEND_URL=https://kidsany.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/app/uploads
```

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Follow prompts
# Add environment variables in Vercel dashboard:
# VITE_API_URL=https://your-backend-url.com/api
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

### Option 3: AWS S3 + CloudFront

```bash
# Build
npm run build

# Install AWS CLI
# Configure AWS credentials

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Frontend Environment Variables

```env
# Vercel/Netlify
VITE_API_URL=https://your-backend-api.com/api
```

## 🔒 Security Hardening

### 1. Environment Variables
- Never commit `.env` files
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly

### 2. Database Security
```sql
-- Create read-only user for reporting
CREATE USER readonly_user WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE kidsany_production TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Enable SSL
ALTER SYSTEM SET ssl = on;
```

### 3. Backend Security Checklist
- [ ] Enable HTTPS only (redirect HTTP to HTTPS)
- [ ] Set secure cookies in production
- [ ] Configure proper CORS origins
- [ ] Enable helmet security headers
- [ ] Set up rate limiting
- [ ] Implement request logging
- [ ] Use prepared statements (TypeORM handles this)
- [ ] Sanitize all user inputs
- [ ] Implement CSRF protection
- [ ] Regular dependency updates

### 4. Nginx Configuration (if using)

```nginx
# /etc/nginx/sites-available/kidsany-api
server {
    listen 80;
    server_name api.kidsany.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.kidsany.com;

    ssl_certificate /etc/letsencrypt/live/api.kidsany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.kidsany.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring & Logging

### Application Monitoring

**Recommended Tools:**
- **Sentry** - Error tracking
- **New Relic** - APM
- **DataDog** - Infrastructure monitoring
- **LogRocket** - Frontend monitoring

### Setup Sentry (Backend)

```bash
npm install @sentry/node
```

```typescript
// In server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Before routes
app.use(Sentry.Handlers.requestHandler());

// After routes, before error handler
app.use(Sentry.Handlers.errorHandler());
```

### Logging

```bash
npm install winston
```

```typescript
// utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run tests
        run: |
          cd backend
          npm test
      
      - name: Build
        run: |
          cd backend
          npm run build
      
      - name: Deploy to Railway
        run: |
          npm i -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Build
        run: |
          cd frontend
          npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
      
      - name: Deploy to Vercel
        run: |
          npm i -g vercel
          cd frontend
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 📱 SSL/TLS Certificates

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.kidsany.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

## 💾 Backup Strategy

### Database Backups

```bash
# Automated daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > backup_$DATE.sql.gz

# Upload to S3
aws s3 cp backup_$DATE.sql.gz s3://kidsany-backups/

# Keep only last 30 days
find . -name "backup_*.sql.gz" -mtime +30 -delete
```

### Add to crontab
```bash
0 2 * * * /path/to/backup-script.sh
```

## 🔍 Health Checks

### Backend Health Endpoint

```typescript
// Already implemented at /health
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});
```

### Uptime Monitoring
- **UptimeRobot** (Free)
- **Pingdom**
- **StatusCake**

## 📈 Performance Optimization

### Backend
- Enable gzip compression
- Use Redis for caching
- Database query optimization
- Connection pooling
- Load balancing (if high traffic)

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- CDN for static assets
- Service workers for PWA

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed:**
```bash
# Check database is running
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# Verify firewall rules
# Check SSL requirements
```

**CORS Errors:**
```typescript
// Update CORS in server.ts
cors({
  origin: ['https://kidsany.com', 'https://www.kidsany.com'],
  credentials: true,
})
```

**Build Errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- [ ] Weekly: Review logs for errors
- [ ] Weekly: Check system resources
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review security alerts
- [ ] Quarterly: Database optimization
- [ ] Quarterly: Security audit

### Emergency Contacts
- DevOps Lead: devops@kidsany.com
- Database Admin: dba@kidsany.com
- Security Team: security@kidsany.com

## ✅ Post-Deployment Verification

1. Test all authentication flows
2. Verify API endpoints
3. Check database connections
4. Test file uploads
5. Verify email/SMS delivery
6. Load testing
7. Security scan
8. Monitor error rates
9. Check response times
10. Verify backup processes

---

**Remember:** Always test in a staging environment before deploying to production!
