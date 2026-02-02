# Current State Audit

**Purpose**: Ground-truth documentation of what exists *in code today*, what is broken, and what needs to be fixed to make the system reliable.

**Last Updated**: 2026-01-31

## Executive Summary

This repository has a fairly complete **command surface area** (queue/analyze/content/report/omnivore/db/config/init/doctor/version), plus an intended “3-layer” architecture:

1. **Omnivore** as the content source-of-truth (GraphQL)
2. **SQLite** as coordination + immutable analysis snapshot storage
3. **Git-tracked Markdown** as human-editable, permanent output

The core analysis pipeline now works end-to-end in a clean checkout:

- `pnpm run typecheck` / `pnpm test` / `pnpm run build` pass.
- The built CLI (`dist/bin/omc.js`) can initialize the tracking DB schema.
- Commands follow the `BaseCommand.execute({ ...args, ...flags })` contract.
- Documentation reflects the current `omc analyze auto` automation path and optional JSONL output.

## Architecture (As Implemented)

### Layer 1: Omnivore (Source of Truth)

- Implementation: `lib/omnivore/client.js`
- Used by CLI commands via the TypeScript re-export surface (`src/lib/omnivore/client.ts`) in most places.
- Auth is via `.env` (`OMNIVORE_API_URL`, `OMNIVORE_API_KEY`) loaded by `dotenv` at module import time.

### Layer 2: SQLite (Coordination + Snapshots)

- Default DB path (source): `src/storage/database.ts` uses `data/omnivore-content.db`.
- Schema: `src/storage/schema/tracking-schema.sql`
- Repository: `src/storage/AnalysisQueueRepository.ts`

The DB is used for:
- Queue state (`pending`/`in_progress`/`completed`/`failed`)
- Retry counters and error messages
- Immutable snapshot of analysis output (`analysis_json`) and pointer to Markdown (`markdown_path`)

### Layer 3: Markdown Output (Git-tracked)

- Writer: `src/storage/AnalysisWriter.ts`
- The current pipeline writes **Markdown** by default.
- Optional machine-readable JSONL is available via flags (`omc analyze auto --jsonl` / `omc analyze complete --jsonl`).
- Markdown filename uses `savedAt` date and the Omnivore `articleSlug` when available (falls back to title-derived slug).

## Command Inventory (As Implemented)

Commands are defined under `src/commands/**` and built/run via oclif (`index.ts`).

### `omc queue`

- `omc queue add` (`src/commands/queue/add.ts`): adds articles to tracking queue (hours/label/url/slug).
- `omc queue list` (`src/commands/queue/list.ts`): lists queue entries (optional `--status`).
- `omc queue stats` (`src/commands/queue/stats.ts`): queue stats (optional `--detailed`).
- `omc queue reset` (`src/commands/queue/reset.ts`): resets a specific job to `pending`.
- `omc queue remove` (`src/commands/queue/remove.ts`): deletes a job.
- `omc queue clear` (`src/commands/queue/clear.ts`): bulk delete by status or all.
- `omc queue export` (`src/commands/queue/export.ts`): prints queue rows as JSONL (or JSON array with `--json`).
- `omc queue import` (`src/commands/queue/import.ts`): imports JSONL into the queue.

### `omc analyze`

- `omc analyze run` (`src/commands/analyze/run.ts`):
  - Selects jobs (pending by default; pending+failed with `--all`; single with `--article-id`).
  - Marks selected jobs `in_progress`.
  - Fetches Omnivore article metadata and writes `temp/{articleSlug}.jsonl` stub files.
  - Outputs agent parameter JSON describing the stub files.
- `omc analyze complete` (`src/commands/analyze/complete.ts`):
  - Finds `temp/*.jsonl` files that contain an `analysis` field.
  - Writes Markdown via `AnalysisWriter`.
  - Stores `analysis_json` + `markdown_path` in SQLite via `AnalysisQueueRepository.storeAnalysis`.
  - Deletes temp files unless `--keep-temp`.
- `omc analyze status` (`src/commands/analyze/status.ts`): shows in-progress jobs + current `temp/*.jsonl`.
- `omc analyze watch` (`src/commands/analyze/watch.ts`): polls queue stats until *queue empty* (pending=0 and in_progress=0).
- `omc analyze retry` (`src/commands/analyze/retry.ts`): resets failed jobs to pending.

