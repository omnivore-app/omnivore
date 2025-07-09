# Troubleshooting Guide

## Link Processing Issues

### Problem: Links get stuck in "Processing" state

**Symptoms:**

- Links remain in "Processing" state indefinitely
- Articles cannot be read

**Root Cause:**
After recent changes, content fetching was moved to a separate BullMQ queue service. In development environments, if the content-fetch service isn't running, jobs accumulate in the queue without being processed.

**Solution:**

1. **Quick Fix (Development)**: Add these environment variables to your `.env` file:

   ```
   CONTENT_FETCH_QUEUE_ENABLED=false
   CONTENT_FETCH_URL=http://localhost:3002
   ```

2. **Alternative (Production-like)**: Start the content-fetch service:

   ```bash
   cd packages/content-fetch
   npm start
   ```

3. **Retry stuck items**: For items already stuck in processing, simply click on them again or refresh the page. The system will automatically retry processing.

## PDF Upload Issues

### Problem: "Refused to set unsafe header origin" error

**Symptoms:**

- Error message appears in console during PDF upload
- Upload process may be interrupted

**Root Cause:**
Browsers prevent setting the `origin` header for security reasons.

**Solution:**
This has been fixed in the latest version. The unsafe header has been removed from the upload request.

## Environment Configuration

### Required Environment Variables for Development

Add these to your `.env` file in the `packages/api` directory:

```env
# Content Fetch Queue Configuration
CONTENT_FETCH_QUEUE_ENABLED=false
CONTENT_FETCH_URL=http://localhost:3002

# Database Configuration
PG_HOST=localhost
PG_PORT=5432
PG_USER=your_db_user
PG_PASSWORD=your_db_password
PG_DB=omnivore

# Redis Configuration (for development)
REDIS_URL=redis://localhost:6379
MQ_REDIS_URL=redis://localhost:6379

# Development Settings
API_ENV=local
```

### Development Services

Make sure these services are running:

1. **PostgreSQL Database**
2. **Redis Server**
3. **Minio (for file storage)**

### Starting the Development Environment

```bash
# Start backend services
cd packages/api
npm run dev

# Start web frontend
cd packages/web
npm run dev

# Optional: Start content-fetch service for production-like behavior
cd packages/content-fetch
npm start
```

## Common Issues and Solutions

### 1. Database Connection Issues

- Ensure PostgreSQL is running and accessible
- Check database credentials in `.env`
- Run database migrations: `npm run migrate`

### 2. Redis Connection Issues

- Ensure Redis server is running
- Check Redis URL in `.env`
- Default Redis URL: `redis://localhost:6379`

### 3. File Upload Issues

- Ensure Minio is running (for local development)
- Check file upload configuration in `.env`
- Verify upload bucket exists

### 4. CORS Issues

- Ensure `CLIENT_URL` is set correctly in `.env`
- Check that frontend and backend ports match configuration

## Getting Help

If you're still experiencing issues:

1. Check the console logs for detailed error messages
2. Verify all required services are running
3. Ensure environment variables are properly set
4. Try restarting the development servers

For persistent issues, please check the GitHub repository for known issues or create a new issue with:

- Error messages
- Environment configuration
- Steps to reproduce
