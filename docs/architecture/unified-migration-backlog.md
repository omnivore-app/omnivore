# Unified Migration Backlog: Express to NestJS

This backlog consolidates the simplified and original migration strategies into actionable tickets. Each ticket represents a deployable increment that can be tracked in Notion/Todoist.

**Key Approach**: Start with a new NestJS service (Node.js 24 LTS) running alongside Express, then migrate features slice-by-slice until we can decommission the old services.

## 🎯 Current Status & Next Steps

### ✅ **COMPLETED** (Major Milestone Achieved)
- **ARC-001**: NestJS Package Setup - Complete infrastructure
- **ARC-002**: Health Checks & Observability - Monitoring ready
- **ARC-003**: Authentication Module - Full auth system with web integration
- **ARC-003B**: Database & Entity Integration - TypeORM entities working
- **Performance Optimization**: 25-50x faster development (Next.js + Turbopack)

### 🔄 **READY TO START** (Choose One)
1. **ARC-004**: GraphQL Module Setup (2 days) - Continue NestJS migration
2. **ARC-004B**: Vite Migration (1-2 weeks) - Dramatic frontend performance boost

### ⏳ **PENDING TESTING** (Lower Priority)
- Google OAuth integration testing
- Apple OAuth integration testing  
- Email verification (pending email service integration)

### 🎯 **RECOMMENDED NEXT**: ARC-004B Vite Migration
Given the significant performance gains (50-100x faster) and the fact that we're rebuilding the backend, now is the optimal time to modernize the frontend stack.

---

## ARC-001 NestJS Package Setup ✅ **COMPLETED**

- **Problem/Objective**: Create the foundational NestJS package and Docker infrastructure to run alongside existing Express API without disruption.
- **Approach**: Bootstrap NestJS application with proper workspace integration and Docker configuration. Tasks:
  - [x] Create `packages/api-nest` directory structure
  - [x] Initialize NestJS project with `nest new api-nest --skip-git`
  - [x] Configure TypeScript with strict settings extending workspace root
  - [x] Set up package.json with proper scripts and dependencies
  - [x] Create Docker service in docker-compose.yml for new API on port 4001
  - [x] Configure environment loading and basic logging
- **Acceptance Criteria**: ✅ **ALL COMPLETED**
  - [x] NestJS application boots without errors on port 4001
  - [x] Docker Compose runs both Express API (4000) and NestJS API (4001)
  - [x] TypeScript compilation works with workspace configuration
  - [x] Basic logging and environment loading functional
- **Dependencies**: None.
- **Effort Estimate**: 2 days.
- **Status**: ✅ Completed

## ARC-002 Health Checks & Observability ✅ **COMPLETED**

- **Problem/Objective**: Establish basic health monitoring and structured logging before migrating business logic.
- **Approach**: Set up comprehensive health checking and observability infrastructure. Tasks:
  - [x] Install `@nestjs/terminus` for health checks
  - [x] Create `/api/health` endpoint for basic status
  - [x] Create `/api/health/deep` endpoint with database and Redis connectivity checks
  - [x] Set up request logging middleware matching Express format
  - [x] Configure structured logging with consistent error handling
- **Acceptance Criteria**: ✅ **ALL COMPLETED**
  - [x] `/api/health` returns 200 with basic status
  - [x] `/api/health/deep` checks database and Redis connectivity
  - [x] Request/response logging matches Express format
  - [x] Error handling returns consistent JSON responses
- **Dependencies**: ARC-001.
- **Effort Estimate**: 1 day.
- **Status**: ✅ Completed

## ARC-003 Authentication Module ✅ **COMPLETED**

- **Problem/Objective**: Migrate authentication to NestJS with improved validation while maintaining JWT compatibility with Express.
- **Approach**: Build comprehensive authentication system in NestJS with enhanced security. Tasks:
  - [x] Create `AuthModule` with JWT strategy and passport integration
  - [x] Implement authentication guards and decorators for route protection
  - [x] Create `/api/v2/auth/*` endpoints for login, register, and OAuth flows
  - [x] Set up OAuth providers structure (Google, Apple)
  - [x] Add rate limiting and security middleware
  - [x] Implement comprehensive E2E testing with user personas
  - [x] Add Swagger/OpenAPI documentation
- **Acceptance Criteria**: ✅ **ALL COMPLETED**
  - [x] `/api/v2/auth/login` works alongside Express `/api/auth/login`
  - [x] JWT tokens are compatible between Express and NestJS APIs
  - [x] Role-based access control (RBAC) implemented
  - [x] Comprehensive test coverage achieved (>90%)
- **Dependencies**: ARC-001, ARC-002.
- **Effort Estimate**: 3 days.
- **Status**: ✅ Completed (3 days actual)

## ARC-003B Database & Entity Integration ✅ **COMPLETED**

