# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Omnivore is an open-source, self-hosted read-it-later application. The monorepo contains 24+ packages managed with **Yarn 1.22.19** and **Lerna**. Primary languages are TypeScript/JavaScript, with Swift (iOS), Kotlin (Android), and Go (imageproxy).

## Commands

### Development Setup
```bash
# Start all backend services (PostgreSQL, Redis, API, Content-Fetch)
docker compose up

# Frontend development against dockerized backend
cd packages/web && cp .env.template .env.local && yarn dev

# Run API dev server with hot-reload
make api          # or: yarn workspace @omnivore/api dev

# Run web dev server
make web          # or: yarn workspace @omnivore/web dev

# Run queue processor
make qp           # or: yarn workspace @omnivore/api dev_qp
```

### Build
```bash
yarn build        # Build all packages via Lerna

# Build a specific package
yarn workspace @omnivore/api build
yarn workspace @omnivore/web build

# Build content-fetch service (includes dependencies)
make content_fetch   # builds content-handler, puppeteer-parse, content-fetch in order
```

### Testing
```bash
yarn test         # Run all tests via Lerna (streaming output)

# Run tests for a specific package
lerna run test --scope=@omnivore/api

# Run a single test file (from within a package directory)
yarn mocha -r ts-node/register --config mocha-config.json test/path/to/file.test.ts

# Type checking
yarn workspace @omnivore/api test:typecheck
```

Tests require PostgreSQL and Redis — use `docker compose -f docker-compose-test.yml up` for a test environment.

### Linting
```bash
yarn lint             # Lint all packages (ESLint, parallel)
yarn workspace @omnivore/api lint
yarn workspace @omnivore/api lint:fix   # Auto-fix
```

Code style: no semicolons, single quotes (enforced by Prettier + ESLint with `@typescript-eslint`).

## Architecture

### Core Services

**`packages/api`** — The central backend. GraphQL API (Apollo Server 3 on Express), running on port 4000 (8080 in Docker). Connects to PostgreSQL via TypeORM and Redis via ioredis/BullMQ. Exposes both a `/graphql` endpoint and REST routers under `/api/` and `/svc/` prefixes.

**`packages/web`** — Next.js 14 frontend (React 18, TypeScript). Runs on port 3000. Uses SWR + TanStack Query for data fetching, Stitches for CSS-in-JS, and Radix UI components. Communicates with the API exclusively via GraphQL.

**`packages/content-fetch`** — Async microservice for fetching and processing web content. Picks jobs off a BullMQ/Redis queue. Depends on `puppeteer-parse` and `content-handler`.

**`packages/puppeteer-parse`** — Headless Chromium via Puppeteer for rendering and extracting page content. Called by `content-fetch`.

**`packages/content-handler`** — Shared utilities for HTML parsing, sanitization, and Mozilla Readability integration. Used by both `api` and `puppeteer-parse`.

**`packages/db`** — Database schema and migrations via Postgrator. Migration files live here; TypeORM entities live in `packages/api/src/entity/`.

### Specialized Handlers (Cloud Function-style)

These packages run independently and are invoked via HTTP or queue:
- `rss-handler` — RSS feed polling
- `inbound-email-handler` — Email ingestion
- `import-handler` / `export-handler` — Data migration/export jobs
- `pdf-handler` — PDF processing
- `thumbnail-handler` — Thumbnail generation
- `text-to-speech` — TTS audio generation
- `integration-handler` — Third-party integrations (Logseq, Obsidian, Readwise, etc.)
- `rule-handler` — User-defined automation rules

### Shared Libraries

- `packages/liqe` — Query parser/filter engine for Omnivore's search syntax
- `packages/readabilityjs` — Fork of Mozilla Readability
- `packages/utils` — Shared TypeScript utilities
- `packages/appreader` — WebView bundle (Next.js app) embedded in iOS and Android apps

### Mobile and Native

- `apple/` — iOS/macOS app in Swift/SwiftUI; uses `packages/appreader` bundle
- `android/` — Android app in Kotlin; uses `packages/appreader` bundle
- `imageproxy/` — Go service for proxying and caching images

### Data Flow

```
Web/Mobile client
  → GraphQL API (Apollo/Express) → PostgreSQL (TypeORM)
                                 → Redis (cache + BullMQ queues)
  → BullMQ queue workers
  → content-fetch → puppeteer-parse → content-handler → stored article HTML
```

### Key Patterns

- **GraphQL schema** is defined in `packages/api/src/schema/` and generated into `packages/api/src/generated/schema.graphql`
- **Resolvers** are in `packages/api/src/resolvers/`
- **REST service routes** (internal service-to-service) are under `packages/api/src/routers/svc/`
- **TypeORM entities** mirror the PostgreSQL schema in `packages/api/src/entity/`
- **Queue jobs** are defined in `packages/api/src/queue-processor.ts` and processed by BullMQ workers

### Environment

Key env vars (see `packages/api/.env.example` and `packages/web/.env.template`):
- `PG_HOST/PG_USER/PG_PASSWORD/PG_DB` — PostgreSQL connection
- `REDIS_URL` — Redis connection (used for both cache and queues)
- `JWT_SECRET` — Token signing
- `CONTENT_FETCH_URL` — URL of the content-fetch service
- `CLIENT_URL` — Frontend URL (for CORS and redirects)
- `IMAGE_PROXY_SECRET` / `IMAGE_PROXY_URL` — Image proxy config
