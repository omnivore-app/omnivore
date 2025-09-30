# C4 Level 1: System Context

The Omnivore platform helps readers capture, organize, and consume content across web, mobile, and email entry points. It integrates background processing and third-party services to enrich content and deliver personalized experiences.

```mermaid
graph TB
  subgraph OmnivorePlatform[Omnivore Platform]
    API[(Node.js GraphQL + REST API)]
    Workers[Background Workers & BullMQ Queues]
    WebApp[Next.js Web Client]
    MobileClients[iOS & Android Apps]
    BrowserExtension[Browser Extension]
    DB[(PostgreSQL)]
    Cache[(Redis)]
  end

  WebUser["Reader (Web)"] --> WebApp
  MobileUser["Reader (Mobile)"] --> MobileClients
  BrowserClipper["Browser Clipper User"] --> BrowserExtension
  EmailContributor["Email/Newsletter Sender"] --> API
  AutomationUser["Integrations / Automations"] --> API
  SupportTeam["Support & Ops"] --> API

  WebApp --> API
  MobileClients --> API
  BrowserExtension --> API
  API --> DB
  API --> Cache
  Workers --> DB
  Workers --> Cache
  API -->|Queues tasks| Workers
  ExternalContent["External Content Sources (Web, RSS, YouTube, PDF, Email)"] --> Workers
  ThirdPartyServices["3rd-party Services (Auth providers, Email, Analytics, Storage)"] --> API
```

## Observations

- The single API process fronts **both GraphQL** (Apollo) and **numerous REST endpoints**, acting as the integration hub for all clients.
- Background work (content parsing, enrichment, notifications) relies on BullMQ workers backed by Redis and Puppeteer-powered scraping.
- PostgreSQL is the system of record; Redis is used for queues and transient state.
- Multiple ingestion channels (browser extension, email, integrations) all fan into the same API/queue pipeline.

## Built vs. Missing

| Area | Current State | Gaps / Risks |
| --- | --- | --- |
| Core API | Express + Apollo server with modular routers and services | Lacks enforced domain boundaries, limited typing, manual lifecycle management |
| Background Processing | ContentWorker orchestrates parsing with Puppeteer, queue handlers in `queue-processor` | Error handling dispersed, scaling knobs manual, no central scheduler |
| Clients | Next.js web app, native mobile apps, browser extension present | Feature parity varies; API changes must avoid breaking older clients |
| Observability | Prometheus middleware, Winston logging, Sentry hooks (mostly disabled) | Sentry disabled, metrics limited to HTTP layer, tracing partial |
| Documentation | Scattered markdown, implicit architecture knowledge | No consolidated C4 views or migration guardrails (addressed by this doc set) |
| Deployment | Dockerfiles per service, docker-compose for dev, App Engine references | Need unified self-hosting story and production-ready container orchestration guidance |

This context view orients contributors before diving into container- and component-level discussions.
