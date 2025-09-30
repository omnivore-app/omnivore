# NestJS API Setup Guide

## 🚀 Quick Start

### 1. Environment Configuration

Copy the environment template and configure your variables:

```bash
cd packages/api-nest
cp env.template .env
```

Edit `.env` and configure the JWT secret:

```bash
# Required - Must be at least 32 characters
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Start the Application

```bash
# Development mode with hot reload
yarn start:dev

# Production mode
yarn start:prod
```

### 4. Access Swagger Documentation

Once the application is running, you can access the interactive API documentation:

```
📚 Swagger docs: http://localhost:4001/api/v2/docs
```

## 📋 Environment Variables

### Required Variables

| Variable     | Description                      | Example                                  |
| ------------ | -------------------------------- | ---------------------------------------- |
| `JWT_SECRET` | Secret key for JWT token signing | `your-super-secret-jwt-key-min-32-chars` |

### Optional Variables

These variables have sensible defaults:

| Variable         | Default                 | Description           |
| ---------------- | ----------------------- | --------------------- |
| `NODE_ENV`       | `development`           | Environment mode      |
| `NEST_PORT`      | `4001`                  | Application port      |
| `JWT_EXPIRES_IN` | `1h`                    | JWT token expiration  |
| `FRONTEND_URL`   | `http://localhost:3000` | Frontend URL for CORS |

## 🔧 Joi Validation

Environment variables are validated using Joi schema at application startup:

- ✅ **JWT_SECRET** must be at least 32 characters
- ✅ **NEST_PORT** must be a valid port number
- ✅ **NODE_ENV** must be development, production, or test
- ✅ **JWT_EXPIRES_IN** must be valid time format (1h, 30m, 7d)
- ✅ **FRONTEND_URL** must be a valid URL

### Type-Safe Access

```typescript
// Using ConfigService with type safety
import { ConfigService } from '@nestjs/config'
import { EnvVariables } from './config/EnvVariables'

constructor(private configService: ConfigService) {}

// Get values with IntelliSense
const jwtSecret = this.configService.get<string>(EnvVariables.JWT_SECRET)
const port = this.configService.get<number>(EnvVariables.NEST_PORT)
```

## 📚 Swagger Documentation

The API includes comprehensive Swagger/OpenAPI documentation with:

- ✅ **Interactive API Explorer** - Test endpoints directly in the browser
- ✅ **JWT Authentication** - Built-in auth token management
- ✅ **Request/Response Schemas** - Complete data models
- ✅ **Validation Examples** - See required fields and formats
- ✅ **Error Response Documentation** - Understand error codes

### Swagger Features

- **Authentication Testing**: Use the "Authorize" button to set your JWT token
- **Persistent Authorization**: Token persists across page refreshes
- **Try It Out**: Execute real API calls from the documentation
- **Schema Validation**: See exactly what data is expected

### Available Endpoints

| Tag        | Endpoints          | Description                                        |
| ---------- | ------------------ | -------------------------------------------------- |
| **auth**   | `/api/v2/auth/*`   | Authentication (login, register, profile, refresh) |
| **health** | `/api/v2/health/*` | Health checks (basic, deep)                        |

## 🧪 Testing Configuration

For testing, create a `.env.test` file:

```bash
# Test Environment
NODE_ENV=test
JWT_SECRET=test-secret-key-for-testing-only
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/omnivore_test
REDIS_URL=redis://localhost:6379
```

## 🐳 Docker Configuration

The Docker setup automatically uses environment variables:

```yaml
# docker-compose.yml
api-nest:
  build: ./packages/api-nest
  environment:
    - NODE_ENV=development
    - JWT_SECRET=${JWT_SECRET}
    - DATABASE_URL=${DATABASE_URL}
    - REDIS_URL=${REDIS_URL}
  ports:
    - '4001:4001'
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Missing Required Environment Variables

**Error**: `❌ Missing required environment variables: JWT_SECRET, DATABASE_URL`

**Solution**: Copy `env.template` to `.env` and configure the required values.

#### 2. Invalid JWT Secret

**Error**: `JWT secret must be at least 32 characters`

**Solution**: Use a longer, more secure JWT secret:

```bash
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

#### 3. Database Connection Issues

**Error**: `Database connection failed`

**Solution**: Verify your database is running and the connection string is correct:

```bash
# Test database connection
psql postgresql://postgres:postgres@localhost:5432/omnivore
```

#### 4. Redis Connection Issues

**Error**: `Redis connection failed`

**Solution**: Verify Redis is running:

```bash
# Test Redis connection
redis-cli ping
```

### Environment Validation Errors

The application provides detailed error messages for configuration issues:

```bash
❌ Invalid value for NODE_ENV: "prod". Expected one of: development, production, test
❌ Invalid format for DB_PORT: "abc". Expected format: /^\d+$/
❌ Missing required environment variable: JWT_SECRET
```

## 🔐 Security Considerations

### Production Environment

For production deployment:

1. **Use strong secrets**:

   ```bash
   JWT_SECRET=$(openssl rand -base64 32)
   COOKIE_SECRET=$(openssl rand -base64 32)
   ```

2. **Enable HTTPS**:

   ```bash
   NODE_ENV=production
   CORS_ORIGIN=https://yourdomain.com
   ```

3. **Configure monitoring**:
   ```bash
   SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   LOG_LEVEL=warn
   ```

### Environment File Security

- ✅ Never commit `.env` files to version control
- ✅ Use different secrets for each environment
- ✅ Rotate secrets regularly
- ✅ Use environment-specific configuration management

## 📊 Configuration Summary

On successful startup, you'll see a configuration summary:

```bash
🔍 Validating environment variables...
📋 Configuration Summary:
   Environment: development
   Port: 4001
   Log Level: info
   JWT Expires: 1h
   Database: postgresql://postgres:***@localhost:5432/omnivore
   Redis: redis://localhost:6379
   Optional Services: Google OAuth, SendGrid Email, Sentry
✅ Environment validation completed successfully
🚀 NestJS API running on port 4001
📊 Health check: http://localhost:4001/api/v2/health
🔐 Auth endpoints: http://localhost:4001/api/v2/auth/*
```

This comprehensive configuration system ensures your application starts reliably with proper validation and clear error messages for any configuration issues.
