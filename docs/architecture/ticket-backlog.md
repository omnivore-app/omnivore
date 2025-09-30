# Migration Ticket Backlog

Each ticket represents a deployable increment. IDs are placeholders; adjust to match your tracking system.

---

## ARC-001 Establish NestJS Skeleton
- **Problem/Objective**: Introduce a NestJS application that can run alongside the existing Express API without changing public contracts.
- **Approach**: Scaffold `packages/api-nest`, configure `@nestjs/platform-express` to mount inside the current server, wire shared TypeScript config, add health + metrics endpoints.
- **Acceptance Criteria**: `yarn dev` boots both Express and Nest; `/api/healthz` and `/api/metrics` respond via Nest; CI builds succeed.
- **Dependencies**: None.
- **Effort Estimate**: 1 dev-week.

## ARC-002 Shared Configuration & Logger Module
- **Problem/Objective**: Duplicate environment parsing and logging logic makes cross-framework operation brittle.
- **Approach**: Extract env schema & Winston logger setup into `packages/shared/config`; provide Nest `ConfigModule` and Express adapters.
- **Acceptance Criteria**: Both Express and Nest consume the shared config; logger outputs identical structure; documentation updated.
- **Dependencies**: ARC-001.
- **Effort Estimate**: 0.5 dev-week.

## ARC-003 Observability Foundations
- **Problem/Objective**: Sentry is disabled and metrics are limited; need consistent observability before migrating features.
- **Approach**: Implement Nest `ObservabilityModule` exposing Prometheus metrics, Sentry, request logging middleware; mirror instrumentation in Express using shared providers.
- **Acceptance Criteria**: Metrics and Sentry events emitted from both stacks in staging; dashboards updated.
- **Dependencies**: ARC-001, ARC-002.
- **Effort Estimate**: 0.5 dev-week.

## ARC-004 Auth Module Migration
- **Problem/Objective**: Authentication endpoints are complex and high-risk; migrate them to Nest with improved validation and guards.
- **Approach**: Build `AuthModule` with controllers for `/api/auth/*` & `/api/mobile-auth/*`, integrate OAuth providers, add DTO validation and rate limiting.
- **Acceptance Criteria**: Automated tests cover login/signup flows; Express routes proxy to Nest handlers; no regression in mobile/web sign-in metrics.
- **Dependencies**: ARC-001–003.
- **Effort Estimate**: 1.5 dev-weeks.

## ARC-005 GraphQL Gateway Bridge
- **Problem/Objective**: Need to serve a unified GraphQL endpoint while moving resolvers to Nest.
- **Approach**: Configure Nest `GraphQLModule` (Apollo driver), expose base schema, stitch with existing Express schema using Apollo Gateway or schema delegation; add contract tests.
- **Acceptance Criteria**: `/api/graphql` serves stitched schema; first Nest resolver (e.g., `viewer` query) delivered; tests verify both stacks cooperate.
- **Dependencies**: ARC-001.
- **Effort Estimate**: 1 dev-week.

## ARC-006 Library Module Increment 1
- **Problem/Objective**: Article save/read flows need modularization without breaking current clients.
- **Approach**: Implement `LibraryModule` in Nest covering `GET/PUT /api/page`, `POST /api/article/save`, and corresponding GraphQL queries/mutations; reuse services via shared providers.
- **Acceptance Criteria**: Feature toggled rollout in staging; contract tests for save/read succeed; Express handlers delegate to Nest.
- **Dependencies**: ARC-004, ARC-005.
- **Effort Estimate**: 2 dev-weeks.

## ARC-007 Ingestion Module + Queue Producers
- **Problem/Objective**: HTTP ingestion endpoints and queue producers are tightly coupled to Express; migrate to Nest for consistency.
- **Approach**: Create `IngestionModule` with controllers for `/api/content/*` and `/svc/pubsub/*`; wrap BullMQ producers using Nest providers.
- **Acceptance Criteria**: All ingestion endpoints return identical payloads; job metadata appears in Redis with new module; load tests match baseline.
- **Dependencies**: ARC-006.
- **Effort Estimate**: 1.5 dev-weeks.

## ARC-008 Queue Worker Integration
- **Problem/Objective**: Background workers need Nest DI to share services and error handling.
- **Approach**: Use `@nestjs/bullmq` (or custom module) to host ContentWorker and queue processors inside Nest; align lifecycle with Nest application context.
- **Acceptance Criteria**: Workers boot via Nest CLI command; graceful shutdown observed; monitoring dashboards updated.
- **Dependencies**: ARC-007.
- **Effort Estimate**: 1.5 dev-weeks.

## ARC-009 Notification & Digest Modules
- **Problem/Objective**: Digest and notification flows span REST, queues, and scheduled jobs.
- **Approach**: Implement `DigestModule` and `NotificationModule` with Nest schedulers, reuse service usage tracking, port `/api/digest/*`, `/api/notification/*`, `/api/tasks`.
- **Acceptance Criteria**: Scheduled jobs configured via Nest `@nestjs/schedule`; admin tasks protected by auth guard; integration tests updated.
- **Dependencies**: ARC-007, ARC-008.
- **Effort Estimate**: 2 dev-weeks.

## ARC-010 Express Decommission & Cleanup
- **Problem/Objective**: Finalize migration by removing Express bootstrap and consolidating tooling.
- **Approach**: Switch entrypoint to Nest-only server, delete unused routers, update Dockerfiles, adjust CI/CD scripts and docs.
- **Acceptance Criteria**: All traffic handled by Nest; Express code removed; docker-compose and self-hosting docs updated; regression tests green.
- **Dependencies**: ARC-004–ARC-009.
- **Effort Estimate**: 1 dev-week.

Keep this backlog living—split or reprioritize tasks as new information emerges.
