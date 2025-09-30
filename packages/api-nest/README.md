# Omnivore NestJS API

This is the new NestJS-based API that will eventually replace the current Express API. It's being developed slice-by-slice to ensure a smooth migration.

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- Docker and Docker Compose
- Yarn (for package management)

### Node.js Version Management

This project uses Node.js 22 for optimal performance and latest features.

```bash
# Install and use the correct Node.js version
nvm install 22
nvm use 22

# Or if you have .nvmrc support
nvm use

# Verify version
node --version  # Should show v22.x.x
```

### Development Setup

1. **Install Dependencies**:

   ```bash
   cd packages/api-nest
   yarn install
   ```

2. **Start with Docker Compose** (Recommended):

   ```bash
   # From project root
   docker-compose up api-nest postgres redis
   ```

3. **Or Run Locally**:
   ```bash
   # From packages/api-nest
   yarn start:dev
   ```

### API Endpoints

- **Base URL**: `http://localhost:4001/api/v2`
- **Health Check**: `GET /api/v2/health`
- **Deep Health Check**: `GET /api/v2/health/deep`
- **Application Info**: `GET /api/v2`
- **Version Info**: `GET /api/v2/version`

#### Authentication Endpoints (Slice 2)

- **Login**: `POST /api/v2/auth/login`
- **Register**: `POST /api/v2/auth/register`
- **Profile**: `GET /api/v2/auth/profile` (requires JWT)
- **Refresh Token**: `POST /api/v2/auth/refresh` (requires JWT)

## 🏗️ Architecture

The NestJS API follows a modular architecture:

```
src/
├── app/           # Main application module
├── health/        # Health check endpoints
├── auth/          # Authentication (coming in Slice 2)
├── graphql/       # GraphQL setup (coming in Slice 3)
├── library/       # Library management (coming in Slice 3)
├── queue/         # Background job processing (coming in Slice 4)
└── content/       # Content processing (coming in Slice 4)
```

## 📋 Migration Progress

### ✅ Slice 1: Foundation (Current)

- [x] NestJS application setup
- [x] Basic health checks
- [x] Docker integration
- [x] TypeScript configuration

### 🚧 Slice 2: Authentication (Next)

- [ ] JWT authentication
- [ ] OAuth integration (Google, Apple)
- [ ] Authentication guards

### 📅 Future Slices

- **Slice 3**: GraphQL + Library Management
- **Slice 4**: Background Processing
- **Slice 5**: Service Consolidation

## 🧪 Testing

```bash
# Unit tests
yarn test

# Watch mode
yarn test:watch

# Coverage
yarn test:cov

# E2E tests
yarn test:e2e
```

## 🔧 Development Commands

```bash
# Development with hot reload
yarn start:dev

# Debug mode
yarn start:debug

# Production build
yarn build

# Start production
yarn start:prod

# Linting
yarn lint

# Format code
yarn format
```

## 🐳 Docker

### Development

```bash
# Build development image
docker build -t omnivore/api-nest:dev --target builder .

# Run development container
docker run -p 4001:4001 -e NODE_ENV=development omnivore/api-nest:dev
```

### Production

```bash
# Build production image
docker build -t omnivore/api-nest:prod .

# Run production container
docker run -p 4001:4001 omnivore/api-nest:prod
```

## 📚 Documentation

- [Unified Migration Backlog](../../docs/architecture/unified-migration-backlog.md)
- [NestJS Documentation](https://docs.nestjs.com/)
- [GraphQL Documentation](https://graphql.org/learn/)

## 🤝 Contributing

1. Follow the slice-by-slice development approach
2. Write tests for all new features
3. Update documentation as you go
4. Ensure compatibility with existing Express API during migration

## 🔍 Monitoring

### Health Checks

- Basic: `GET /api/nest/health` - Returns application status
- Deep: `GET /api/nest/health/deep` - Includes database and Redis checks (when configured)

### Logging

- Structured JSON logging
- Request/response logging
- Error tracking (Sentry integration planned)

## 🚨 Troubleshooting

### Common Issues

1. **Port 4001 already in use**:

   ```bash
   lsof -ti:4001 | xargs kill -9
   ```

2. **Module not found errors**:

   ```bash
   rm -rf node_modules && yarn install
   ```

3. **TypeScript compilation errors**:
   ```bash
   yarn build
   ```

### Docker Issues

1. **Build failures**:

   ```bash
   docker-compose build --no-cache api-nest
   ```

2. **Container won't start**:
   ```bash
   docker-compose logs api-nest
   ```

## 🎯 Next Steps

1. Complete Slice 1 validation
2. Begin Slice 2 (Authentication) implementation
3. Set up comprehensive testing
4. Add database connectivity
5. Implement GraphQL integration

---

For questions or issues, refer to the [main project documentation](../../README.md) or check the [troubleshooting guide](../../docs/TROUBLESHOOTING.md).
