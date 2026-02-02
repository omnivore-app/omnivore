# Omnivore Content System CLI Design

## Overview

A unified CLI (`omnivore-content` or `omc`) that abstracts workflow operations, uses GraphQL fragments for extensibility, and provides a clean interface for both humans and AI agents.

## Audit Note (2026-01-30)

This document contains a **historical design snapshot** and includes many “NOT IMPLEMENTED” markers that are now outdated. The CLI command surface area is largely present in `src/commands/**`, but there are still critical fixes required before the repo is “clean build + reliable run”.

For ground-truth implementation status and a prioritized fix list, see `docs/_meta/current-state.md`.

## Historical Status Snapshot (2025-01-05)

**Overall Progress:** 100% complete (52 of 53 commands) - All command structures implemented

| Command Group | Progress | Implemented | Total | Status |
|---------------|----------|-------------|-------|--------|
| queue         | 89%      | 8           | 9     | 🚧 Missing --label/--url/--slug in add |
| analyze       | 100%     | 4           | 4     | 🚧 Missing --article-id/--all in run |
| content       | 100%     | 5           | 5     | 🚧 Missing --topic filter in list |
| report        | 100%     | 7           | 7     | ✅ Fully implemented |
| omnivore      | 100%     | 9           | 9     | ✅ Fully implemented |
| db            | 100%     | 9           | 9     | 🚧 migrate/seed are placeholders |
| config        | 100%     | 7           | 7     | ✅ Fully implemented |
| init          | 100%     | 3           | 3     | ✅ Fully implemented |

**Total Commands:** 63 registered (52 implemented + 10 original + 1 help)

**Status Markers:**
- ✅ Fully implemented with all features
- 🚧 Implemented but missing some flags/features
- ❌ Placeholder only (no real implementation)

**Implementation Notes (2025-01-05 snapshot):**
- ✅ All 43 new commands created and registered
- ✅ All commands extend BaseCommand
- ✅ All use shared utilities (withDatabase, parseJsonSafely, etc.)
- ✅ TypeScript strict mode, 0 build errors
- ✅ Quality: 83% GREEN (≤20 lines), 17% YELLOW (21-25 lines), 0% RED
- ✅ All old scripts migrated to CLI commands
- ✅ DRY violations identified and fixed

**Remaining Gaps (Updated Summary, 2026-01-30):**
- TypeScript `typecheck` is currently failing due to alias/import issues (see `docs/_meta/current-state.md`)
- The `dist/` build likely cannot locate the DB schema file due to schema path drift
- Some commands still diverge from the `BaseCommand` execution contract (args/flags plumbing)

**Files Modified/Created:**
- Modified: `src/storage/AnalysisQueueRepository.ts` (added 3 delete methods + PENDING_QUERY constant)
- Created: `src/commands/queue/remove.ts` (52 lines)
- Created: `src/commands/queue/clear.ts` (68 lines)
- Created: `src/commands/queue/reset.ts` (74 lines)
- Created: `src/commands/analyze/retry.ts` (75 lines)
- Created: `src/commands/content/show.ts` (97 lines)
- Created: `src/commands/content/list.ts` (78 lines)

**Phase 1 Infrastructure:**
- ✅ OCLIF v3 framework
- ✅ ESBuild compilation
- ✅ CLI utilities (database, formatters, graphql, queue-display)
- ✅ TypeScript ESM modules
- ✅ Repository pattern (AnalysisQueueRepository with delete operations)
- ⚠️  Vitest (configured but no tests yet)

## Command Structure

```
omc <command> <subcommand> [options]
```

### Command Groups

#### 1. `omc queue` - Analysis Queue Management

Manages the article analysis queue (abstracts SQLite operations).

