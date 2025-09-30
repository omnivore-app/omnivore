# C4 Level 2: Container View

The platform is delivered as a small set of deployable containers. Today most functionality collapses into a single API container plus supporting workers.

```mermaid
graph LR
  subgraph Clients
    NextJS[Next.js Web]
    iOS[iOS App]
    Android[Android App]
    Extension[Browser Extension]
  end

  subgraph Backend[Backend Containers]
    API[Express + Apollo API]
    QueueMgr[BullMQ Queue Processor]
    ContentWorker[Puppeteer Content Worker]
    ImageProxy[Image Proxy Service]
    ML[ML/AI Services]
  end

  subgraph Data
    Postgres[(PostgreSQL)]
    Redis[(Redis)]
    Blob[Object Storage (GCS/S3)]
  end

  ThirdParty[Auth (Google/Apple), Email, Analytics, Payments]

  Clients -->|GraphQL + REST| API
  API -->|Jobs| QueueMgr
  QueueMgr -->|Dispatch| ContentWorker
  ContentWorker -->|Parsed Content| API
  API --> Postgres
  API --> Redis
  QueueMgr --> Redis
  ContentWorker --> Redis
  ContentWorker --> Blob
  API --> Blob
  API --> ThirdParty
```

## Container Responsibilities

| Container | Responsibilities | Technology | Status |
| --- | --- | --- | --- |
| Express + Apollo API | GraphQL schema, REST ingestion endpoints, auth, orchestration of services | Node.js 22, Express, Apollo Server, TypeORM | Mature but monolithic; lacks module boundaries and DI |
| Queue Processor | Listens to BullMQ queues (`queue-processor` package) for emails, digests, exports | Node.js workers, BullMQ | Scattered handlers, manual health checks, limited retry policies |
| Content Worker | Fetches & parses content, generates thumbnails, applies rules | Puppeteer Extra, custom services | Heavy coupling to API services, difficult to scale horizontally |
| Image Proxy | Resizes & caches images for clients | Express server | Independent container but minimal documentation |
| ML/AI Services | Handles AI summaries/explanations | FastAPI/Node (varies) | Mixed maturity; some endpoints mocked |
| PostgreSQL | Primary data store, TypeORM-managed schema | PostgreSQL 14+ | Schema managed via migrations, but seeds & migrations split across packages |
| Redis | Queue backend, cache, rate limiting | Redis 6+ | Shared for queues + caching; single point of failure |

## Built vs. Missing at Container Level

- ✅ Self-hostable Dockerfiles exist for API, DB, and workers.
- ⚠️ No NestJS container yet; API container mixes HTTP concerns with job orchestration.
- ⚠️ Queue management lacks visibility (no dashboard or metrics per queue).
- ⚠️ No centralized configuration management; environment variables spread across packages.
- 🚧 ML/AI components vary between services and need alignment once NestJS modules exist.

Use this view to discuss container consolidation (monolith-first) and identify where NestJS modules will land.