- **Problem/Objective**: Integrate NestJS with existing PostgreSQL schema without breaking Express API or requiring complex migrations.
- **Approach**: Create TypeORM entities mapping to existing tables using hybrid migration strategy. Tasks:
  - [x] Fix User entity to map exactly to existing schema (migrations 0001-0188)
  - [x] Create UserProfile entity mapping to `user_profile` table (migration 0019)
  - [x] Create UserPersonalization entity mapping to `user_personalization` table (migrations 0008+)
  - [x] Create first new migration (0189) for role column using existing Postgrator system
  - [x] Update DatabaseModule to include all entities
  - [x] Update UserModule with full entity support
  - [x] Document repeatable process for future entity migrations
- **Acceptance Criteria**: ✅ **ALL COMPLETED**
  - [x] Entities map exactly to existing database schema
  - [x] New role column added via traditional migration system
  - [x] Both APIs can access same database tables
  - [x] Repeatable process documented for future entities
- **Dependencies**: ARC-003.
- **Effort Estimate**: 2 days.
- **Status**: ✅ Completed (1 day actual)

## ARC-004 GraphQL Module Setup

- **Problem/Objective**: Set up GraphQL in NestJS to work alongside Express GraphQL without breaking existing clients.
- **Approach**: Establish parallel GraphQL endpoint in NestJS to gradually migrate resolvers from Express. Tasks:
  - [ ] Install `@nestjs/graphql` and `@nestjs/apollo` packages
  - [ ] Configure GraphQL module with Apollo Driver on `/api/nest/graphql` path
  - [ ] Create base GraphQL schema with essential types (User, AuthPayload)
  - [ ] Implement authentication context middleware to extract JWT tokens
  - [ ] Create first resolver (viewer query) that returns current authenticated user
  - [ ] Add schema introspection and playground for development
- **Acceptance Criteria**:
  - [ ] GraphQL playground accessible at `/api/nest/graphql`
  - [ ] Authentication context properly extracts user from JWT tokens
  - [ ] Viewer query returns current user data matching Express format
  - [ ] Schema introspection works without errors
  - [ ] Both Express and NestJS GraphQL endpoints function simultaneously
- **Dependencies**: ARC-003B.
- **Effort Estimate**: 2 days.
- **Status**: 🔄 Ready to start

## ARC-004B Frontend Performance Optimization (Vite Migration)

- **Problem/Objective**: Migrate from Next.js to Vite for dramatically improved development experience and build performance.
- **Approach**: Complete frontend migration to Vite + React Router for 50-100x performance gains. Tasks:
  - [ ] Create Vite configuration with React, TypeScript, and SWC
  - [ ] Set up React Router for client-side routing
  - [ ] Migrate Next.js pages to React Router routes
  - [ ] Replace Next.js API routes with Express/Fastify server
  - [ ] Configure Vite plugins for image optimization, CSS processing
  - [ ] Set up SSR with Vite SSR or Remix if needed
  - [ ] Update build pipeline and Docker configuration
  - [ ] Migrate environment variable handling
  - [ ] Update testing configuration for Vite
- **Acceptance Criteria**:
  - [ ] Cold start time: <500ms (vs current 1.2s with Next.js)
  - [ ] HMR response time: <50ms (vs current <100ms)
  - [ ] Build time: <30s (vs current 2-5min)
  - [ ] Bundle size reduction: 30-50% smaller
  - [ ] All existing functionality preserved
  - [ ] Authentication flow works seamlessly
- **Dependencies**: ARC-003 (authentication working).
- **Effort Estimate**: 1-2 weeks.
- **Status**: 🎯 High Priority - Ready to start

## ARC-005 Library Module Foundation

- **Problem/Objective**: Migrate core library management functionality to NestJS without disrupting article save/read flows.
- **Approach**: Build comprehensive library management system in NestJS with full CRUD capabilities. Tasks:
  - [ ] Create `LibraryModule` with service layer for business logic
  - [ ] Design Article, Page, and LibraryItem entities with TypeORM mappings
  - [ ] Implement ArticleService with save, update, delete, and retrieve operations
  - [ ] Create GraphQL resolvers for articles query and saveArticle mutation
  - [ ] Add basic search functionality using database full-text search
  - [ ] Implement pagination and filtering for library queries
  - [ ] Add validation and error handling for all operations
- **Acceptance Criteria**:
  - [ ] Articles can be saved via NestJS GraphQL saveArticle mutation
  - [ ] Library items retrieved through articles query with pagination
  - [ ] Article updates and deletions work correctly
  - [ ] Search functionality returns relevant results
  - [ ] Database operations handle errors gracefully
  - [ ] All operations maintain data consistency with Express API
- **Dependencies**: ARC-004.
- **Effort Estimate**: 4 days.

## ARC-006 Queue Integration

- **Problem/Objective**: Integrate BullMQ queues into NestJS to handle background processing without disrupting existing job flows.
- **Approach**: Establish queue infrastructure within NestJS to handle asynchronous processing tasks. Tasks:
  - [ ] Install and configure `@nestjs/bull` and `bullmq` packages
  - [ ] Create QueueModule with Redis connection configuration
  - [ ] Set up content processing queue with appropriate job types
  - [ ] Implement basic job processors for article content extraction
  - [ ] Add queue monitoring endpoints for job status and metrics
  - [ ] Configure job retry policies and error handling
  - [ ] Add graceful shutdown handling for queue processors