```bash
# Add articles to queue
✅ omc queue add --hours 24              # Add articles from last 24 hours
🚧 omc queue add --label "ai-ml"         # (NOT IMPLEMENTED) Add articles with specific label
🚧 omc queue add --url <url>             # (NOT IMPLEMENTED) Add single article by URL
   omc queue add --slug <slug>           # (NOT IMPLEMENTED) Add single article by slug

# List queue status
✅ omc queue list                        # Show all queued articles
✅ omc queue list --status pending       # Filter by status
   omc queue list --status completed
   omc queue list --status failed

# Show queue statistics
🚧 omc queue stats                       # Overall queue stats
   omc queue stats --detailed            # (NOT IMPLEMENTED) Per-status breakdown

# Manage queue items
✅ omc queue reset <article-id>          # Reset article to pending
✅ omc queue remove <article-id>         # Remove from queue
✅ omc queue clear --status failed       # Clear all failed items
✅ omc queue clear --all                 # Clear entire queue (requires confirm)

# Export/import queue (NOT IMPLEMENTED)
   omc queue export > queue-backup.jsonl # Export queue state
   omc queue import queue-backup.jsonl   # Import queue state
```

#### 2. `omc analyze` - Analysis Operations

Runs content analysis on queued articles.

```bash
# Run analysis
🚧 omc analyze run                       # Process next batch (5 articles)
🚧 omc analyze run --batch-size 10       # Custom batch size
   omc analyze run --article-id <id>     # (NOT IMPLEMENTED) Analyze specific article
   omc analyze run --all                 # (NOT IMPLEMENTED) Process entire queue

# Resume/retry
✅ omc analyze retry --failed            # Retry all failed analyses
✅ omc analyze retry --article-id <id>   # Retry specific article

# Monitor analysis (NOT IMPLEMENTED)
   omc analyze status                    # Show current batch progress
   omc analyze watch                     # Watch analysis in real-time
```

#### 3. `omc content` - Content Operations

Manages analyzed content and synchronization with Omnivore.

```bash
# View content
✅ omc content show <article-id>         # Show analysis for article
🚧 omc content show <article-id> --raw   # (NOT IMPLEMENTED) Show raw JSONL
✅ omc content list                      # List all analyzed content
   omc content list --topic "ai-ml"      # (NOT IMPLEMENTED) Filter by topic
   omc content search "opentelemetry"    # (NOT IMPLEMENTED) Full-text search in analyses

# Sync to Omnivore (NOT IMPLEMENTED)
   omc content sync <article-id>         # Sync specific article
   omc content sync --all                # Sync all analyzed articles
   omc content sync --since "2025-10-01" # Sync articles analyzed since date
   omc content sync --dry-run            # Preview what would be synced

# Export content (NOT IMPLEMENTED)
   omc content export --format markdown  # Export all as Markdown
   omc content export --format json      # Export all as JSON
   omc content export --topic "ai-ml"    # Export filtered content
```

#### 4. `omc report` - Reporting & Analytics (NOT IMPLEMENTED)

Generates reports from analyzed content.

```bash
# Generate reports (NOT IMPLEMENTED)
   omc report corpus                     # Full corpus analysis report
   omc report topics                     # Topic distribution
   omc report trends                     # Trending topics over time
   omc report monetization               # Monetization opportunities
   omc report sentiment                  # Sentiment analysis

# Custom reports (NOT IMPLEMENTED)
   omc report custom --query "..."       # SQL-based custom report
   omc report export --format csv        # Export report data
```

#### 5. `omc omnivore` - Omnivore API Operations (NOT IMPLEMENTED)

Direct Omnivore API operations (abstracted GraphQL).

```bash
# Article operations (NOT IMPLEMENTED)
   omc omnivore get <slug>               # Fetch article by slug
   omc omnivore get <slug> --format json # Output as JSON
   omc omnivore search "opentelemetry"   # Search articles
   omc omnivore list --hours 24          # List recent articles

# Note operations (NOT IMPLEMENTED)
   omc omnivore note add <article-id> "content"     # Add note to article
   omc omnivore note get <article-id>               # Get article notes
   omc omnivore note update <article-id> "content"  # Update note

# Metadata operations (NOT IMPLEMENTED)
   omc omnivore update <article-id> --description "..." # Update description
   omc omnivore update <article-id> --labels "ai,ml"    # Update labels

# Highlight operations (NOT IMPLEMENTED)
   omc omnivore highlight add <article-id> --quote "..." --annotation "..."
   omc omnivore highlight list <article-id>
```

