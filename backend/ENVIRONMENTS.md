# 🌍 Multi-Environment Configuration Guide

**Kidsany Parent Dashboard Backend**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Environment Types](#environment-types)
- [Quick Start](#quick-start)
- [Environment Files](#environment-files)
- [Configuration System](#configuration-system)
- [Environment-Specific Behaviors](#environment-specific-behaviors)
- [Switching Environments](#switching-environments)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Kidsany backend supports three distinct environments:

1. **Development** - For local development and testing
2. **Staging** - For pre-production testing with production-like settings
3. **Production** - For live deployment with maximum security

Each environment has its own configuration file and environment-specific behaviors.

---

## Environment Types

### 🛠️ Development Environment

**Purpose:** Local development and testing

**Key Features:**
- ✅ Auto-sync database (no migrations needed)
- ✅ Detailed logging (debug level)
- ✅ OTP/reset tokens returned in API responses
- ✅ Relaxed rate limiting (1000 req/15min)
- ✅ CORS allows all origins
- ✅ Stack traces in error responses
- ✅ Weak secrets acceptable for quick setup
- ✅ All debug routes enabled

**Security:** Relaxed (bcrypt rounds: 4)

**Use When:**
- Running the app locally
- Testing new features
- Debugging issues
- Running integration tests

---

### 🧪 Staging Environment

**Purpose:** Pre-production testing with production-like settings

**Key Features:**
- ⚠️ Database migrations required (no auto-sync)
- ⚠️ Production-like logging (warning level)
- ⚠️ Real email/SMS services for testing
- ⚠️ Production-like rate limiting (100 req/15min)
- ⚠️ Strict CORS with specific frontend URL
- ⚠️ Stack traces shown for debugging
- ⚠️ Strong secrets required
- ⚠️ Debug routes enabled for testing

**Security:** Production-like (bcrypt rounds: 10)

**Use When:**
- Testing before deploying to production
- Verifying integrations with real services
- Load testing
- User acceptance testing (UAT)

---

### 🚀 Production Environment

**Purpose:** Live deployment serving real users

**Key Features:**
- 🔒 Database migrations only (auto-sync disabled)
- 🔒 Error-level logging only
- 🔒 No OTP/tokens in responses
- 🔒 Strict rate limiting (100 req/15min)
- 🔒 Strict CORS with specific frontend URL
- 🔒 No stack traces in responses
- 🔒 Strong secrets required (validated on startup)
- 🔒 All debug features disabled

**Security:** Maximum (bcrypt rounds: 12)

**Use When:**
- Deploying to production servers
- Serving real users

---

## Quick Start

### 1. Choose Your Environment

```bash
# Development (default)
export NODE_ENV=development

# Staging
export NODE_ENV=staging

# Production
export NODE_ENV=production
```

### 2. Copy and Configure Environment File

```bash
# Development
cp .env.example .env.development

# Staging
cp .env.example .env.staging

# Production
cp .env.example .env.production
```

### 3. Edit Your Environment File

Edit the `.env.{environment}` file with your specific values:

```bash
# Example for development
nano .env.development
```

### 4. Start the Server

```bash
# Development
npm run dev

# Staging
NODE_ENV=staging npm start

# Production
NODE_ENV=production npm start
```

---

## Environment Files

### File Naming Convention

- `.env.development` - Development environment variables
- `.env.staging` - Staging environment variables
- `.env.production` - Production environment variables
- `.env.example` - Template file (committed to git)

### Loading Behavior

The application automatically loads the correct `.env` file based on `NODE_ENV`:

```typescript
// Automatic loading in src/config/environment.ts
const envFile = `.env.${nodeEnv}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
```

### Required Variables

All environments require:
- Database configuration (host, port, username, password, database)
- JWT secrets (access and refresh)
- Cookie secret
- Frontend URL

Production additionally validates:
- Strong JWT secrets (min 32 characters)
- Strong cookie secret (min 32 characters)
- No default/weak passwords

---

## Configuration System

### Type-Safe Configuration

All environment variables are validated and typed in `src/config/environment.ts`:

```typescript
export interface EnvironmentConfig {
  port: number;
  nodeEnv: Environment;
  database: DatabaseConfig;
  jwt: JWTConfig;
  // ... other sections
}

export const config: EnvironmentConfig;
```

### Environment-Specific Constants

Constants that vary by environment are defined in `src/config/constants.ts`:

```typescript
// Example: Pagination varies by environment
export const PAGINATION = {
  DEFAULT_LIMIT: isDevelopment ? 100 : 50,
  MAX_LIMIT: isDevelopment ? 500 : 100,
};
```

### Accessing Configuration

```typescript
// Import the config object
import { config, isDevelopment } from './config/environment';

// Use type-safe configuration
const port = config.port;
const dbHost = config.database.host;

// Check environment
if (isDevelopment) {
  console.log('Running in development mode');
}
```

---

## Environment-Specific Behaviors

### 🔐 Security Settings

| Feature | Development | Staging | Production |
|---------|-------------|---------|------------|
| Bcrypt Rounds | 4 | 10 | 12 |
| OTP Expiry | 10 min | 5 min | 5 min |
| Password Reset Expiry | 30 min | 15 min | 15 min |
| Max Login Attempts | 10 | 5 | 5 |
| Lockout Duration | 5 min | 15 min | 15 min |

### 📊 Database Settings

| Feature | Development | Staging | Production |
|---------|-------------|---------|------------|
| Auto-Sync | ✅ Enabled | ❌ Disabled | ❌ Disabled |
| Logging | ✅ All queries | ❌ Errors only | ❌ Errors only |
| Pool Size | 10 | 20 | 20 |
| Connection Timeout | 10s | 30s | 30s |

### 🚦 Rate Limiting

| Endpoint Type | Development | Staging | Production |
|--------------|-------------|---------|------------|
| General API | 1000/15min | 100/15min | 100/15min |
| Authentication | 10/15min | 5/15min | 5/15min |
| OTP Requests | 5/5min | 3/5min | 3/5min |

### 🌐 CORS Configuration

**Development:**
```javascript
{
  origin: '*',  // Allow all origins
  credentials: true
}
```

**Staging/Production:**
```javascript
{
  origin: process.env.FRONTEND_URL,  // Specific origin only
  credentials: true
}
```

### 🍪 Cookie Settings

| Setting | Development | Staging | Production |
|---------|-------------|---------|------------|
| Secure | ❌ false | ✅ true | ✅ true |
| SameSite | lax | lax | strict |
| HttpOnly | ✅ true | ✅ true | ✅ true |

### ❌ Error Responses

**Development/Staging:**
```json
{
  "success": false,
  "message": "Detailed error message",
  "stack": "Full stack trace...",
  "error": "Database connection failed at..."
}
```

**Production:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### 🔍 Feature Flags

| Feature | Development | Staging | Production |
|---------|-------------|---------|------------|
| API Docs | ✅ Enabled | ✅ Enabled | ❌ Disabled |
| Debug Routes | ✅ Enabled | ✅ Enabled | ❌ Disabled |
| Stack Traces | ✅ Shown | ✅ Shown | ❌ Hidden |
| Return OTP in Response | ✅ Yes | ❌ No | ❌ No |
| Return Reset Token | ✅ Yes | ❌ No | ❌ No |
| Detailed Errors | ✅ Yes | ✅ Yes | ❌ No |

---

## Switching Environments

### Option 1: Environment Variable

```bash
# Set NODE_ENV before starting
export NODE_ENV=staging
npm start
```

### Option 2: Inline

```bash
# Run with specific environment
NODE_ENV=production npm start
```

### Option 3: Package Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development nodemon src/server.ts",
    "staging": "NODE_ENV=staging ts-node src/server.ts",
    "start": "NODE_ENV=production ts-node src/server.ts"
  }
}
```

Then run:
```bash
npm run dev      # Development
npm run staging  # Staging
npm start        # Production
```

---

## Security Best Practices

### ✅ DO:

1. **Use strong secrets in production**
   ```bash
   # Generate strong secrets
   openssl rand -base64 32
   ```

2. **Keep `.env.*` files out of version control**
   ```bash
   # .gitignore
   .env.development
   .env.staging
   .env.production
   ```

3. **Use environment-specific database credentials**
   - Never use production DB in development
   - Use separate databases for each environment

4. **Validate production configuration on startup**
   - The app will exit if production secrets are weak

5. **Use HTTPS in staging and production**
   ```bash
   COOKIE_SECURE=true
   ```

### ❌ DON'T:

1. **Don't commit `.env` files to git**
   - Only commit `.env.example`

2. **Don't use development mode in production**
   - Security is intentionally relaxed

3. **Don't share production credentials**
   - Use separate credentials for each environment

4. **Don't disable auto-sync in development**
   - You'll lose the convenience of automatic schema updates

5. **Don't use weak secrets in production**
   - The app will refuse to start

---

## Troubleshooting

### Issue: "Production environment missing required variables"

**Solution:** Ensure all required variables are set in `.env.production`:
```bash
DB_HOST=your-production-db.com
DB_PASSWORD=strong_password_here
JWT_SECRET=strong_secret_from_openssl
JWT_REFRESH_SECRET=another_strong_secret
COOKIE_SECRET=yet_another_strong_secret
```

### Issue: "Production secrets are too weak"

**Solution:** Generate strong secrets:
```bash
# Generate 3 strong secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
openssl rand -base64 32  # For COOKIE_SECRET
```

### Issue: Database connection fails

**Solution:**
1. Verify database is running
2. Check credentials in `.env.{environment}` file
3. Ensure database exists
4. Check network/firewall settings

### Issue: "Cannot find module './config/environment'"

**Solution:** Environment file is auto-loaded. Ensure:
1. `.env.{NODE_ENV}` file exists
2. `NODE_ENV` is set correctly
3. File is in the backend root directory

### Issue: OTP not appearing in development

**Solution:**
1. Ensure `NODE_ENV=development`
2. Check console logs for OTP
3. OTP is also in API response under `data.otp`

### Issue: CORS errors in production

**Solution:**
1. Set `FRONTEND_URL` in `.env.production`
2. Ensure URL matches exactly (no trailing slash)
3. Frontend must use `credentials: true`

---

## Environment Validation

The application performs validation on startup:

### Development
- ✅ Minimal validation
- ✅ Allows weak/default secrets
- ✅ Auto-creates missing config with defaults

### Staging
- ⚠️ Validates required variables exist
- ⚠️ Warns about weak secrets but allows startup
- ⚠️ Checks database connectivity

### Production
- 🔒 Strict validation of all variables
- 🔒 Rejects weak secrets (fails startup)
- 🔒 Validates secret lengths (min 32 chars)
- 🔒 Fails fast if configuration invalid

---

## Summary

| Aspect | Development | Staging | Production |
|--------|-------------|---------|------------|
| **Purpose** | Local dev | Pre-prod testing | Live deployment |
| **Database** | Auto-sync ✅ | Migrations ⚠️ | Migrations 🔒 |
| **Security** | Relaxed ✅ | Production-like ⚠️ | Maximum 🔒 |
| **Logging** | Debug ✅ | Warning ⚠️ | Error 🔒 |
| **Rate Limits** | Relaxed ✅ | Strict ⚠️ | Strict 🔒 |
| **Secrets** | Weak OK ✅ | Strong required ⚠️ | Strong required 🔒 |
| **Debug Features** | Enabled ✅ | Enabled ⚠️ | Disabled 🔒 |
| **Error Details** | Full ✅ | Full ⚠️ | Minimal 🔒 |

---

## Next Steps

1. ✅ Copy `.env.example` to `.env.development`
2. ✅ Configure your development database
3. ✅ Run `npm run dev` to start development server
4. ✅ Test all features in development
5. ✅ Set up staging environment when ready
6. ✅ Test thoroughly in staging
7. ✅ Configure production environment
8. ✅ Deploy to production

---

**Last Updated:** 2024-11-29
**Version:** 1.0.0
