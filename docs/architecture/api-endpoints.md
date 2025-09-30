# API Surface Audit

The API exposes GraphQL and a set of REST endpoints. This table highlights the primary REST groupings with recommended actions for the NestJS migration. GraphQL operations inherit the recommendations of their backing services.

| Endpoint Group | Base Path(s) | Purpose | Recommendation | Notes |
| --- | --- | --- | --- | --- |
| Authentication | `/api/auth/*`, `/api/mobile-auth/*` | OAuth (Google/Apple), passwordless email, mobile bootstrap | **Refactor** into `AuthModule` with guards & DTO validation | High complexity, critical path; needs rate limiting & unified session management |
| Articles & Library | `/api/article/*`, `/api/page/*`, `/api/shortcuts/*`, `/api/user` | Save/read articles, text-to-speech, shortcuts, user prefs | **Refactor** under `LibraryModule` & `UserModule` | Ensure parity with GraphQL mutations, consolidate validation |
| Content Services | `/api/content/*`, `/svc/pubsub/content`, `/svc/pubsub/links`, `/svc/pubsub/newsletters`, `/svc/pubsub/rss-feed` | Content ingestion via Pub/Sub style endpoints | **Refactor** into `IngestionModule`; keep HTTP shape for backward compatibility | Introduce Nest controllers + message handlers; document auth expectations |
| AI & Summaries | `/api/ai-summary`, `/api/explain`, `/api/text-to-speech` | AI summaries, explanations, TTS generation | **Keep** semantics, **refactor** implementation for DI | Coordinate with ML services; add feature flags |
| Digest & Notifications | `/api/digest/*`, `/api/notification/*`, `/api/tasks`, `/svc/pubsub/emails` | Daily/weekly digests, notifications queue, admin tasks | **Refactor** into `DigestModule` & `NotificationModule` | Add audit logging, revisit direct task execution via HTTP |
| Export | `/api/export/*` | Export library data, OPML, CSV | **Keep** shape, **refactor** for streaming & auth guard | Ensure large exports are async with queue fallback |
| Integrations | `/api/integration/*`, `/svc/pubsub/webhooks`, `/svc/pubsub/upload`, `/svc/pubsub/user` | Webhooks, uploads, automation hooks | **Refactor** under `IntegrationModule` | Replace ad-hoc handlers with typed controllers & providers |
| Following & Social | `/svc/following` | Manage follower relationships | **Refactor** into `SocialModule` | Clarify contract, ensure rate limiting |
| Health & Metrics | `/_ah/health`, `/metrics`, `/api/debug-sentry` | Health checks & metrics | **Keep** with NestJS terminus + Prometheus | Re-enable Sentry safely |

## GraphQL Schema

- GraphQL schema lives in `packages/api/src/schema` with resolvers under `resolvers/`.
- Many resolvers call services directly and wrap TypeORM queries; no separation between transport and domain.
- Recommendation: migrate schema to NestJS `@nestjs/graphql`, adopt feature modules mirroring REST modules, move business logic into providers.

## Deprecation Targets

- `/api/debug-sentry` should become an authenticated admin-only mutation or test flag.
- Legacy Pub/Sub endpoints that mimic Google Cloud Pub/Sub push format can be replaced by internal queues once NestJS listeners exist; keep compatibility until mobile/web clients shift to new flows.

Keep this audit updated as endpoints move or contracts change.