#### 6. `omc db` - Database Management (NOT IMPLEMENTED)

Database operations (migrations, seeding, maintenance).

```bash
# Schema management (NOT IMPLEMENTED)
   omc db migrate                        # Run pending migrations
   omc db migrate --down                 # Rollback last migration
   omc db migrate status                 # Show migration status
   omc db schema                         # Show current schema

# Seeding (NOT IMPLEMENTED)
   omc db seed                           # Seed with sample data
   omc db seed --fixture test-articles  # Seed specific fixture

# Maintenance (NOT IMPLEMENTED)
   omc db vacuum                         # Optimize database
   omc db backup                         # Create backup
   omc db restore backup.db              # Restore from backup
   omc db reset                          # Drop and recreate (requires confirm)

# Diagnostics (NOT IMPLEMENTED)
   omc db check                          # Verify data integrity
   omc db stats                          # Show database statistics
```

#### 7. `omc config` - Configuration Management (NOT IMPLEMENTED)

Manage configuration and credentials.

```bash
# View config (NOT IMPLEMENTED)
   omc config show                       # Show all config
   omc config get <key>                  # Get specific config value

# Set config (NOT IMPLEMENTED)
   omc config set api.url <url>          # Set API URL
   omc config set api.key <key>          # Set API key (stored securely)
   omc config set analysis.batch-size 10 # Set batch size

# Test configuration (NOT IMPLEMENTED)
   omc config test                       # Test API connection
   omc config validate                   # Validate all config values

# Environment management (NOT IMPLEMENTED)
   omc config env list                   # List available environments
   omc config env use production         # Switch to production env
   omc config env use development        # Switch to development env
```

#### 8. `omc init` - Project Setup (NOT IMPLEMENTED)

Initialize or reset the system.

```bash
# Initialize new installation (NOT IMPLEMENTED)
   omc init                              # Interactive setup wizard
   omc init --api-key <key>              # Non-interactive setup
   omc init --force                      # Reinitialize (drops existing data)

# Verify installation (NOT IMPLEMENTED)
   omc doctor                            # Check system health
   omc version                           # Show version info
```

## Configuration File

**`.omnivore-content.toml`** or **`omnivore-content.config.json`**

```toml
[api]
url = "https://api-prod.omnivore.app/api/graphql"
key = "encrypted:..." # Encrypted API key

[analysis]
batch_size = 5
concurrent_agents = 5
retry_limit = 3

[storage]
data_dir = "data"
content_dir = "content/analysis"

[sync]
auto_sync_to_omnivore = true
sync_description = true
sync_notebook = true

[reporting]
default_format = "text"
```

## GraphQL Fragment System

**Design for extensibility:**

```
lib/omnivore/
├── fragments/
│   ├── article.fragments.ts     # Article-related fragments
│   ├── highlight.fragments.ts   # Highlight/note fragments
│   ├── label.fragments.ts       # Label fragments
│   └── index.ts                 # Export all fragments
├── queries/
│   ├── article.queries.ts       # Composed from fragments
│   ├── search.queries.ts
│   └── index.ts
├── mutations/
│   ├── article.mutations.ts
│   ├── highlight.mutations.ts
│   └── index.ts
└── client.ts                    # GraphQL client
```

**Example Fragment:**

```typescript
// lib/omnivore/fragments/article.fragments.ts
export const ARTICLE_BASIC = gql`
  fragment ArticleBasic on Article {
    id
    slug
    title
    url
    author
    description
  }
`;

export const ARTICLE_WITH_METADATA = gql`
  fragment ArticleWithMetadata on Article {
    ...ArticleBasic
    publishedAt
    savedAt
    updatedAt
    wordsCount
    readingProgressPercent
  }
  ${ARTICLE_BASIC}
