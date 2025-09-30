# NestJS Migration Roadmap

Goal: Introduce NestJS without blocking feature delivery, while keeping current clients functional and ensuring parity across GraphQL and REST surfaces. We will create a modular NestJS application that gradually replaces the Express server, running side-by-side until feature completeness is achieved.

## Guiding Principles

- **Monolith-first**: start with a single NestJS application containing feature modules, split only when scale demands.
- **Incremental cutover**: mount NestJS on the existing Express server via `@nestjs/platform-express`, proxying traffic module-by-module.
- **Shared contracts**: re-use DTOs, validation schemas, and TypeORM entities to avoid dual maintenance.
- **Automation-ready**: containerize NestJS alongside existing services; ensure Docker-compose can run both for local parity.

## Migration Phases & Timelines

| Phase | Duration (dev-weeks) | Deliverables | Notes |
| --- | --- | --- | --- |
| 0. Discovery & Foundations | 1 | NestJS project scaffold in `packages/api-nest`, shared config module, health/metrics endpoints | Run as sibling service behind feature flag; share env-loader |
| 1. Platform Services | 2 | `AppModule`, `ConfigModule`, `LoggerModule`, `ObservabilityModule`; re-enable Sentry & Prometheus via Nest | Keep Express as primary server; expose `/metrics` and `/healthz` from Nest |
| 2. Authentication Cutover | 3 | `AuthModule` (web + mobile), session guards, DTO validation; migrate `/api/auth/*` & `/api/mobile-auth/*` | Use Nest controllers; Express routes proxy to Nest until clients updated |
| 3. Library & User Domain | 4 | `LibraryModule`, `UserModule`, GraphQL resolvers migrated to Nest `@Resolver`; `article/page/shortcuts` endpoints | Implement hybrid GraphQL server (Nest Apollo) while Express keeps serving remaining schema via schema stitching |
| 4. Content Ingestion & Workers | 3 | `IngestionModule`, background queue module, bridge to BullMQ, ContentWorker orchestrated through Nest providers | Run Nest queue processor, gradually decommission legacy worker bootstrap |
| 5. Notifications & Integrations | 3 | `DigestModule`, `NotificationModule`, `IntegrationModule`; migrate cron/task APIs | Ensure email schedules triggered by Nest cron jobs |
| 6. Full Cutover & Cleanup | 2 | Deprecate Express router, consolidate GraphQL schema, remove dual bootstrap | Update Dockerfiles, documentation, monitoring |

Total estimate: **18 developer-weeks** assuming one senior engineer leading with support. Work can run in parallel (e.g., Phase 3 & 4) once foundations are stable.

## Incremental Delivery Strategy

1. **Bootstrap Nest**: create `packages/api-nest` with shared tsconfig, re-use TypeORM configuration via shared module (`packages/shared/config`).
2. **Dual-run**: mount Nest app inside Express (`app.use('/api/v2', nestServer)`) and gradually route traffic via reverse proxy rules (e.g., `ExpressRouter.use('/auth', proxyToNest)`).
3. **Shared Entities**: extract TypeORM entities & repositories into `packages/shared/db` so both frameworks share migrations and models.
4. **Schema Bridging**: use Apollo Gateway or schema stitching so GraphQL clients query a unified endpoint while underlying resolvers transition.
5. **Worker Alignment**: wrap BullMQ producers/consumers with Nest modules (`@nestjs/bullmq`), enabling dependency injection for job handlers.
6. **Retire Express**: once all routers and resolvers live in Nest, simplify bootstrap to Nest-only HTTP server and remove legacy `server.ts`.

## Risks & Mitigations

- **Dual route handling complexity** → Introduce integration tests to verify routing under both Express and Nest.
- **TypeORM connection sharing** → Establish a shared connection factory module to avoid duplicate connections.
- **Client regressions** → Maintain contract tests per endpoint, keep `/api/*` paths identical while internals change.
- **Team learning curve** → Document Nest patterns early, add lint rules & schematics for module creation.

## Success Criteria

- All HTTP traffic handled by NestJS without changes to client URLs.
- Background workers instantiated via Nest modules.
- SLOs maintained or improved (latency, error rate).
- Documentation updated (this folder + README) and exported to Basecamp at each milestone.