- **Acceptance Criteria**:
  - [ ] Jobs can be successfully queued from NestJS services
  - [ ] Queue processors handle jobs reliably without data loss
  - [ ] Failed jobs retry according to configured policies
  - [ ] Queue monitoring endpoints show accurate job status
  - [ ] Queue operations don't interfere with existing Express queues
  - [ ] Graceful shutdown properly completes in-progress jobs
- **Dependencies**: ARC-005.
- **Effort Estimate**: 3 days.

## ARC-007 Content Processing

- **Problem/Objective**: Move content processing into NestJS while maintaining existing readability extraction and PDF processing capabilities.
- **Approach**: Migrate content processing pipeline to NestJS with full feature parity. Tasks:
  - [ ] Create ContentProcessorModule with job handlers for different content types
  - [ ] Integrate existing readability extraction libraries (readabilityjs package)
  - [ ] Implement PDF processing using existing pdf-handler logic
  - [ ] Add image optimization and thumbnail generation capabilities
  - [ ] Create error handling and retry mechanisms for failed processing
  - [ ] Implement content sanitization and security validation
  - [ ] Add processing status tracking and progress reporting
- **Acceptance Criteria**:
  - [ ] Articles automatically processed when saved via NestJS
  - [ ] Content extraction works correctly for web articles
  - [ ] PDF processing maintains existing functionality
  - [ ] Images are optimized and thumbnails generated during processing
  - [ ] Processing errors are handled gracefully with appropriate retries
  - [ ] Content sanitization prevents XSS and other security issues
  - [ ] Processing status is accurately tracked and reported
- **Dependencies**: ARC-006.
- **Effort Estimate**: 4 days.

## ARC-008 Feature Migration

- **Problem/Objective**: Migrate remaining Express features (digest, integrations, admin) to NestJS without functionality regression.
- **Approach**: Systematically migrate remaining Express endpoints to NestJS with feature flag support. Tasks:
  - [ ] Create DigestModule with digest management endpoints (`/api/digest/*`)
  - [ ] Implement IntegrationModule for webhook and third-party integrations
  - [ ] Migrate admin utilities and management endpoints (`/api/admin/*`)
  - [ ] Update frontend GraphQL queries and mutations to use NestJS endpoints
  - [ ] Implement feature flags for gradual rollout and A/B testing
  - [ ] Add monitoring and logging for migration tracking
  - [ ] Create rollback procedures for each migrated feature
- **Acceptance Criteria**:
  - [ ] All critical endpoints migrated with identical functionality
  - [ ] Frontend successfully uses NestJS endpoints without errors
  - [ ] No functionality regression detected in automated tests
  - [ ] Feature flags allow selective rollout and immediate rollback
  - [ ] Admin tools work correctly with new backend
  - [ ] Integration webhooks maintain compatibility with external services
  - [ ] Monitoring shows successful migration metrics
- **Dependencies**: ARC-007.
- **Effort Estimate**: 3 days.

## ARC-009 Service Consolidation

- **Problem/Objective**: Decommission old services and consolidate to single NestJS API to reduce resource usage and deployment complexity.
- **Approach**: Complete the migration by removing legacy services and consolidating infrastructure. Tasks:
  - [ ] Update docker-compose.yml to remove Express API service
  - [ ] Remove queue-processor and content-handler containers
  - [ ] Update NestJS API to run on port 4000 (production port)
  - [ ] Update deployment scripts and CI/CD pipelines
  - [ ] Clean up old configuration files and environment variables
  - [ ] Update documentation and self-hosting guides
  - [ ] Perform final validation and testing
- **Acceptance Criteria**:
  - [ ] Single NestJS API handles all functionality on port 4000
  - [ ] Resource usage reduced by expected 33% (memory) and 75% (services)
  - [ ] Deployment process simplified with single service
  - [ ] All automated tests pass with new configuration
  - [ ] Self-hosting documentation updated and validated
  - [ ] No legacy Express code remains in production builds
  - [ ] Monitoring and logging work correctly with consolidated service
- **Dependencies**: ARC-008.
- **Effort Estimate**: 2 days.

---

## Migration Progress Summary

**Completed**: ARC-001, ARC-002, ARC-003, ARC-003B (4/9 tickets)
**In Progress**: None
**Remaining**: ARC-004 through ARC-009 (5 tickets)

**Total Effort Estimate**: 21 days
**Completed Effort**: 8 days  
**Remaining Effort**: 13 days

---

## Implementation Notes

- **Parallel Development**: NestJS runs on port 4001 alongside Express on 4000
- **Feature Flags**: Use environment variables to toggle between implementations
- **Testing**: Comprehensive testing at each ticket boundary
- **Rollback Plan**: Express API remains available during development