### `omc content` (Read/Export/Sync)

- `omc content list` (`src/commands/content/list.ts`): lists completed jobs; optional filters (since/topic).
- `omc content show` (`src/commands/content/show.ts`): prints Markdown for one article ID.
- `omc content search` (`src/commands/content/search.ts`): searches completed analyses (title/analysis/content/all).
- `omc content export` (`src/commands/content/export.ts`): export data for blogging workflows (implementation varies).
- `omc content sync` (`src/commands/content/sync.ts`): syncs analysis summaries back to Omnivore (description field) and optionally creates/updates a NOTE highlight from Markdown.

### `omc report` (Categorized Analysis / Aggregations)

This is the “categorized analysis” surface area: reports summarize analyses by topic/sentiment/time.

- `omc report corpus` (`src/commands/report/corpus.ts`): topic + sentiment + contentType distributions.
- `omc report topics` (`src/commands/report/topics.ts`): topic distribution.
- `omc report trends` (`src/commands/report/trends.ts`): trends over time (based on saved/completed timestamps).
- `omc report sentiment` (`src/commands/report/sentiment.ts`): sentiment distribution.
- `omc report monetization` (`src/commands/report/monetization.ts`): monetization angle aggregation.
- `omc report custom` (`src/commands/report/custom.ts`): custom SQL against the tracking DB.
- `omc report export` (`src/commands/report/export.ts`): export report output (format varies).

### `omc omnivore`

Direct API operations:
- `omc omnivore list`, `search`, `get`, `update`
- highlights: `omnivore highlight add/list`
- notes: `omnivore note add/get/update`

### `omc db`

DB maintenance:
- `migrate`, `schema`, `stats`, `check`, `vacuum`, `backup`, `restore`, `reset`, `seed`

### `omc config`

Config management:
- `show`, `get`, `set`, `test`, `validate`, `env list`, `env use`

### Misc

- `omc init` (`src/commands/init.ts`): basic setup wizard (directories, db, env).
- `omc doctor` (`src/commands/doctor.ts`): health checks.
- `omc version` (`src/commands/version.ts`): version/system info.

## End-to-End Workflow (Current)

1. Populate queue: `omc queue add --hours 24` (or `--label`, `--url`, `--slug`).
2. Prepare stubs: `omc analyze run --batch-size 5` (creates `temp/{slug}.jsonl`).
3. Run external agent(s): read stub, fetch content, add `analysis` field to the stub JSON.
4. Persist results: `omc analyze complete` (writes `content/analysis/*.md`, updates DB, cleans temp files).
5. View/search: `omc content list`, `omc content search`, `omc content show <article-id>`.
6. Report: `omc report topics` / `omc report trends` / etc.
7. Sync back to Omnivore: `omc content sync --all --create-notes`.

## Issues / Fix List (Prioritized)

### Resolved (as of 2026-01-31)

- TypeScript aliases normalized (`@omc-types/*` instead of `@types/*`); `pnpm run typecheck` passes.
- Tracking schema resolution works in `dist/` builds; built CLI can initialize the DB.
- Commands follow `BaseCommand.execute({ ...args, ...flags })`.
- Docs and scripts align with the built CLI and the current analysis workflow.
- Agent-friendly raw content output via `omc omnivore get --content`.
- Optional JSONL output via `--jsonl` flags (`omc analyze auto --jsonl` / `omc analyze complete --jsonl`).
- Markdown filename contract prefers Omnivore slug (falls back to title-derived slug).
- `omc queue add --hours` paginates until the cutoff is reached.
- Markdown front-matter emitted via `gray-matter` (valid YAML for common edge cases).
- GraphQL error handling normalized via `checkGraphQLResult(...)`.
- Typed GraphQL documents/codegen removed from the runtime path (single client source-of-truth).

### Remaining / Next

- Automated content generation and publishing phases (Phase 5/6).
- Decide whether to keep or retire `src/lib/ai/anthropic-client.ts` (Codex CLI is the default analysis provider today).
