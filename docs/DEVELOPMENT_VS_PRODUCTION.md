# Development vs Production Deployment Strategy

## Current Issue Analysis

The Redis connection errors (`connect ECONNREFUSED 127.0.0.1:6379`) occurred because we were running **production compiled code** with **development environment variables** and **development expectations**.

### Root Cause

- **Current Setup**: Docker images are built for production (compiled JavaScript)
- **Override Issue**: docker-compose.override.yml was trying to run development commands on production images
- **Mixed Environment**: Production containers with development configurations

## 🔧 Development Setup (Current)

### What We Have Now

```yaml
# docker-compose.override.yml - Development overrides
services:
  api:
    command: yarn workspace @omnivore/api start # Production command
    environment:
      - NODE_ENV=development # Development environment
    volumes:
      - ./packages/api:/app/packages/api # Code mounting
```

### Issues with Current Approach

1. **No Hot Reload**: Changes require container rebuild
2. **Production Code**: Running compiled JS instead of TypeScript
3. **Dev Dependencies Missing**: ts-node-dev not available in production image
4. **Redis Connection Issues**: Compiled code may have cached connection logic

## 🚀 Proper Development Setup (Recommended)

### Option 1: Development Dockerfile

Create `packages/api/Dockerfile.dev`:

```dockerfile
FROM node:22.12-alpine

WORKDIR /app

# Install all dependencies including dev dependencies
COPY package.json yarn.lock tsconfig.json ./
COPY packages/api/package.json ./packages/api/
RUN yarn install

# Copy source code
COPY packages/api ./packages/api

# Use development command
CMD ["yarn", "workspace", "@omnivore/api", "dev"]
```

### Option 2: Local Development (No Docker)

```bash
# Run services locally for development
yarn workspace @omnivore/api dev          # API with hot reload
yarn workspace @omnivore/web dev          # Web with hot reload
yarn workspace @omnivore/content-fetch dev # Content fetch with hot reload
```

### Option 3: Hybrid Approach (Recommended)

- **Infrastructure**: Redis, PostgreSQL, MinIO in Docker
- **Application**: Run locally with hot reload
- **Benefits**: Fast development, proper TypeScript support

## 🏭 Production Deployment Strategy

### Self-Hosting (Docker Compose)

```yaml
# docker-compose.prod.yml
version: '3'
services:
  api:
    image: omnivore-api:latest
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - PG_HOST=postgres
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  web:
    image: omnivore-web:latest
    environment:
      - NODE_ENV=production
    depends_on:
      - api
    restart: unless-stopped
```

### Cloud Deployment (Kubernetes/Cloud Run)

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: omnivore-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: omnivore-api
  template:
    metadata:
      labels:
        app: omnivore-api
    spec:
      containers:
        - name: api
          image: omnivore-api:latest
          env:
            - name: NODE_ENV
              value: 'production'
            - name: REDIS_URL
              value: 'redis://redis-service:6379'
            - name: PG_HOST
              value: 'postgres-service'
          ports:
            - containerPort: 8080
```

## 📋 Environment Configuration

### Development Environment Variables

```env
# .env.development
NODE_ENV=development
API_ENV=local
REDIS_URL=redis://localhost:6379
PG_HOST=localhost
PG_PORT=5432
LOG_LEVEL=debug
HOT_RELOAD=true
```

### Production Environment Variables

```env
# .env.production
NODE_ENV=production
API_ENV=production
REDIS_URL=redis://redis-cluster:6379
PG_HOST=postgres-primary
PG_PORT=5432
LOG_LEVEL=info
SENTRY_DSN=https://...
```

## 🔄 Migration Strategy

### Phase 1: Fix Current Development (Immediate)

1. ✅ Use production Docker images with proper environment variables
2. ✅ Fix Redis connection issues in source code
3. ✅ Ensure all services work with current setup

### Phase 2: Proper Development Setup (Short-term)

1. Create development Dockerfiles with dev dependencies
2. Implement hot reload for development
3. Separate development vs production configurations

### Phase 3: Production Optimization (Long-term)

1. Multi-stage Docker builds
2. Health checks and monitoring
3. Horizontal scaling capabilities
4. CI/CD pipeline integration

## 🛠️ Recommended Actions

### For Development

```bash
# Create development environment
cp docker-compose.yml docker-compose.dev.yml
# Edit docker-compose.dev.yml to use development Dockerfiles
# Set proper development environment variables
```

### For Production

```bash
# Create production environment
cp docker-compose.yml docker-compose.prod.yml
# Remove development overrides
# Add production optimizations (health checks, restart policies)
# Configure external services (managed Redis, PostgreSQL)
```

### For Self-Hosting

```bash
# Use the current setup with improvements
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

## 📊 Performance Considerations

### Development

- **Pros**: Fast iteration, debugging capabilities
- **Cons**: Resource intensive, not production-like

### Production

- **Pros**: Optimized, scalable, production-ready
- **Cons**: Slow iteration, requires deployment pipeline

## 🔍 Redis Connection Issue Resolution

The Redis connection errors were caused by:

1. **Compiled Code**: Production build had cached connection logic
2. **Environment Mismatch**: Development Redis URL with production connection handling
3. **Fallback Logic**: Hardcoded localhost fallbacks in RSS handler

### Fixed By:

1. ✅ Removing hardcoded localhost fallbacks
2. ✅ Proper environment variable handling
3. ✅ Consistent Docker service networking

## 🎯 Next Steps

1. **Immediate**: Current setup works for development with fixed Redis connections
2. **Short-term**: Implement proper development Dockerfiles
3. **Long-term**: Create production-ready deployment configurations
4. **Documentation**: Update README with clear development/production instructions

This strategy ensures Omnivore can be developed efficiently while maintaining production deployment capabilities for self-hosting and cloud deployment.