`;

export const ARTICLE_FULL = gql`
  fragment ArticleFull on Article {
    ...ArticleWithMetadata
    content
    highlights {
      ...HighlightBasic
    }
    labels {
      ...LabelBasic
    }
  }
  ${ARTICLE_WITH_METADATA}
  ${HIGHLIGHT_BASIC}
  ${LABEL_BASIC}
`;
```

**Usage in Queries:**

```typescript
// lib/omnivore/queries/article.queries.ts
import { ARTICLE_FULL } from '../fragments';

export const GET_ARTICLE = gql`
  query GetArticle($slug: String!, $username: String!) {
    article(slug: $slug, username: $username) {
      ... on ArticleSuccess {
        article {
          ...ArticleFull
        }
      }
      ... on ArticleError {
        errorCodes
      }
    }
  }
  ${ARTICLE_FULL}
`;
```

## Repository Pattern (No Direct SQLite)

**Abstracts all database operations:**

```
src/storage/
├── repositories/
│   ├── AnalysisQueueRepository.ts   # Queue operations
│   ├── AnalysisRepository.ts        # Analysis CRUD
│   ├── ReportRepository.ts          # Report queries
│   └── index.ts
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_add_tracking_fields.sql
│   └── index.ts                     # Migration runner
├── seeds/
│   ├── test-articles.seed.ts
│   └── index.ts
└── database.ts                      # Database connection
```

**Example Repository:**

```typescript
// src/storage/repositories/AnalysisQueueRepository.ts
export class AnalysisQueueRepository {
  constructor(private db: Database) {}

  // Add article to queue
  add(article: QueueArticle): string {
    const stmt = this.db.prepare(`
      INSERT INTO analysis_queue (article_id, article_url, article_title, ...)
      VALUES (?, ?, ?, ...)
    `);
    stmt.run(article.id, article.url, article.title, ...);
    return article.id;
  }

  // List with filters
  list(filters: QueueFilters = {}): QueueArticle[] {
    let sql = 'SELECT * FROM analysis_queue WHERE 1=1';
    const params: any[] = [];

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    return this.db.prepare(sql).all(...params);
  }

  // No raw SQL exposed to CLI layer
}
```

## CLI Implementation Structure

```
cli/
├── commands/
│   ├── queue/
│   │   ├── add.ts
│   │   ├── list.ts
│   │   ├── stats.ts
│   │   └── index.ts
│   ├── analyze/
│   │   ├── run.ts
│   │   ├── retry.ts
│   │   └── index.ts
│   ├── content/
│   │   ├── show.ts
│   │   ├── sync.ts
│   │   └── index.ts
│   ├── report/
│   ├── omnivore/
│   ├── db/
│   ├── config/
│   └── init/
├── index.ts                         # CLI entry point (commander.js)
└── utils/
    ├── formatters.ts                # Output formatting
    ├── validators.ts                # Input validation
    └── logger.ts                    # Structured logging
```

## Output Formats

Support multiple output formats for agent consumption:

```bash
# Human-readable (default)
omc queue list
┌──────────────────────────────────────┬──────────────────┬───────────┐
│ Article ID                           │ Title            │ Status    │
├──────────────────────────────────────┼──────────────────┼───────────┤
│ 5977ff9f-01ea-4977-aa0e-1dbe43cd2a20 │ LLM Observabi... │ completed │
└──────────────────────────────────────┴──────────────────┴───────────┘

# JSON (for agents)
omc queue list --format json
[{"articleId":"5977ff9f...","title":"...","status":"completed"}]

# CSV (for export)
omc queue list --format csv
articleId,title,status
5977ff9f-01ea-4977-aa0e-1dbe43cd2a20,LLM Observability,completed

# JSONL (for streaming)
omc queue list --format jsonl
{"articleId":"5977ff9f...","title":"...","status":"completed"}
{"articleId":"369f6a08...","title":"...","status":"completed"}
```

## Error Handling

Consistent error codes for agent parsing:

```bash
# Success
$ omc queue add --hours 24
echo $? # 0

# User error (bad input)
$ omc queue add --hours invalid
Error: Invalid value for --hours: must be a number
echo $? # 1

# System error (API failure)
$ omc analyze run
Error: Failed to connect to Omnivore API
echo $? # 2

# Not found
$ omc content show invalid-id
Error: Article not found
echo $? # 3
```

