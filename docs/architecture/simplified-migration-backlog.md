# Simplified Migration Backlog

## Overview

This backlog implements the simplified migration strategy in focused slices, taking advantage of having no active users to create a cleaner, consolidated architecture.

---

## 🏗️ SLICE 1: NestJS Foundation (Week 1)

### ARC-S001: NestJS Application Bootstrap

**Priority**: P0 (Blocking)  
**Estimate**: 3 days

**Objective**: Create the foundational NestJS application structure

**Tasks**:

- [ ] Create `packages/api-nest` directory
- [ ] Initialize NestJS project: `nest new api-nest`
- [ ] Configure TypeScript with strict settings
- [ ] Set up shared tsconfig extending workspace root
- [ ] Create `AppModule` and `main.ts` with basic configuration

**Acceptance Criteria**:

- [x] NestJS application boots without errors
- [x] Application listens on port 4001
- [x] Basic logging configured
- [x] Environment variable loading works

**Implementation**:

```typescript
// packages/api-nest/src/main.ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  app.setGlobalPrefix('api')
  await app.listen(process.env.PORT || 4001)
}

bootstrap()
```

---

### ARC-S002: Health Checks & Observability

**Priority**: P0 (Blocking)  
**Estimate**: 2 days

**Objective**: Implement health checks and basic monitoring

**Tasks**:

- [ ] Install `@nestjs/terminus` for health checks
- [ ] Create health check endpoints (`/health`, `/health/deep`)
- [ ] Set up basic Prometheus metrics
- [ ] Configure structured logging
- [ ] Add request/response logging middleware

**Acceptance Criteria**:

- [x] `/api/health` returns 200 with status
- [x] `/api/health/deep` checks database/redis connectivity
- [x] Prometheus metrics exposed at `/metrics`
- [x] Structured logs output to console

**Implementation**:

```typescript
// src/health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
    ])
  }
}
```

---

## 🔐 SLICE 2: Authentication System (Week 2)

### ARC-S003: Core Authentication Module

**Priority**: P0 (Blocking)  
**Estimate**: 4 days

**Objective**: Complete authentication system with JWT and OAuth

**Tasks**:

- [ ] Create `AuthModule` with controllers and services
- [ ] Implement JWT strategy with Passport
- [ ] Set up authentication guards (`JwtAuthGuard`)
- [ ] Create DTOs for login/register requests
- [ ] Implement session management
- [ ] Add rate limiting for auth endpoints

**Acceptance Criteria**:

- [x] `/api/auth/login` accepts email/password, returns JWT
- [x] `/api/auth/register` creates new users
- [x] JWT tokens properly validated on protected routes
- [x] Rate limiting prevents brute force attacks
- [x] Session management handles refresh tokens

**Implementation**:

