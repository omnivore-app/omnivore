# NestJS Migration Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the NestJS migration, ensuring zero downtime, contract compliance, and feature parity throughout the dual-stack deployment period.

## Testing Philosophy

### Core Principles

1. **Contract-First Testing**: API contracts must remain identical during migration
2. **Dual-Stack Validation**: Both Express and NestJS must pass identical test suites
3. **Progressive Verification**: Each migration phase includes comprehensive testing
4. **Production Parity**: Testing environments mirror production deployment

## Testing Pyramid

```
                    E2E Tests
                 ┌─────────────────┐
                 │   User Journeys │
                 │   Cross-Service │
                 │   Performance   │
                 └─────────────────┘
               Integration Tests
          ┌─────────────────────────────┐
          │     API Contracts          │
          │     Database Integration   │
          │     Queue Processing       │
          │     External Services      │
          └─────────────────────────────┘
        Unit Tests
   ┌─────────────────────────────────────────┐
   │           Module Tests                  │
   │           Service Tests                 │
   │           Component Tests               │
   │           Business Logic Tests          │
   └─────────────────────────────────────────┘
```

## Phase-by-Phase Testing Strategy

### Phase 0: Foundation Testing (ARC-001)

**Objective**: Establish dual-stack testing infrastructure

#### Test Requirements

- [x] NestJS application boots successfully
- [x] Health endpoints respond (`/api/healthz`, `/api/metrics`)
- [x] Both Express and NestJS can run simultaneously
- [x] Docker Compose supports dual-stack deployment
- [x] CI pipeline builds both applications

#### Test Implementation

```typescript
// packages/api-nest/test/health.e2e-spec.ts
describe('Health Endpoints (E2E)', () => {
  it('should respond to health check', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/healthz')
      .expect(200)

    expect(response.body).toMatchObject({
      status: 'healthy',
      timestamp: expect.any(String),
      version: expect.any(String),
    })
  })
})
```

### Phase 1-2: Configuration & Observability (ARC-002, ARC-003)

**Objective**: Shared infrastructure testing

#### Test Requirements

- [x] Both stacks use identical configuration
- [x] Metrics collection from both applications
- [x] Log format consistency
- [x] Sentry error reporting functional

#### Configuration Contract Tests

```typescript
// packages/shared/config/test/config.contract-spec.ts
describe('Configuration Contract', () => {
  it('should provide identical config to Express and NestJS', () => {
    const expressConfig = loadExpressConfig()
    const nestConfig = loadNestConfig()

    expect(nestConfig.database).toEqual(expressConfig.database)
    expect(nestConfig.redis).toEqual(expressConfig.redis)
    expect(nestConfig.auth).toEqual(expressConfig.auth)
  })
})
```

### Phase 3: Authentication Migration (ARC-004)

**Objective**: Zero regression in auth flows

#### Critical Test Coverage

- [x] Login/logout flows (web & mobile)
- [x] OAuth providers (Google, Apple)
- [x] JWT token validation
- [x] Session management
- [x] Rate limiting
- [x] Security headers

#### Contract Tests

```typescript
// test/contracts/auth.contract-spec.ts
describe('Authentication Contract', () => {
  const authEndpoints = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/google',
    '/api/mobile-auth/login',
  ]

  authEndpoints.forEach((endpoint) => {
    describe(`${endpoint}`, () => {
      it('Express and NestJS return identical responses', async () => {
        const expressResponse = await testExpressEndpoint(endpoint, testData)
        const nestResponse = await testNestEndpoint(endpoint, testData)

        expect(nestResponse.status).toBe(expressResponse.status)
        expect(nestResponse.body).toEqual(expressResponse.body)
        expect(nestResponse.headers['set-cookie']).toEqual(
          expressResponse.headers['set-cookie']
        )
      })
    })
  })
})
```

### Phase 4: GraphQL Bridge (ARC-005)

**Objective**: Unified GraphQL endpoint with schema stitching

#### Test Requirements

- [x] Schema stitching works correctly
- [x] All existing queries/mutations functional
- [x] Performance parity
- [x] Error handling consistency

#### Schema Contract Tests

```typescript
// test/contracts/graphql.contract-spec.ts
describe('GraphQL Schema Contract', () => {
  const criticalQueries = [
    'query { viewer { id name email } }',
    'query { search(query: "test") { edges { node { title } } } }',
    'mutation { saveUrl(input: {url: "https://example.com"}) { ... } }',
  ]

  criticalQueries.forEach((query) => {
    it(`should return identical results for: ${query}`, async () => {
      const expressResult = await executeGraphQL(expressSchema, query)
      const nestResult = await executeGraphQL(stitchedSchema, query)

      expect(nestResult).toEqual(expressResult)
    })
  })
})
```

### Phase 5-6: Domain Migration (ARC-006, ARC-007)

**Objective**: Business logic parity

#### Test Strategy

- **Unit Tests**: Each NestJS service/module
- **Integration Tests**: Database operations
- **Contract Tests**: API endpoint parity
- **Performance Tests**: Response time benchmarks

#### Business Logic Tests

```typescript
// packages/api-nest/src/library/library.service.spec.ts
describe('LibraryService', () => {
  describe('saveArticle', () => {
    it('should save article with identical behavior to Express', async () => {
      const testUrl = 'https://example.com/article'

      // Test NestJS implementation
      const nestResult = await nestLibraryService.saveArticle(testUrl, user)

      // Compare with expected behavior (from Express implementation)
      expect(nestResult).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        url: testUrl,
        savedAt: expect.any(Date),
      })
    })
  })
})
```

### Phase 7-8: Queue Integration (ARC-008)

**Objective**: Background job processing parity

#### Test Requirements