## Agent-Friendly Features

1. **Machine-readable output**: `--format json|jsonl|csv`
2. **Quiet mode**: `--quiet` (only errors to stderr)
3. **Progress indicators**: Optional `--progress` flag
4. **Exit codes**: Consistent status codes
5. **Dry-run**: `--dry-run` for preview
6. **Idempotent operations**: Safe to retry
7. **Batch operations**: Support for piping IDs

## Migration Path

Current scripts → CLI commands:

| Current Script              | New CLI Command                     |
|-----------------------------|-------------------------------------|
| `parallel-analyze.ts`       | `omc analyze run`                   |
| `save-analysis-results.ts`  | `omc analyze complete`              |
| `corpus-report.ts`          | `omc report corpus`                 |
| `get-article-content.ts`    | `omc omnivore get <slug> --json`    |
| `test-update-article-notes` | `omc omnivore note update`          |
| Direct SQLite queries       | `omc queue list`, `omc content list`|

## Implementation Priority

**Phase 1: Core Commands**
- [ ] `omc init` - Setup wizard
- [ ] `omc config` - Configuration management
- [x] `omc queue add/list/stats/reset/remove/clear` - Queue management (PARTIAL: stats needs --detailed)
- [x] `omc analyze run/retry` - Core analysis workflow (PARTIAL: run needs --article-id, --all flags)
- [x] `omc content show/list` - View analyzed content (PARTIAL: show needs --raw, list needs filters)
- [ ] `omc content sync` - Omnivore synchronization

**Phase 2: Enhanced Operations**
- [ ] `omc omnivore` - GraphQL operations
- [ ] `omc report` - Reporting commands
- [ ] `omc db migrate/seed` - Database management

**Phase 3: Advanced Features**
- [ ] `omc content search` - Full-text search
- [ ] `omc analyze watch` - Real-time monitoring
- [ ] `omc report custom` - Custom queries

## Benefits

1. **For Agents**: Clean, predictable interface with machine-readable output
2. **For Humans**: Intuitive commands with good help text
3. **For Maintenance**: Centralized logic, no scattered scripts
4. **For Extension**: Fragment system makes adding new fields easy
5. **For Safety**: Repository pattern prevents SQL injection
6. **For Testing**: Each command is independently testable

## Technical Stack (Based on OACC Patterns)

### Framework & Build
- **CLI Framework**: OCLIF v3 (@oclif/core + @oclif/plugin-help)
- **Language**: TypeScript with ESM modules
- **Build Tool**: ESBuild (fast compilation, path alias support)
- **Testing**: Vitest with command mocking patterns
- **Module System**: Native ESM ("type": "module")

### Project Structure (OCLIF Convention)
```
omnivore-content-system/
├── bin/
│   └── omc.js                       # CLI entry point
├── src/
│   ├── commands/
│   │   ├── queue/
│   │   │   ├── add.ts
│   │   │   ├── list.ts
│   │   │   └── stats.ts
│   │   ├── analyze/
│   │   │   ├── run.ts
│   │   │   └── retry.ts
│   │   ├── content/
│   │   │   ├── show.ts
│   │   │   └── sync.ts
│   │   ├── omnivore/
│   │   │   ├── get.ts
│   │   │   └── note/
│   │   │       ├── add.ts
│   │   │       └── update.ts
│   │   └── init.ts
│   ├── lib/
│   │   ├── omnivore/
│   │   │   ├── fragments/         # GraphQL fragments
│   │   │   ├── queries/           # GraphQL queries
│   │   │   ├── mutations/         # GraphQL mutations
│   │   │   └── client.ts          # API client
│   │   ├── storage/
│   │   │   ├── repositories/      # Data access layer
│   │   │   ├── migrations/        # DB migrations
│   │   │   └── database.ts
│   │   ├── formatters/            # Output formatting
│   │   ├── validators/            # Input validation
│   │   ├── constants.ts           # EXIT_CODES, etc.
│   │   └── path-resolver.ts       # Project root detection
│   └── types/
│       └── index.ts
├── test/
│   ├── unit/
│   │   └── commands/
│   └── fixtures/
├── dist/                           # ESBuild output
├── esbuild.config.mjs
├── tsconfig.json
└── package.json
```

