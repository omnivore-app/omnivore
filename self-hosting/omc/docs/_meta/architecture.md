# System Architecture

**Purpose**: Architectural design decisions, storage boundaries, and structural patterns for the Omnivore Content System.

**Last Updated**: 2026-01-30

**Status**: Architectural intent remains valid, but some implementation details have drifted (notably JSONL output and the legacy workflow scripts). See `docs/_meta/current-state.md` for the full audit.

## Overview

The analysis engine processes articles from Omnivore through the `@article-content-analyzer` agent, extracting structured insights for content monetization. The system uses a three-layer architecture designed to maintain clear boundaries and prevent data corruption.

## Three-Layer Architecture

The system enforces strict separation between source data, coordination, and permanent storage:

**Layer 1: Omnivore (Source of Truth)**
- Always fetch articles via GraphQL API
- Never duplicate article content locally
- Omnivore labels used as intent hints for analysis

**Layer 2: SQLite (Immutable Snapshots + Tracking)**
- Database: `data/omnivore-content.db` (gitignored)
- Purpose: Store immutable AI analysis snapshots + coordinate parallel execution
- Tracks: pending/in_progress/completed/failed status
- Tables: `analysis_queue`, `analysis_sessions`
- Existing Omnivore tables (if present): READ-ONLY, never modify

**Layer 3: Markdown (Permanent Storage)**
- Analysis results: `content/analysis/*.md` (human-readable)
- Git-tracked for version history
- Only value-added content stored

### What Gets Stored

- ✅ **Analysis results** (`content/analysis/*.md`) - Topics, summaries, key points, monetization angles
- ✅ **JSONL records (optional)** (`content/analysis/analyses.jsonl`) - Produced when enabled via CLI flags (`omc analyze complete --jsonl` / `omc analyze auto --jsonl`)
- ✅ **Tracking queue** (SQLite) - Job status, retry counts, error messages
- ✅ **Generated content** (`content/generated/**/*.md`) - Blog posts, newsletters (future)
- ❌ **Source articles** - Query Omnivore API; do NOT duplicate locally

### Storage Formats

1. **Markdown with YAML front-matter** - Human-readable, git-trackable
2. **JSONL (JSON Lines)** - Append-only, machine-readable (planned/optional; not currently produced by default)
3. **SQLite** - Immutable AI snapshots + tracking (gitignored but permanent)

## Database Schema

**Location**: `src/storage/schema/tracking-schema.sql`

**Purpose**: Define tracking tables for job queue coordination.

### Tables

**1. `analysis_queue`** - Job tracking for parallel execution
- `id` (INTEGER PRIMARY KEY) - Auto-increment job ID
- `article_id` (TEXT UNIQUE) - Omnivore article ID
- `article_url` (TEXT) - Source article URL
- `article_title` (TEXT) - Source article title
- `status` (TEXT) - Job status: `pending` | `in_progress` | `completed` | `failed`
- `assigned_at` (TEXT) - When marked in_progress (ISO 8601)
- `completed_at` (TEXT) - When marked completed (ISO 8601)
- `error_message` (TEXT) - Error details if failed
- `retry_count` (INTEGER) - Number of retry attempts (default: 0)
- `created_at` (TEXT) - When added to queue (ISO 8601)
- `updated_at` (TEXT) - Last status change (ISO 8601)

**2. `analysis_sessions`** - Optional batch metadata
- `id` (INTEGER PRIMARY KEY) - Auto-increment session ID
- `started_at` (TEXT) - Session start time
- `completed_at` (TEXT) - Session completion time
- `total_articles` (INTEGER) - Total articles in session
- `completed_articles` (INTEGER) - Completed count
- `failed_articles` (INTEGER) - Failed count
- `notes` (TEXT) - Session notes

### Indexes

- `idx_analysis_queue_status` - Fast status filtering
- `idx_analysis_queue_article_id` - Fast article lookup
- `idx_analysis_queue_created_at` - Chronological ordering

### AIDEV Annotations

- `tracking + immutable snapshots` - Stores original AI output + coordination
- `analysis-output-boundary` - Analysis results stored in git-tracked Markdown/JSONL, NOT here

## Database Initialization

**Location**: `src/storage/database.ts`

**Purpose**: Initialize SQLite database with boundary enforcement for tracking coordination.

**Import**:
```typescript
import { initDatabase } from '@storage/database';
```

### Key Functions

**1. `initDatabase(dbPath?: string): Database`** - Initialize database connection
- Default path: `data/omnivore-content.db`
- Enables WAL mode for concurrent access
- Creates tracking tables via `tracking-schema.sql`
- Returns `better-sqlite3` Database instance

**2. `listTables(db: Database): string[]`** - List all tables
- Returns array of table names
- Used to identify Omnivore vs tracking tables