- [x] Job scheduling identical
- [x] Job processing results identical
- [x] Error handling and retries consistent
- [x] Queue monitoring functional

#### Queue Contract Tests

```typescript
// test/contracts/queue.contract-spec.ts
describe('Queue Processing Contract', () => {
  it('should process content jobs identically', async () => {
    const testJob = { url: 'https://example.com', userId: 'test-user' }

    // Schedule job through both systems
    await expressQueueService.scheduleContentJob(testJob)
    await nestQueueService.scheduleContentJob(testJob)

    // Wait for processing
    await waitForJobCompletion()

    // Verify identical results
    const expressResult = await getProcessedContent(testJob.url)
    const nestResult = await getProcessedContent(testJob.url)

    expect(nestResult.title).toBe(expressResult.title)
    expect(nestResult.content).toBe(expressResult.content)
  })
})
```

## End-to-End Testing Strategy

### User Journey Tests

Critical user flows that must work throughout migration:

1. **Content Saving Flow**

   ```typescript
   describe('Content Saving E2E', () => {
     it('should save article from browser extension', async () => {
       // Browser extension saves URL
       const saveResponse = await request(app)
         .post('/api/article/save')
         .send({ url: 'https://example.com/article' })
         .expect(200)

       // Content should be processed
       await waitForContentProcessing(saveResponse.body.id)

       // User should see article in library
       const libraryResponse = await request(app)
         .get('/api/graphql')
         .send({ query: 'query { search { edges { node { title } } } }' })
         .expect(200)

       expect(libraryResponse.body.data.search.edges).toContainEqual(
         expect.objectContaining({
           node: expect.objectContaining({
             title: expect.any(String),
           }),
         })
       )
     })
   })
   ```

2. **Authentication Flow**
3. **Email Digest Generation**
4. **Mobile App Sync**

### Performance Testing

#### Load Testing

```yaml
# k6-load-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Steady state
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function() {
  // Test critical endpoints
  let response = http.get('https://api.omnivore.app/api/graphql');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## Testing Infrastructure

### Docker Compose for Testing

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  test-express-api:
    build:
      context: .
      dockerfile: packages/api/Dockerfile
    environment:
      - NODE_ENV=test
      - REDIS_URL=redis://test-redis:6379
      - PG_HOST=test-postgres
    depends_on:
      - test-postgres
      - test-redis

  test-nest-api:
    build:
      context: .
      dockerfile: packages/api-nest/Dockerfile
    environment:
      - NODE_ENV=test
      - REDIS_URL=redis://test-redis:6379
      - PG_HOST=test-postgres
    depends_on:
      - test-postgres
      - test-redis

  test-postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: omnivore_test
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres

  test-redis:
    image: redis:7-alpine
```

### CI Pipeline Integration

```yaml
# .github/workflows/migration-tests.yml
name: Migration Testing

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  dual-stack-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Start test infrastructure
        run: docker-compose -f docker-compose.test.yml up -d

      - name: Wait for services
        run: ./scripts/wait-for-services.sh

      - name: Run contract tests
        run: npm run test:contracts

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Performance benchmarks
        run: npm run test:performance

      - name: Cleanup
        run: docker-compose -f docker-compose.test.yml down
```

## Test Data Management

### Shared Test Fixtures

```typescript
// test/fixtures/shared-fixtures.ts
export const testUsers = {
  basicUser: {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
  },
  premiumUser: {
    id: 'test-user-2',
    email: 'premium@example.com',
    name: 'Premium User',
    subscription: 'premium',
  },
}

export const testArticles = {
  basicArticle: {
    url: 'https://example.com/article',
    title: 'Test Article',
    content: 'This is test content',
  },
}
```

### Database Seeding

```typescript
// test/setup/database-seeder.ts
export class DatabaseSeeder {
  static async seedTestData() {
    await this.clearDatabase()
    await this.seedUsers()
    await this.seedArticles()
    await this.seedLabels()
  }

  static async clearDatabase() {
    // Clean slate for each test run
  }
}
```

## Monitoring and Alerting

### Test Result Tracking

- **Test Coverage**: Minimum 80% for new NestJS modules
- **Performance Regression**: Alert if response times increase >20%
- **Error Rate**: Alert if error rate increases >1%
- **Contract Violations**: Fail CI if any contract test fails

### Migration Health Dashboard

```typescript
// monitoring/migration-dashboard.ts
export const migrationMetrics = {
  routesMigrated: 'percentage of routes handled by NestJS',
  testCoverage: 'test coverage of migrated modules',
  performanceParity: 'response time comparison Express vs NestJS',
  errorRates: 'error rates by stack',
}
```

## Success Criteria

### Phase Completion Criteria

Each migration phase is complete when:

- [x] All contract tests pass
- [x] Performance benchmarks met
- [x] E2E tests pass
- [x] Security scans clean
- [x] Load tests successful
- [x] Zero production incidents

### Final Migration Success

- [x] 100% traffic handled by NestJS
- [x] Express API decommissioned
- [x] All tests migrated to NestJS-only
- [x] Performance maintained or improved
- [x] Zero user-facing regressions
- [x] Documentation updated

## Risk Mitigation

### Rollback Strategy

- **Feature Flags**: Instant rollback to Express for specific routes
- **Blue-Green Deployment**: Full stack rollback capability
- **Database Compatibility**: Ensure schema changes are backward compatible

### Monitoring During Migration

- **Real-time Metrics**: Response times, error rates, throughput
- **User Experience**: Track user-reported issues
- **Business Metrics**: Ensure no impact on key business metrics

This comprehensive testing strategy ensures a safe, reliable migration to NestJS while maintaining the high quality and reliability that Omnivore users expect.