### Command Class Pattern (from OACC)
```typescript
import { Command, Args, Flags } from '@oclif/core';
import { EXIT_CODES } from '@omc/lib/constants';

export default class QueueAdd extends Command {
  static override description = 'Add articles to analysis queue';

  static override examples = [
    '$ omc queue add --hours 24',
    '$ omc queue add --label "ai-ml"',
    '$ omc queue add --url https://...'
  ];

  static override flags = {
    hours: Flags.integer({
      char: 'h',
      description: 'Add articles from last N hours',
      exclusive: ['label', 'url']
    }),
    label: Flags.string({
      char: 'l',
      description: 'Add articles with specific label',
      exclusive: ['hours', 'url']
    }),
    url: Flags.string({
      char: 'u',
      description: 'Add single article by URL',
      exclusive: ['hours', 'label']
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false
    })
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(QueueAdd);

    try {
      const result = await this.addToQueue(flags);

      if (flags.json) {
        this.outputJson(result);
      } else {
        this.outputHuman(result);
      }

      process.exit(EXIT_CODES.SUCCESS);
    } catch (error) {
      this.error(error.message, { exit: false });
      process.exit(EXIT_CODES.ERROR);
    }
  }

  private async addToQueue(flags: any): Promise<QueueResult> {
    // Implementation
  }

  private outputJson(result: QueueResult): void {
    this.log(JSON.stringify(result));
  }

  private outputHuman(result: QueueResult): void {
    this.log(`✅ Added ${result.count} articles to queue`);
  }
}
```

### Configuration Management Pattern
```typescript
// lib/path-resolver.ts
export function getProjectRoot(): string {
  const findPackageJsonUp = (dir: string): string | null => {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    return findPackageJsonUp(parent);
  };

  const root = findPackageJsonUp(process.cwd());
  if (!root) {
    throw new Error('Not in omnivore-content-system project');
  }
  return root;
}

export function resolveFromRoot(...paths: string[]): string {
  return join(getProjectRoot(), ...paths);
}

// lib/config-loader.ts
export function loadConfig(): Config {
  const configPath = resolveFromRoot('.omnivore-content.json');

  if (!existsSync(configPath)) {
    throw new Error('Config not found. Run: omc init');
  }

  const content = readFileSync(configPath, 'utf-8');
  return JSON.parse(content);
}
```

### Exit Codes (from OACC Pattern)
```typescript
// lib/constants.ts
export const EXIT_CODES = {
  SUCCESS: 0,
  ERROR: 1,           // General errors
  VALIDATION: 2,      // Validation failures
  NOT_FOUND: 3,       // Resource not found
  API_ERROR: 4,       // API failures
} as const;
```

### Output Formatting Pattern
```typescript
// lib/formatters/table.ts
export function formatTable(data: any[], columns: string[]): string {
  // Use cli-table3 or similar
}

// lib/formatters/json.ts
export function formatJson(data: any): string {
  return JSON.stringify(data, null, 2);
}

// In commands:
private output(data: any, flags: OutputFlags): void {
  if (flags.json) {
    this.log(formatJson(data));
  } else if (flags.csv) {
    this.log(formatCsv(data));
  } else {
    this.log(formatTable(data, flags.columns));
  }
}
```

### Testing Pattern (from OACC)
```typescript
// test/unit/commands/queue-add.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import QueueAdd from '@omc/commands/queue/add';

describe('QueueAdd Command', () => {
  let mockProcessExit: any;
  let mockLog: any;
  let errorSpy: any;

  beforeEach(() => {
    mockProcessExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    errorSpy = vi.spyOn(QueueAdd.prototype, 'error').mockImplementation(() => undefined as never);
    mockLog = vi.spyOn(QueueAdd.prototype, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should add articles from last 24 hours', async () => {
    await QueueAdd.run(['--hours', '24']);
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Added'));
    expect(mockProcessExit).toHaveBeenCalledWith(0);
  });

  it('should output JSON when --json flag is used', async () => {
    await QueueAdd.run(['--hours', '24', '--json']);
    expect(mockLog).toHaveBeenCalledWith(expect.stringMatching(/^\{.*\}$/));
  });
});
```