**3. `isOmnivoreTable(db: Database, tableName: string): boolean`** - Identify Omnivore tables
- Detects Core Data tables by Z-prefixed column names
- Returns `true` if table belongs to Omnivore cache

**4. `validateOmnivoreTablesReadOnly(db: Database): void`** - Boundary check
- Logs Omnivore tables (READ-ONLY) vs tracking tables (READ-WRITE)
- Safety check to ensure no modification of Omnivore data

**5. `getTableCounts(db: Database): Record<string, number>`** - Get row counts
- Returns object mapping table names to row counts
- Useful for debugging and monitoring

### AIDEV Annotations

- `tracking-db-boundary` - SQLite stores immutable AI snapshots + job tracking
- `omnivore-boundary` - Existing Omnivore tables are READ-ONLY, never modify

### Example Usage

```typescript
import { initDatabase, validateOmnivoreTablesReadOnly, listTables } from '@storage/database';

// Initialize database
const db = initDatabase('data/omnivore-content.db');

// Verify boundaries
validateOmnivoreTablesReadOnly(db);

// List all tables
const tables = listTables(db);
console.log('Tables:', tables);
// Output: ['analysis_queue', 'analysis_sessions', 'ZMEDIA', 'ZUSER', ...]

// Close when done
db.close();
```

## Storage Formats

### Markdown File Structure

**Location**: `content/analysis/YYYY-MM-DD-{slug}-analysis.md`

**Format**:
```markdown
---
articleId: 1039961b-8de3-4ccf-b3e8-df888d6174b8
articleSlug: cchistory-tracking-claude-code-system-prompt
articleUrl: https://example.com/article
articleTitle: "Article Title"
savedAt: 2025-09-30T02:27:46.000Z
analyzedAt: 2025-10-01T04:25:16.676Z
topics: [developer-tools, ai-tooling, reverse-engineering]
topicScores:
  developer-tools: 0.95
  ai-tooling: 0.9
  reverse-engineering: 0.85
sentiment: positive
---

## Summary

2-3 sentence summary capturing the main points and why this matters...

## Key Points

- First key takeaway or insight
- Second key takeaway or insight
- Third key takeaway or insight

## Monetization Angle

Specific content opportunity description...
```

**Front-Matter Fields**:
- `articleId` (string) - Omnivore article ID (references source)
- `articleSlug` (string, optional) - Omnivore slug (preferred filename key)
- `articleUrl` (string) - Source article URL
- `articleTitle` (string) - Source article title (escaped quotes)
- `savedAt` (ISO 8601) - When article was saved to Omnivore
- `analyzedAt` (ISO 8601) - When analysis was performed
- `topics` (array) - 2-5 topic labels
- `topicScores` (object) - Topic → confidence score (0-1)
- `sentiment` (enum) - `positive` | `neutral` | `negative`

**Markdown Sections**:
- `## Summary` - Strategic summary (2-3 sentences)
- `## Key Points` - Bullet list of insights (3-5 items)
- `## Monetization Angle` - Content opportunity description

### JSONL File Structure

**Location**: `content/analysis/analyses.jsonl`

**Status**: Optional. `AnalysisWriter.appendToJsonl()` is invoked when JSONL is enabled via CLI flags.

**Format**: One JSON object per line (JSON Lines / newline-delimited JSON)

**Purpose**: Append-only machine-readable format for batch processing

**Record Structure**:
```json
{"articleId":"abc-123","articleUrl":"https://example.com/article","articleTitle":"Article Title","savedAt":"2025-09-30T14:12:18.000Z","analyzedAt":"2025-10-01T04:30:53.761Z","topics":["developer-tools","api-design"],"topicScores":{"developer-tools":0.95,"api-design":0.9},"sentiment":"positive","summary":"Article summary...","keyPoints":["First point","Second point"],"monetizationAngle":"Content opportunity..."}
```

**Fields**: Same as front-matter plus `summary`, `keyPoints`, `monetizationAngle` (flattened structure)

**Advantages**:
- Append-only (no file rewriting)
- Easy parsing line-by-line
- Works with streaming processing
- Standard format for data pipelines

**Usage Example**:
```javascript
import { readFileSync } from 'fs';

const lines = readFileSync('content/analysis/analyses.jsonl', 'utf-8')
  .split('\n')
  .filter(line => line.trim());

const analyses = lines.map(line => JSON.parse(line));
console.log(`Loaded ${analyses.length} analyses`);
```

## Boundary Enforcement

The system enforces strict boundaries between three layers to prevent data corruption and maintain clarity.

### AIDEV Annotation Patterns

All boundary-critical code uses AIDEV annotations for searchability:

**Tracking Annotations** (SQLite coordination):
- `tracking + immutable snapshots` - Stores original AI output + coordination
- `tracking-db-boundary` - SQLite stores immutable AI snapshots + job tracking
- `tracking-initialization` - Sets up job queue
- `tracking-coordination` - Fetches jobs for parallel processing
- `tracking-lock` - Prevents duplicate analysis by concurrent runs
- `tracking-completion` - Job done, analysis in git-tracked files
- `tracking-error` - Increments retry counter
- `tracking-retry` - Resets failed job for another attempt
- `tracking-stats` - Shows progress, not analysis content
- `tracking-deduplication` - Prevents duplicate queue entries
- `tracking-cleanup` - Removes completed jobs
- `tracking-inspection` - Shows queue status
- `tracking-update` - Updates queue status after save

**Output Annotations** (Git-tracked storage):
- `analysis-output-boundary` - Results written to Markdown (and optionally JSONL), NOT stored as editable content in the database
- `git-tracked-output` - Permanent storage for analysis results

**Omnivore Annotations** (Source of truth):
- `omnivore-boundary` - Always fetch via GraphQL, never from local cache

### Search Annotations

Find all boundary-critical code:
```bash
# SQLite tracking code
rg "AIDEV-NOTE:.*tracking"

# Analysis output code
rg "AIDEV-NOTE:.*analysis-output"

# Omnivore API usage
rg "AIDEV-NOTE:.*omnivore-boundary"

# Git-tracked output
rg "AIDEV-NOTE:.*git-tracked"
```

### Boundary Rules

**Rule 1: Omnivore is Source of Truth**
- Always fetch articles via GraphQL API
- Never duplicate article content locally
- Use Omnivore labels as intent hints

**Rule 2: SQLite Stores Immutable Analysis Snapshots**
- Stores original AI analysis output (immutable snapshots) + coordination for parallel execution
- Database file (`data/omnivore-content.db`) is gitignored but permanent
- Contains valuable AI output that should NOT be deleted
- Existing Omnivore tables (if present) are READ-ONLY

**Rule 3: Markdown/JSONL is Permanent Storage**
- Analysis results are git-tracked
- Only value-added content stored
- Never store source articles

**Rule 4: No Cross-Layer Leakage**
- Analysis results never stored in SQLite
- Article content never stored in git
- Queue status never persisted in Markdown

### Validation Functions

Use database boundary checks to verify compliance:

```typescript
import { initDatabase, validateOmnivoreTablesReadOnly, isOmnivoreTable } from '@storage/database';

const db = initDatabase();

// Check for Omnivore tables
validateOmnivoreTablesReadOnly(db);
// Output:
// [BOUNDARY CHECK] Omnivore table detected: ZMEDIA (READ-ONLY)
// [BOUNDARY CHECK] Tracking table: analysis_queue (READ-WRITE)

// Verify table type before operations
if (isOmnivoreTable(db, 'ZMEDIA')) {
  throw new Error('Cannot modify Omnivore table');
}
```

## Type Definitions

### ContentAnalysis

**Location**: `src/types/analysis.ts`

**Purpose**: Analysis result from `@article-content-analyzer` agent.

```typescript
export interface ContentAnalysis {
  articleId: string;              // Omnivore article ID
  topics: string[];               // 2-5 main topics
  topicScores: Record<string, number>;  // Topic → confidence (0-1)
  summary: string;                // 2-3 sentence summary
  keyPoints: string[];            // 3-5 key takeaways
  sentiment: 'positive' | 'neutral' | 'negative';
  monetizationAngle: string;      // Content opportunity
  analyzedAt: string;             // ISO 8601 timestamp
}
```

**Import**:
```typescript
import type { ContentAnalysis } from '@omc-types/analysis.js';
// OR
import type { ContentAnalysis } from '../types/analysis';
```

### AnalysisFrontMatter

**Location**: `src/types/content.ts`

**Purpose**: Front-matter schema for analysis Markdown files.

```typescript
export interface AnalysisFrontMatter {
  articleId: string;              // Omnivore article ID
  articleUrl: string;             // Source article URL
  articleTitle: string;           // Source article title
  savedAt: string;                // ISO 8601
  analyzedAt: string;             // ISO 8601
  topics: string[];               // Topic labels
  topicScores: Record<string, number>;  // Topic → score
  sentiment: 'positive' | 'neutral' | 'negative';
}
```

### StoredAnalysis

**Location**: `src/types/content.ts`

**Purpose**: Complete stored analysis (after reading Markdown file).

```typescript
export interface StoredAnalysis {
  frontMatter: AnalysisFrontMatter;  // Parsed YAML
  summary: string;                    // From ## Summary section
  keyPoints: string[];                // From ## Key Points section
  monetizationAngle: string;          // From ## Monetization Angle section
}
```

## Related Documentation

- [Workflow Internals](workflow-internals.md) - How the parallel analysis workflow operates
- [CLI Reference](cli-reference.md) - Command-line interface documentation
- [Foundation & Type System](foundation-and-types.md) - TypeScript setup, type definitions, Omnivore client