```typescript
// src/auth/auth.module.ts
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

---

### ARC-S004: OAuth Integration

**Priority**: P1 (High)  
**Estimate**: 3 days

**Objective**: Google and Apple OAuth integration

**Tasks**:

- [ ] Implement Google OAuth strategy
- [ ] Implement Apple Sign-In strategy
- [ ] Create OAuth callback handlers
- [ ] Handle OAuth user creation/linking
- [ ] Test OAuth flows end-to-end

**Acceptance Criteria**:

- [x] Google OAuth login flow works
- [x] Apple Sign-In flow works
- [x] OAuth users created in database
- [x] Existing users can link OAuth accounts
- [x] OAuth tokens properly managed

---

## 📚 SLICE 3: Core API & GraphQL (Week 3-4)

### ARC-S005: GraphQL Foundation

**Priority**: P0 (Blocking)  
**Estimate**: 3 days

**Objective**: Set up GraphQL with NestJS

**Tasks**:

- [ ] Install and configure `@nestjs/graphql`
- [ ] Set up Apollo Server integration
- [ ] Create base GraphQL schema
- [ ] Implement authentication context for GraphQL
- [ ] Create first resolver (viewer query)

**Acceptance Criteria**:

- [x] GraphQL playground accessible at `/api/graphql`
- [x] Authentication context passed to resolvers
- [x] `viewer` query returns current user
- [x] GraphQL introspection works
- [x] Error handling properly formatted

**Implementation**:

```typescript
// src/graphql/graphql.module.ts
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      context: ({ req }) => ({ req }),
      playground: true,
      introspection: true,
    }),
  ],
})
export class GraphQLModule {}
```

---

### ARC-S006: Library Management Core

**Priority**: P0 (Blocking)  
**Estimate**: 5 days

**Objective**: Article and library management functionality

**Tasks**:

- [ ] Create `LibraryModule` with services and resolvers
- [ ] Implement article CRUD operations
- [ ] Create library item management
- [ ] Implement search and filtering
- [ ] Add label and highlight management
- [ ] Create GraphQL mutations for library operations

**Acceptance Criteria**:

- [x] Users can save articles via GraphQL mutation
- [x] Library items can be retrieved, updated, deleted
- [x] Search functionality works with basic queries
- [x] Labels can be created and assigned
- [x] Highlights can be created and managed

**Implementation**:

```typescript
// src/library/library.service.ts
@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(LibraryItem)
    private libraryRepo: Repository<LibraryItem>
  ) {}

  async saveArticle(url: string, userId: string): Promise<LibraryItem> {
    const libraryItem = this.libraryRepo.create({
      url,
      user: { id: userId },
      status: 'PROCESSING',
    })

    await this.libraryRepo.save(libraryItem)

    // Queue content processing (handled in next slice)
    await this.queueContentProcessing(libraryItem.id, url)

    return libraryItem
  }
}
```

---

## ⚙️ SLICE 4: Integrated Background Processing (Week 5-6)

### ARC-S007: Queue System Integration

**Priority**: P1 (High)  
**Estimate**: 4 days

**Objective**: Integrate BullMQ queue processing into main API

**Tasks**:

- [ ] Install and configure `@nestjs/bull`
- [ ] Create queue module with Redis integration
- [ ] Set up content processing queue
- [ ] Implement image processing queue
- [ ] Create queue monitoring endpoints
- [ ] Add job retry and error handling

**Acceptance Criteria**:

- [x] Queues process jobs reliably
- [x] Failed jobs are retried appropriately
- [x] Queue monitoring shows job status
- [x] Memory usage remains stable under load
- [x] Queue processing doesn't block API requests

**Implementation**:

```typescript
// src/queue/queue.module.ts
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue(
      { name: 'content-processing' },
      { name: 'image-processing' }
    ),
  ],
  providers: [ContentProcessor, ImageProcessor],
  exports: [BullModule],
})
export class QueueModule {}
```

---

### ARC-S008: Content Processing Integration

**Priority**: P1 (High)  
**Estimate**: 5 days

**Objective**: Move content processing from separate service into API

**Tasks**:

- [ ] Create content processing job handlers
- [ ] Integrate readability extraction
- [ ] Implement PDF processing
- [ ] Add image optimization (replacing image proxy)
- [ ] Create content enrichment pipeline
- [ ] Handle content processing errors gracefully

**Acceptance Criteria**:

- [x] Articles are processed automatically when saved
- [x] Content extraction works for web articles
- [x] PDF processing functional
- [x] Images are optimized during processing
- [x] Processing errors are handled and logged

**Implementation**:

```typescript
// src/content/content.processor.ts
@Processor('content-processing')
export class ContentProcessor {
  @Process('extract-content')
  async extractContent(job: Job<ContentJob>) {
    const { url, libraryItemId } = job.data

    try {
      // Extract content using readability
      const content = await this.extractionService.extract(url)

      // Process images in background
      await this.imageQueue.add('optimize-images', {
        images: content.images,
        libraryItemId,
      })

      // Update library item
      await this.libraryService.updateContent(libraryItemId, content)

      return { success: true }
    } catch (error) {
      throw new Error(`Content processing failed: ${error.message}`)
    }
  }
}
```

---

## 🧹 SLICE 5: Service Consolidation (Week 7)

### ARC-S009: Express API Migration

**Priority**: P1 (High)  
**Estimate**: 3 days

**Objective**: Migrate remaining Express endpoints to NestJS

**Tasks**:

- [ ] Audit remaining Express endpoints
- [ ] Migrate digest management endpoints
- [ ] Migrate integration/webhook endpoints
- [ ] Migrate admin/utility endpoints
- [ ] Update client applications to use new endpoints

**Acceptance Criteria**:

- [x] All critical endpoints migrated
- [x] Client applications work with new API
- [x] No functionality regression
- [x] API documentation updated

---

### ARC-S010: Service Decommissioning

**Priority**: P2 (Medium)  
**Estimate**: 2 days

**Objective**: Remove separate queue-processor and content-handler services

**Tasks**:

- [ ] Update Docker Compose to remove old services
- [ ] Remove queue-processor service container
- [ ] Remove content-handler service container
- [ ] Update deployment scripts
- [ ] Clean up old service configurations

**Acceptance Criteria**:

- [x] Docker Compose runs with single API service
- [x] All functionality works with consolidated service
- [x] Resource usage reduced as expected
- [x] Deployment simplified

**Final Architecture**:

```yaml
# docker-compose.yml (simplified)
services:
  omnivore-api:
    image: omnivore/nest-api:latest
    environment:
      - NODE_ENV=production
      - ENABLE_QUEUES=true
    ports:
      - '4000:4000'

  postgres:
    image: postgres:15-alpine

  redis:
    image: redis:7-alpine

  web:
    image: omnivore/web:latest
```

---

## 📊 Success Metrics & Validation

### Technical Validation

- [ ] **Service Count**: 4 services → 1 service (75% reduction)
- [ ] **Memory Usage**: < 1GB total (vs 1.5GB current)
- [ ] **Response Times**: ≤ current Express performance
- [ ] **Test Coverage**: ≥ 80% for all new NestJS modules

### Functional Validation

- [ ] **Authentication**: All auth flows work
- [ ] **Content Saving**: Articles save and process correctly
- [ ] **Search**: Library search returns expected results
- [ ] **GraphQL**: All queries and mutations functional
- [ ] **Background Jobs**: Content processing works reliably

### Operational Validation

- [ ] **Health Checks**: All endpoints respond correctly
- [ ] **Monitoring**: Metrics collection functional
- [ ] **Logging**: Structured logs provide good debugging info
- [ ] **Error Handling**: Graceful error responses

---

## Implementation Notes

### Development Approach

1. **Slice-by-slice**: Complete each slice fully before moving to next
2. **Test-driven**: Write tests for each feature as it's implemented
3. **Documentation**: Update docs continuously during development
4. **Validation**: Test each slice thoroughly before proceeding

### Risk Mitigation

- **Data Backup**: Full database backup before starting migration
- **Rollback Plan**: Keep current Express API available during development
- **Testing**: Comprehensive testing at each slice completion
- **Monitoring**: Close monitoring during initial deployment

### Resource Requirements

- **Development Time**: 7 weeks (vs 18 weeks for progressive migration)
- **Infrastructure**: Simplified deployment with fewer moving parts
- **Maintenance**: Significantly reduced operational complexity

This simplified approach takes advantage of having no active users to create a cleaner, more maintainable architecture while reducing both development time and operational complexity.