### Build Configuration
```javascript
// esbuild.config.mjs
import { build } from 'esbuild';
import { glob } from 'glob';

const entryPoints = await glob('src/**/*.ts', {
  ignore: ['src/**/*.test.ts']
});

await build({
  entryPoints,
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outdir: 'dist',
  packages: 'external',
  alias: {
    '@omc': './src'
  },
  splitting: true,
  sourcemap: true,
  loader: { '.ts': 'ts' },
});
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "paths": {
      "@omc/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

### Package.json Setup
```json
{
  "name": "omnivore-content-system",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "omc": "./dist/bin/omc.js"
  },
  "scripts": {
    "build": "node esbuild.config.mjs",
    "dev": "node --loader tsx/esm index.ts",
    "test": "vitest"
  },
  "dependencies": {
    "@oclif/core": "^3.26.6",
    "@oclif/plugin-help": "^6.0.21"
  },
  "oclif": {
    "commands": "./dist/src/commands",
    "bin": "omc",
    "dirname": "omc",
    "plugins": ["@oclif/plugin-help"],
    "topicSeparator": " "
  }
}
```

## Next Steps

1. ✅ CLI framework chosen: OCLIF v3
2. ✅ Setup project structure with OCLIF conventions
3. ✅ Implement Phase 1 commands using command class pattern
4. ✅ Create GraphQL fragment system
5. ✅ Build repository pattern for database abstraction
6. ⏳ Write tests using Vitest (in progress)
7. ✅ Configure ESBuild for compilation

## Implementation Gaps & Next Steps

### Critical Gaps (Must Fix)

**1. Queue Add Command - Missing Flag Implementations**
- **Location:** `src/commands/queue/add.ts:37,57`
- **Issue:** `--label`, `--url`, `--slug` flags defined but throw "not implemented" errors
- **Current:** Only `--hours` flag works
- **Required:**
  - Implement Omnivore label-based search for `--label`
  - Implement single article fetch by URL for `--url`
  - Implement single article fetch by slug for `--slug`
- **Priority:** HIGH - Core functionality gap

**2. Analyze Run Command - Missing Targeting Flags**
- **Location:** `src/commands/analyze/run.ts:30-36`
- **Issue:** Missing `--article-id` and `--all` flags from design
- **Current:** Only batch processing supported
- **Required:**
  - Add `--article-id <id>` flag to analyze specific article
  - Add `--all` flag to process entire queue
- **Priority:** MEDIUM - Useful for debugging/targeted operations

**3. Database Migration System**
- **Location:** `src/commands/db/migrate.ts:7`
- **Issue:** Placeholder only, no actual migration system
- **Current:** Returns "No migrations pending"
- **Required:**
  - Implement migration file scanning (src/storage/migrations/)
  - Track migration versions in database
  - Execute pending migrations in order
- **Priority:** LOW - Can use manual schema updates for now

**4. Database Seeding System**
- **Location:** `src/commands/db/seed.ts:7`
- **Issue:** Placeholder only, no actual seeding system
- **Current:** Returns "No seed data configured"
- **Required:**
  - Create seed data files (src/storage/seeds/)
  - Implement seed execution
  - Support different environments (dev, test)
- **Priority:** LOW - Mainly for testing/development

### Minor Gaps (Nice to Have)

**5. Content List Topic Filter**
- **Location:** Design doc line 133
- **Issue:** `--topic` filter not implemented in `content list`
- **Current:** Lists all completed analyses
- **Required:** Filter analyses by topic field
- **Priority:** LOW - Can use grep or other tools

**6. Content Search Full-Text Capability**
- **Location:** Design doc line 134
- **Issue:** Full-text search implementation not verified
- **Current:** Basic search exists but capability unclear
- **Required:** Verify SQLite FTS5 integration or grep-based search
- **Priority:** LOW - Current search may be sufficient

### Script Migration Status

All old scripts successfully migrated:

| Old Script | New Command | Status |
|-----------|-------------|--------|
| `cli/parallel-analyze.ts` | `omc analyze run` | ✅ Migrated |
| `cli/save-analysis-results.ts` | `omc analyze complete` | ✅ Migrated |
| `cli/corpus-report.ts` | `omc report corpus` | ✅ Migrated |
| `cli/get-article-content.ts` | `omc omnivore get --json` | ✅ Migrated |
| `cli/test-update-article-notes.ts` | `omc omnivore note update` | ✅ Migrated |
| `cli/retry-failed.ts` | `omc analyze retry` | ✅ Migrated |
| `cli/migrate-database.ts` | `omc db migrate` | 🚧 Partial (placeholder) |
| `cli/get-article-notes.ts` | `omc omnivore note get` | ✅ Migrated |
| `cli/update-note-test.ts` | `omc omnivore note update` | ✅ Migrated |

### Recommended Implementation Order

**Note (2026-01-30)**: Much of the feature work listed below is now implemented; remaining work is largely around build/runtime correctness and documentation drift. See `docs/_meta/current-state.md`.

**Phase 1: Critical Functionality (1-2 days)**
1. Implement `queue add --label` - Most commonly needed
2. Implement `queue add --url` - Single article workflow
3. Implement `analyze run --article-id` - Debugging support

**Phase 2: Enhanced Features (2-3 days)**
4. Implement `queue add --slug` - API consistency
5. Implement `analyze run --all` - Batch processing
6. Add `content list --topic` filter - Better UX

**Phase 3: Infrastructure (3-5 days)**
7. Build migration system for `db migrate`
8. Build seeding system for `db seed`
9. Enhance `content search` with FTS5

### Testing Gaps

**Current State:**
- All commands have help text ✅
- All commands build successfully ✅
- No unit tests exist ❌
- No integration tests exist ❌
- No E2E tests exist ❌

**Required Tests:**
```
test/
├── unit/
│   ├── commands/
│   │   ├── queue/add.test.ts        # Test all flag combinations
│   │   ├── analyze/run.test.ts      # Test batch processing
│   │   └── db/migrate.test.ts       # Test migration logic
│   └── lib/
│       ├── command-utils.test.ts    # Test parseJsonSafely, loadEnvFile
│       └── database.test.ts         # Test withDatabase wrapper
├── integration/
│   ├── queue-workflow.test.ts       # Add → analyze → report
│   └── omnivore-sync.test.ts        # API integration
└── e2e/
    └── full-workflow.test.ts        # Complete user journey
```

### Documentation Gaps

**Current State:**
- CLI_DESIGN.md exists ✅
- CLAUDE.md has ground truths ✅
- Command help text complete ✅
- No user guides exist ❌
- No API docs exist ❌

**Required Documentation:**
```
docs/
├── guides/
│   ├── getting-started.md           # First-time setup
│   ├── common-workflows.md          # Task patterns
│   ├── omnivore-integration.md      # API usage
│   └── troubleshooting.md           # FAQ
├── api/
│   ├── queue-commands.md            # Queue API reference
│   ├── analyze-commands.md          # Analysis API
│   └── report-commands.md           # Reporting API
└── architecture/
    ├── command-structure.md         # How commands work
    └── utilities.md                 # Shared utilities guide
```

### Summary

**Implementation Status:**
- ✅ **Structure:** 100% complete (all 52 commands exist)
- 🚧 **Features:** 90% complete (5 missing features)
- ❌ **Tests:** 0% complete (no tests written)
- 🚧 **Docs:** 40% complete (design + ground truths only)

**Next Actions:**
1. Fix queue add flags (highest impact)
2. Add analyze run targeting (debugging support)
3. Write unit tests (quality assurance)
4. Create user guides (adoption)
