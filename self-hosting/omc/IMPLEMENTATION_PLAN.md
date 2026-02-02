# Omnivore Content System - Implementation Plan (Revised)

## 🚀 NEXT SESSION START HERE

**Current Status**: ✅ Parallel analysis workflow COMPLETE - 65 articles analyzed, 0 pending, 2 failed

**Next Steps**:
1. **Investigate 2 failed analyses**:
   - Both failed with "Cannot read properties of undefined (reading 'topicScores')"
   - Likely incomplete agent analysis missing required fields
   - May need to re-queue or analyze manually

2. **Generate first content** from analyzed corpus:
   - Weekly roundup from top 5-10 AI/Tech articles
   - Use `omc report corpus` to identify trending topics
   - Focus on AI/ML, Developer Tools, Security topics (most common in corpus)

3. **Optional: Update groundtruth documentation** if needed:
   - Current groundtruth already documents parallel workflow
   - No significant architectural changes in this session

---

## Overview

AI-powered content monetization system using TypeScript, Claude Agent SDK, and modern ESM conventions. Transforms Omnivore reading into blog posts, newsletters, and social media content.

**Key Decision**: Build mechanics-first approach - prove each building block works independently before integration.

## Groundtruth: What Already Exists

**Before implementing any phase**, read the groundtruth documentation to understand what's available to build upon:

📚 **[Foundation & Type System](docs/_meta/foundation-and-types.md)** - TypeScript setup, Omnivore client library (lib/omnivore/), type definitions (src/types/), environment configuration, dependencies, and usage examples.

📚 **[GraphQL Organization](docs/_meta/graphql-organization.md)** - GraphQL fragment system for preventing query drift, reusable fragments, composed queries, and anti-drift architecture.

📚 **[System Architecture](docs/_meta/architecture.md)** - Three-layer architecture, storage boundaries, database schema, and type definitions.

📚 **[CLI Reference](docs/_meta/cli-reference.md)** - Complete command-line interface documentation for queue management, analysis, and reporting.

📚 **[Workflow Internals](docs/_meta/workflow-internals.md)** - Zero-context-pollution design, parallel analysis workflow, agent invocation patterns, and file handling.

**Quick Reference**:
- **Omnivore Client** (lib/omnivore/client.js): 11 functions for fetching articles, labels, highlights
- **Query Builders** (lib/omnivore/queries.js): Pre-built GraphQL queries and pattern builders
- **Type System** (src/types/*.ts): Complete TypeScript types for API, storage, and analysis
- **Tracking DB** (data/omnivore-content.db): SQLite for immutable analysis snapshots + job coordination (gitignored but permanent)
- **CLI** (`omc`): queue/analyze/content/report/db/config/omnivore commands (oclif)
- **Storage** (content/analysis/): Markdown analysis results (permanent, git-tracked)
- **Workflow**: `omc queue add --hours 24` → `omc analyze auto --batch-size 5` → `omc report corpus`
- **LLM**: analysis uses `codex exec` (read-only) + Codex CLI auth (no API key in `.env`)
- **Package manager**: Prefer Corepack-managed pnpm (`corepack pnpm ...`) to avoid native-module ABI mismatches

## Maintaining Groundtruth Documentation

### When to Update Groundtruth

**Update `docs/_meta/<logical-group>.md` immediately after**:
- Implementing a new phase or building block
- Adding new modules, functions, or classes that will be reused
- Creating new utilities, helpers, or shared code
- Establishing new patterns or conventions
- Fixing implementation drift from original design

**Do NOT wait** until "the end" - update groundtruth as you go.

### How to Update Groundtruth

**Use the @documentation-writer agent**:
```
@documentation-writer Update docs/_meta/foundation-and-types.md to include
the new ArticleWriter class in src/storage/ArticleWriter.ts with:
- What it does
- How to import and use it
- Key methods and their signatures
- Usage examples
```

**Documentation Standards**:
1. **Hard-to-vary facts only** - document what exists, not plans or status
2. **No status markers** - never write "complete", "done", "implemented"
3. **Focus on usage** - show how to use what's built, with examples
4. **Technical accuracy** - document actual code, not idealized version
5. **Reusability first** - emphasize how to reuse existing code

### Anti-Drift Protocol

**Before implementing new code**:
1. Read relevant groundtruth docs to understand what exists
2. Check if similar functionality already exists
3. Reuse existing patterns and utilities when possible

**After implementing new code**:
1. Compare implementation against groundtruth and original design
2. Identify any drift from established patterns
3. Self-correct if drift is found:
   - **Minor drift** (naming, structure): Update implementation to match patterns
   - **Major drift** (architecture, approach): Document why drift occurred, update groundtruth if justified

**When adding new groundtruth docs**:
1. Review existing groundtruth files for similar content
2. Check for inconsistencies with established patterns
3. Self-correct documentation if conflicts found
4. Maintain consistent voice and structure across all groundtruth files

### Groundtruth File Organization

**File naming**: `docs/_meta/<logical-group>.md`

**Logical groups** (examples):
- `foundation-and-types.md` - TypeScript, dependencies, type system, client library
- `storage-and-files.md` - Markdown storage, front-matter, file operations (future)
- `analysis-and-generation.md` - Claude integration, prompts, content generation (future)
- `workflows-and-cli.md` - CLI tools, automated workflows (future)

**When to create a new file**:
- Group is distinct from existing groundtruth
- Contains 3+ related components
- Will be referenced frequently by agents

**When to update existing file**:
- New component fits existing logical group
- Extends or enhances documented functionality

### Groundtruth Update Checklist

When updating groundtruth documentation:

- [ ] Use @documentation-writer agent (not manual edits)
- [ ] Document actual code (verify with file reads)
- [ ] Include import patterns and usage examples
- [ ] Remove any status/completion language
- [ ] Cross-reference related groundtruth sections
- [ ] Verify no conflicts with existing patterns
- [ ] Self-correct any identified drift
- [ ] Update "What Does NOT Exist Yet" section if needed

### Example: Good vs Bad Groundtruth

**❌ Bad (status-oriented)**:
```markdown
## ArticleWriter

Status: Complete (2025-09-30)

We implemented the ArticleWriter class to write articles to Markdown.
It works great and is ready to use.
```

**✅ Good (fact-oriented)**:
```markdown
## ArticleWriter

**Location**: `src/storage/ArticleWriter.ts`

**Purpose**: Writes Omnivore articles to Markdown files with YAML front-matter.

**Import**:
```typescript
import { ArticleWriter } from '@storage/ArticleWriter';
```

**Usage**:
```typescript
const writer = new ArticleWriter('content/articles');
await writer.write(omnivoreArticle);
// Creates: content/articles/2025-09-30-article-slug.md
```

**Methods**:
- `write(article: OmnivoreArticle): Promise<string>` - Write article, returns file path
- `generateSlug(title: string): string` - Create URL-friendly slug
```

## Architecture Decisions

### 1. TypeScript-First (New Code Only)
- Strict TypeScript with full type safety
- Compile to `dist/` using latest ESM conventions
- **Use existing JS client as library** (import from `lib/omnivore/`)
- Source maps for debugging
- Type definitions for all public APIs

### 2. Storage Strategy: Tracking + Permanent Storage (Three-Layer Architecture)

**Layer 1: Omnivore (Source of Truth)**
- **Source articles**: Query Omnivore GraphQL API (NEVER store locally)
- **Labels, highlights**: Always fetch via API
- **CRITICAL**: Omnivore IS the storage for source articles

**Layer 2: SQLite (Tracking + Immutable Snapshots)**
- **Purpose**: Coordinate parallel analysis + store original AI output
- **Location**: `data/omnivore-content.db` (gitignored)
- **Contains**:
  - `analysis_queue` table: job status + immutable analysis JSON + markdown references
  - Article metadata: publishedAt, updatedAt from Omnivore
  - READ-ONLY access to existing Omnivore cache tables (if present)
- **Lifecycle**: Permanent storage - contains original AI analysis (queryable); Markdown has user-edited versions
- **Boundary**: Stores ORIGINAL AI analysis (queryable catalog); Markdown files are editable

**Layer 3: Git-Tracked Files (Human-Editable Storage)**
- **Analysis results**: Markdown files with YAML front-matter (user-editable)
- **Generated content**: Markdown files for blog posts, newsletters
- **Location**: `content/analysis/`, `content/generated/`
- **User workflow**: Edit Markdown files to refine, improve, add context
- **Git versioned**: Full history of user edits and content evolution
- **Relationship to Layer 2**: SQLite stores original AI output; Markdown stores current version after edits

**Critical Boundaries** (enforced with AIDEV-NOTE annotations):
1. **SQLite = Original + Tracking**: Immutable AI snapshots + job coordination
2. **Markdown = Editable**: User can refine AI analysis in git-tracked files
3. **Omnivore tables = READ-ONLY**: Never modify, always use GraphQL API

### 3. Test Promotion Path
Clear progression for code maturity:
1. **test-scripts/** - Quick experiments, proof of concept
2. **cli/** - Working CLI tools for manual use
3. **tests/** - Automated test scenarios
4. **src/** - Production-ready TypeScript code

### 4. Agent Development
- Write prompts first, test in chat
- Develop mechanics before wrapping in Agent SDK
- Use prompts directly with Anthropic API initially
- Wrap in Agent SDK once mechanics proven

### 5. Publishing Priority
1. **Markdown files** - Initial output format
2. **Ghost** - If self-hostable
3. Other platforms later

### 6. DRY (Don't Repeat Yourself)
- Single source of truth for API interactions (existing client)
- Shared base classes for common functionality
- Composable template system
- Unified error handling and logging
- Reusable utilities

### 7. AIDEV Boundary Documentation
All code dealing with architectural boundaries must be annotated with `AIDEV-NOTE` comments:

**Tracking Code** (permanent storage):
```typescript
// AIDEV-NOTE: tracking + immutable snapshots - coordination and original AI output
// AIDEV-NOTE: tracking-db - stores original analysis JSON for querying
// AIDEV-NOTE: tracking-lock - prevents duplicate analysis by concurrent runs
```

**Analysis Output Code** (permanent):
```typescript
// AIDEV-NOTE: analysis-output-boundary - results written to Markdown/JSONL, NOT database
// AIDEV-NOTE: git-tracked-output - analysis result stored permanently
```

**Omnivore Boundary Code** (read-only):
```typescript
// AIDEV-NOTE: omnivore-boundary - always use GraphQL API, never local cache
// AIDEV-NOTE: boundary-check - ensure Omnivore tables never modified by our code
```

### 8. Parallel Analysis Architecture
- **Concurrency**: Process 5 articles simultaneously
- **Coordination**: SQLite queue prevents duplicate work
- **Execution**: Single message with 5 Task tool calls to `@article-content-analyzer`
- **Error handling**: Failed jobs tracked, retryable up to 3 times
- **Progress tracking**: Real-time status via `analysis_queue` table
- **Output**: All results written to git-tracked Markdown/JSONL

## Extraction Strategy: Moving to Standalone Repo

### Timeline
The omnivore-content-system will be extracted to its own repository soon. This section describes how to handle the lib/omnivore/ dependency.

### Recommended Approach: Copy lib/ Directory

When extracting to standalone repo, **copy lib/omnivore/** with the content-system:

```bash
# Extraction command
cp -r omnivore/scripts/omnivore-content-system /path/to/new-repo

# Result: New repo includes lib/
omnivore-content-system/          # New standalone repo
├── lib/                           # ✅ Copied from old repo
│   └── omnivore/
│       ├── client.js              # Working GraphQL client
│       └── queries.js             # Query builders
├── src/                           # TypeScript code
├── test-scripts/
├── content/
└── package.json
```

### Why Copy Instead of NPM Package?

**Advantages:**
- ✅ Zero setup - works immediately
- ✅ No external dependencies to manage
- ✅ Can modify if needed for content-system use case
- ✅ lib/ is stable (GraphQL client rarely changes)
- ✅ TypeScript can import JavaScript files directly

**Trade-offs:**
- Code duplication (acceptable - lib is ~700 lines total)
- No automatic updates from omnivore repo (not needed - stable API)

### How TypeScript Imports JavaScript

TypeScript can import JavaScript modules directly:

```typescript
// src/storage/ArticleWriter.ts
import { searchArticles } from '../../lib/omnivore/client.js';
import { buildTopicQuery } from '../../lib/omnivore/queries.js';

// Works because:
// 1. TypeScript allows .js imports
// 2. lib/ is in tsconfig "include" paths
// 3. ESM modules work across JS/TS boundary
```

### Type Safety for JavaScript Client

Create TypeScript definitions for the JavaScript client:

```typescript
// src/types/omnivore.ts
export interface OmnivoreArticle {
  id: string;
  title: string;
  url: string;
  content?: string;
  // ... matches client.js response structure
}

// Wrapper with types (optional)
// src/lib/omnivore-typed.ts
import * as client from '../../lib/omnivore/client.js';
import type { OmnivoreArticle, SearchResult } from '@types/omnivore';

export const searchArticles = client.searchArticles as (
  params: SearchParams
) => Promise<SearchResult>;
```

### Future Option: NPM Package

If later you need to:
- Use omnivore-client in multiple projects
- Share updates between projects
- Publish for community use

Then convert lib/omnivore/ to `@yourorg/omnivore-client` npm package.

**For now:** Copy is simpler and sufficient.

### Extraction Checklist

When moving to standalone repo:
- [ ] Copy entire omnivore-content-system/ directory
- [ ] Verify lib/omnivore/ is included
- [ ] Update .env with API credentials
- [ ] Run `pnpm install`
- [ ] Test: `node lib/omnivore/client.js --test`
- [ ] Verify TypeScript can import from lib/

---

## Extraction Readiness Status

### ✅ READY TO EXTRACT - 100% Self-Contained

The omnivore-content-system is **ready to be moved** to a standalone repository. All dependencies on the parent omnivore repo have been eliminated.

### What's Already Copied and Working

**Omnivore Client Library (WORKING):**
- ✅ `lib/omnivore/client.js` (8.0k) - Complete GraphQL client
  - 11 functions: getMe, searchArticles, getArticle, getArticlesByDate, getArticlesByLabel, getRecentArticles, searchByTopic, getUnreadArticles, getLabels, getHighlights, testConnection
  - Features: Pagination, label filtering, topic queries, content inclusion
  - Built-in CLI test: `node lib/omnivore/client.js --test`
- ✅ `lib/omnivore/queries.js` (8.8k) - Query builders and patterns
  - Pre-built queries: SEARCH_ARTICLES_FULL, GET_ARTICLE_FULL, SEARCH_WITH_CONTENT
  - Topic queries: AI_ML, DEVOPS, PROGRAMMING, DATABASES, CLOUD, STARTUP, SECURITY
  - Query builders: buildComplexQuery, buildTopicQuery, buildDateRangeQuery, buildLabelQuery

**Legacy Migration Scripts (PRESERVED - All Copied from Parent):**
- ✅ `legacy-scripts/` contains copies of all migration scripts from parent `/scripts/`:
  - `apply-labels-with-mapping.js` (11k) - Bulk label application with mapping
  - `apply-labels.js` (11k) - Apply labels to articles
  - `apply-single-label.js` (2.9k) - Single label application
  - `compare-urls.js` (9.5k) - Compare URLs between databases
  - `download-items-mapping.js` (5.9k) - Download and map items
  - `import-pocket.js` (42k) - Import from Pocket with progress tracking
  - `migrate-omnivore.js` (14k) - Migrate from SQLite to Omnivore
  - `test-auth.js` (984b) - Test API authentication
  - `test-create-label.js` (1.3k) - Test label creation
  - `check-missing-labeled.sql` (1.0k) - SQL query for missing labels
  - `find-redirected-urls.sql` (490b) - SQL query for redirected URLs

**TypeScript Foundation (CONFIGURED AND TESTED):**
- ✅ `tsconfig.json` - Development config with path aliases (@lib, @storage, etc.)
- ✅ `tsconfig.build.json` - Production build config (no source maps)
- ✅ Build system: `pnpm run build` successfully creates `dist/types/`
- ✅ Type checking: `pnpm run typecheck` passes with no errors
- ✅ Dev mode: `pnpm run dev` for watch mode

**Dependencies (COMPLETE - All in package.json):**

*Runtime Dependencies (10 packages):*
- ✅ `@anthropic-ai/sdk` (^0.20.0) - NEW: For content analysis/generation
- ✅ `@anthropic-ai/claude-agent-sdk` (^1.0.0) - For future agent integration
- ✅ `better-sqlite3` (^12.4.1) - Legacy scripts use SQLite
- ✅ `chalk` (^5.3.0) - Console output
- ✅ `csv-parse` (^6.1.0) - Legacy import scripts
- ✅ `dotenv` (^16.4.0) - Environment config
- ✅ `gray-matter` (^4.0.3) - Front-matter parsing
- ✅ `markdown-it` (^14.0.0) - Markdown processing
- ✅ `node-fetch` (^3.3.2) - HTTP (lib/omnivore/client.js uses this)
- ✅ `p-limit` (^5.0.0) - Rate limiting in legacy scripts

*Dev Dependencies (5 packages):*
- ✅ `@types/node` (^20.0.0) - Node.js types
- ✅ `typescript` (^5.4.0) - TypeScript compiler
- ✅ `tsx` (^4.0.0) - TypeScript execution
- ✅ `vitest` (^1.0.0) - Testing framework
- ✅ `nodemon` (^3.0.0) - Dev file watcher

**Configuration Files:**
- ✅ `.env.example` - Environment template (Omnivore + Anthropic config)
- ✅ `.gitignore` - Excludes node_modules, dist, .env, test-output
- ✅ `package.json` - Updated with all dependencies and build scripts
- ✅ `CLAUDE.md` - Agent context and content strategy

**Documentation (UPDATED):**
- ✅ `README.md` - Clear "NOT IMPLEMENTED" markers for all planned features
- ✅ `IMPLEMENTATION_PLAN.md` - This file with complete roadmap
- ✅ `EXTRACTION_CHECKLIST.md` - Step-by-step extraction guide

**Directory Structure (CREATED):**
- ✅ `src/` - TypeScript source directories (types, storage, analysis, generation, publishing, workflows, utils)
- ✅ `content/` - Storage directories (articles, analysis, generated/blog-posts, generated/newsletters, .metadata)
- ✅ `test-scripts/` - Test script directory with test-output/
- ✅ `cli/` - CLI tools directory
- ✅ `tests/` - Test directory

### What's NOT Included (Intentionally)

These remain in the parent omnivore repo and are NOT needed:
- ❌ `/scripts/*.js` - Original scripts location (COPIES in legacy-scripts/)
- ❌ `/self-hosting/` - Omnivore server setup (separate concern)
- ❌ Parent repo's package.json (omnivore-content-system has its own)
- ❌ Any SQLite databases (legacy scripts included but DBs not needed)

### Zero External Dependencies Verified

**No file system references outside this directory:**
- ✅ Verified: No `../../` paths to parent repo files
- ✅ Verified: No symlinks to parent repo
- ✅ Verified: No hardcoded absolute paths to parent repo
- ✅ Verified: All imports are relative within omnivore-content-system/
- ✅ Verified: Legacy scripts don't depend on parent repo (self-contained)

**Only configuration dependencies (set in .env file):**
- API endpoint: `OMNIVORE_API_URL=https://omnivore-api.caladan.haus/api/graphql`
- API key: `OMNIVORE_API_KEY=your-api-key`
- Anthropic key: `ANTHROPIC_API_KEY=your-anthropic-key`

### Extraction Commands

```bash
# From omnivore repo root
cd /Volumes/devel/personal/keybase/edgerouter/mac-mini/home/omnivore/omnivore

# Option 1: Copy to new location
cp -r scripts/omnivore-content-system /path/to/new-repo/

# Option 2: Move (if ready to extract)
mv scripts/omnivore-content-system /path/to/new-repo/

# Initialize new git repo
cd /path/to/new-repo/omnivore-content-system
git init
git add .
git commit -m "Initial commit: Omnivore content monetization system"
```

### Post-Extraction Setup

```bash
# In new standalone repo
cd omnivore-content-system

# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials:
# OMNIVORE_API_KEY=your-api-key
# OMNIVORE_API_URL=https://omnivore-api.caladan.haus/api/graphql
# ANTHROPIC_API_KEY=your-anthropic-key

# 3. Test Omnivore client
node lib/omnivore/client.js --test

# 4. Test TypeScript build
pnpm run build

# 5. Verify no errors
pnpm run typecheck
```

### Environment Variables Required

Create `.env` file with:

```bash
# Omnivore API Configuration
OMNIVORE_API_KEY=your_omnivore_api_key_here
OMNIVORE_API_URL=https://omnivore-api.caladan.haus/api/graphql

# Anthropic API Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Content Output (optional)
CONTENT_OUTPUT_DIR=./content
```

### What's NOT Included (Intentionally)

These remain in the parent omnivore repo and are NOT needed:
- ❌ `/scripts/migrate-omnivore.js` - Migration script (stays in omnivore repo)
- ❌ `/scripts/import-pocket.js` - Import script (stays in omnivore repo)
- ❌ `/self-hosting/` - Omnivore self-hosting setup (separate concern)
- ❌ Parent omnivore repo's package.json

The `legacy-scripts/` folder contains COPIES of migration scripts for reference, but content-system doesn't depend on them.

### Validation After Extraction

Run these commands to verify standalone operation:

```bash
# Should all pass
pnpm run typecheck    # ✅ No errors
pnpm run build        # ✅ Creates dist/
node lib/omnivore/client.js --test  # ✅ Connects to API
```

### GitHub Repository Setup (Optional)

```bash
# After extraction, if creating new GitHub repo
git remote add origin https://github.com/yourusername/omnivore-content-system.git
git branch -M main
git push -u origin main
```

### .gitignore Already Configured

The directory already has proper .gitignore (if not, create):

```
# Dependencies
node_modules/
pnpm-lock.yaml

# Build output
dist/

# Environment
.env
.env.local

# Test output
test-scripts/test-output/

# Runtime data
data/
*.sqlite
*.sqlite-journal

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

### Dependencies on Parent Repo: NONE

✅ **The omnivore-content-system has ZERO dependencies on the parent omnivore repo structure.**

All references to self-hosted Omnivore are via:
- API endpoint (configured in .env)
- API key (configured in .env)

No file system dependencies outside the omnivore-content-system/ directory.

---

## Project Structure (Updated)

```
omnivore-content-system/
├── lib/                          # ✅ Existing JavaScript client library
│   └── omnivore/
│       ├── client.js             # ✅ Working GraphQL client
│       └── queries.js            # ✅ Query builders
│
├── src/                          # 🆕 TypeScript source (new code)
│   ├── storage/                  # Storage layer (tracking + permanent)
│   │   ├── schema/
│   │   │   └── tracking-schema.sql  # AIDEV: tracking tables only
│   │   ├── database.ts           # AIDEV: DB init with boundary checks
│   │   ├── AnalysisQueueRepository.ts  # AIDEV: tracking CRUD
│   │   ├── AnalysisWriter.ts     # AIDEV: write to Markdown/JSONL
│   │   ├── ContentReader.ts      # Read Markdown files
│   │   └── SearchIndex.ts        # JSON-based search index (future)
│   │
│   ├── analysis/                 # Content analysis
│   │   ├── ContentAnalyzer.ts    # Analyze article content
│   │   ├── TopicExtractor.ts     # Extract topics
│   │   ├── SummaryGenerator.ts   # Generate summaries
│   │   └── prompts/              # Agent prompts
│   │       ├── analyze.md
│   │       └── summarize.md
│   │
│   ├── generation/               # Content generation
│   │   ├── BlogPostGenerator.ts  # Generate blog posts
│   │   ├── NewsletterGenerator.ts # Generate newsletters
│   │   └── prompts/
│   │       ├── blog-post.md
│   │       └── newsletter.md
│   │
│   ├── publishing/               # Publishing to platforms
│   │   ├── MarkdownPublisher.ts  # Output to Markdown files
│   │   └── GhostPublisher.ts     # Publish to Ghost (later)
│   │
│   ├── workflows/                # Automated workflows
│   │   ├── DailyAnalysis.ts
│   │   ├── WeeklyRoundup.ts
│   │   └── NewsletterCreation.ts
│   │
│   ├── utils/                    # Shared utilities
│   │   ├── frontmatter.ts        # Front-matter parsing
│   │   ├── markdown.ts           # Markdown utilities
│   │   ├── logger.ts             # Logging
│   │   └── anthropic.ts          # Anthropic API wrapper
│   │
│   └── types/                    # TypeScript types
│       ├── omnivore.ts           # Omnivore types
│       ├── content.ts            # Content types
│       └── index.ts
│
├── data/                         # ✅ Database storage (gitignored but permanent)
│   ├── omnivore-content.db       # SQLite: immutable AI snapshots + tracking
│   │                             # AIDEV: stores original analysis JSON + metadata
│   └── batches/                  # DEPRECATED: replaced by SQLite queue
│       └── current-batch.json
│
├── content/                      # ✅ Content storage (git-tracked)
│   ├── analysis/                 # Analysis results (Markdown, user-editable)
│   │   └── YYYY-MM-DD-{slug}-analysis.md
│   ├── corpus-reports/           # Corpus statistics
│   │   └── YYYY-MM-DD-report.md
│   └── generated/                # Generated content (future)
│       ├── blog-posts/
│       │   └── YYYY-MM-DD-{title}.md
│       └── newsletters/
│           └── YYYY-WW-roundup.md
│
├── test-scripts/                 # 🆕 Legacy test scripts
│   ├── 01-fetch-articles.js      # Reference: original fetch test
│   ├── 03-test-fixed-queries.js  # Reference: query validation
│   └── test-output/              # Test outputs (gitignored)
│
├── cli/                          # ✅ Working CLI tools
│   ├── fetch-articles.ts         # AIDEV: Omnivore API → tracking queue
│   ├── parallel-analyze.ts       # Archived (see cli/archived-scripts/)
│   ├── analysis-status.ts        # AIDEV: Show tracking queue status
│   ├── retry-failed.ts           # AIDEV: Retry failed analyses
│   ├── cleanup-completed.ts      # AIDEV: Remove completed from queue
│   ├── corpus-report.ts          # Generate statistics from Markdown
│   └── (future)                  # generate.ts, publish.ts
│
├── templates/                    # Template files
│   ├── blog-posts/
│   │   ├── single-article.md
│   │   └── weekly-roundup.md
│   └── newsletters/
│       └── weekly.md
│
├── legacy-scripts/               # ✅ Old migration scripts (preserved)
├── dist/                         # Compiled TypeScript (gitignored)
├── tests/                        # Automated tests
├── docs/                         # Documentation
│
├── .env.example
├── CLAUDE.md                     # Agent context
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

---

## Database Boundaries & Tables

### SQLite Database Structure

**Location**: `data/omnivore-content.db` (gitignored)

**Tables**:

1. **Existing Omnivore Tables** (READ-ONLY - if present)
   - Created by legacy import/migration scripts
   - NEVER modify from our code
   - All Omnivore updates via GraphQL API only
   - AIDEV-NOTE: `omnivore-boundary` - GraphQL only

2. **Tracking Tables** (READ-WRITE - our code)
   ```sql
   -- AIDEV-NOTE: tracking + immutable snapshots for querying
   CREATE TABLE analysis_queue (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     article_id TEXT NOT NULL UNIQUE,
     article_url TEXT NOT NULL,
     article_title TEXT NOT NULL,
     status TEXT CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')),
     error_message TEXT,
     retry_count INTEGER DEFAULT 0,
     created_at TEXT NOT NULL,
     updated_at TEXT NOT NULL
   );
   ```

### Boundary Enforcement

**Code Annotations** (mandatory):
```typescript
// AIDEV-NOTE: tracking + immutable snapshots - permanent storage
// AIDEV-NOTE: analysis-output-boundary - Markdown/JSONL, not DB
// AIDEV-NOTE: omnivore-boundary - GraphQL API only, never local cache
// AIDEV-NOTE: boundary-check - verify Omnivore tables unchanged
```

**Validation Checks**:
- `database.ts` validates no modification to Omnivore tables
- `AnalysisQueueRepository` only touches `analysis_queue` table
- All analysis output goes to Markdown/JSONL, never database

**Data Flow**:
```
Omnivore API (GraphQL)
    ↓ fetch article
SQLite analysis_queue (tracking: pending → in_progress)
    ↓ coordinate
@article-content-analyzer agent (5 concurrent)
    ↓ analyze
Markdown + JSONL (permanent, git-tracked)
    ↓ save
SQLite analysis_queue (tracking: in_progress → completed)
```

---

## Implementation Phases (Mechanics-First)

### Phase 0: Foundation Setup
**Goal**: Set up TypeScript tooling and project structure

**Note**: This phase is complete. See [Foundation & Type System](docs/_meta/foundation-and-types.md) for details on what exists.

**What This Phase Provides**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "paths": {
      "@lib/*": ["./lib/*"],
      "@storage/*": ["./src/storage/*"],
      "@analysis/*": ["./src/analysis/*"],
      "@generation/*": ["./src/generation/*"],
      "@utils/*": ["./src/utils/*"],
      "@types/*": ["./src/types/*"]
    }
  },
  "include": ["src/**/*", "lib/**/*"],
  "exclude": ["node_modules", "dist", "test-scripts", "legacy-scripts"]
}
```

**Deliverable**: `pnpm run build` compiles successfully
**Exit Criteria**: TypeScript compiles, path aliases resolve

---

### Phase 1: Type Definitions
**Goal**: Define TypeScript types for Omnivore API and content system

**Note**: This phase is complete. See [Foundation & Type System](docs/_meta/foundation-and-types.md) for all type definitions and usage examples.

**What This Phase Provides**:
- Omnivore API types (src/types/omnivore.ts): OmnivoreArticle, Label, Highlight, SearchResult, PageInfo
- Content storage types (src/types/content.ts): ArticleFrontMatter, AnalysisFrontMatter, StoredArticle, etc.
- Analysis types (src/types/analysis.ts): ContentAnalysis, AnalysisRequest, TopicScore, BatchAnalysisResult
- Central exports (src/types/index.ts): All types plus utility types and config interfaces

**Omnivore Article Type** (based on existing client.js):
```typescript
interface OmnivoreArticle {
  id: string;
  title: string;
  url: string;
  originalArticleUrl?: string;
  slug?: string;
  content?: string;
  description?: string;
  author?: string;
  image?: string;
  siteName?: string;
  pageType?: string;
  wordCount?: number;
  createdAt: string;
  savedAt: string;
  publishedAt?: string;
  updatedAt: string;
  readingProgressTopPercent?: number;
  isArchived: boolean;
  folder?: string;
  labels: Label[];
  highlights: Highlight[];
}

interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface Highlight {
  id: string;
  quote: string;
  annotation?: string;
  createdAt: string;
}
```

**Analysis Type**:
```typescript
interface ContentAnalysis {
  articleId: string;
  topics: string[];              // ["AI", "Machine Learning", "LLMs"]
  topicScores: Record<string, number>;  // { "AI": 0.95, "ML": 0.88 }
  summary: string;               // 2-3 sentence summary
  keyPoints: string[];           // 3-5 key takeaways
  sentiment: "positive" | "neutral" | "negative";
  monetizationAngle: string;     // How to turn into valuable content
  analyzedAt: string;            // ISO timestamp
}
```

**Article Front-matter**:
```typescript
interface ArticleFrontMatter {
  id: string;                    // Omnivore article ID
  url: string;
  title: string;
  author?: string;
  savedAt: string;
  publishedAt?: string;
  labels: string[];
  highlights: number;            // Count
  wordCount: number;
  topics?: string[];             // Added by analysis
  sentiment?: string;            // Added by analysis
  analyzed?: boolean;
}
```

**Deliverable**: All types compile, can be imported throughout codebase
**Exit Criteria**: `pnpm run typecheck` passes with no errors

---

### Phase 2: Building Block 1 - Content Fetching
**Goal**: Validate existing client can fetch articles with content

**Prerequisites** (see groundtruth):
- lib/omnivore/client.js - Full GraphQL client
- lib/omnivore/queries.js - Query builders
- See [Foundation & Type System](docs/_meta/foundation-and-types.md)

**Additions in Phase 2**:
- GraphQL fragment system (src/graphql/) - see [GraphQL Organization](docs/_meta/graphql-organization.md)

**Test Script**: `test-scripts/01-fetch-articles.js` validates fetching AI/ML articles with content

**Deliverable**: Can reliably fetch 10 AI articles with full content
**Exit Criteria**: Test script runs successfully, outputs valid JSON

**Anti-Drift Guardrails**:
- Use ONLY existing client.js (no rewrites)
- Test with real self-hosted API
- Save test outputs for inspection

---

### Phase 3: Building Block 2 - Analysis Storage & Tracking ✅ COMPLETE
**Goal**: Store AI-generated analysis results as Markdown files with YAML front-matter + SQLite tracking for parallel processing

**Status**: ✅ Complete (2025-10-01)
**Update**: ✅ Enhanced with slug support for article(slug, username) GQL query (2025-10-01)

**CRITICAL**: Omnivore IS the storage for source articles. Do NOT store source articles locally.

**Implemented Architecture**: Three-layer system (Omnivore → SQLite Tracking → Git-tracked Storage)

**What Was Built**:

1. **SQLite Storage Layer** (permanent, gitignored)
   - Database: `data/omnivore-content.db`
   - Table: `analysis_queue` (pending/in_progress/completed/failed status)
   - Purpose: Coordinate parallel analysis, prevent duplicate work
   - AIDEV-NOTE: tracking-only, not for analysis storage

2. **Analysis Storage** (permanent, git-tracked)
   - Location: `content/analysis/` (Markdown + JSONL)
   - Format: YAML front-matter + structured analysis
   - AIDEV-NOTE: analysis-output-boundary - results to Markdown/JSONL, NOT database

3. **CLI Tools** (see CLAUDE.md for complete command list)
   - Queue management: add, list, stats, reset, remove, clear, export, import, retry
   - Analysis operations: run, retry, status, watch
   - Reporting: corpus, topics, trends, monetization, sentiment

4. **Repository Classes** (TypeScript)
   - `AnalysisQueueRepository.ts` - CRUD for tracking queue (AIDEV: tracking-db)
   - `AnalysisWriter.ts` - Write to Markdown/JSONL (AIDEV: git-tracked-output)
   - Complete boundary enforcement with AIDEV annotations

**Analysis File Format** (as implemented):
```markdown
---
articleId: omnivore-abc123
articleUrl: https://example.com/article
articleTitle: Anthropic's New Claude Model
analyzedAt: 2025-09-30T10:00:00Z
topics: [ai, machine-learning, anthropic]
sentiment: positive
topicScores:
  ai: 0.95
  machine-learning: 0.88
  anthropic: 0.92
---

# Analysis: Anthropic's New Claude Model

## Summary
2-3 sentence summary capturing the main points...

## Key Points
- First key takeaway
- Second key takeaway
- Third key takeaway

## Monetization Angle
How this article could be turned into valuable content for your audience...
```

**Deliverables**:
- ✅ SQLite database with immutable analysis snapshots (permanent, gitignored)
- ✅ Analysis results in Markdown + JSONL (permanent, git-tracked)
- ✅ Parallel analysis workflow (5 concurrent agents via @article-content-analyzer)
- ✅ Complete job tracking and error recovery
- ✅ All AIDEV boundary annotations in place
- ✅ TypeScript builds successfully
- ✅ Package scripts updated (fetch, analyze:auto, analyze:retry, report:corpus)

**Exit Criteria Met**:
- ✅ Can track 100+ articles through analysis pipeline
- ✅ Parallel processing prevents duplicate work
- ✅ Analysis results saved to git-tracked files
- ✅ Boundary enforcement via AIDEV annotations
- ✅ Queue management (status, retry, cleanup) working
- ✅ Does NOT store source articles (Omnivore IS the storage)
- ✅ References source articles by ID/URL only

**Architectural Enhancement**:
Original design called for "Analysis Storage (ONLY)" with simple Markdown files. Implementation enhanced this with:
- SQLite layer for immutable AI snapshots + parallel coordination (permanent)
- JSONL format for machine-readable batch processing
- Retry mechanism with attempt tracking
- Status monitoring and queue management tools
- **Slug field in queue** for Omnivore article(slug, username) GQL query support

This maintains the original "git-tracked permanent storage" principle while adding robust parallel processing capabilities.

**GQL Query Enhancement** (2025-10-01):
- Added `article_slug` column to `analysis_queue` table
- Updated AnalysisQueueRepository to handle slug field
- Agents can fetch articles via getArticle(slug, username) per schema

**Workflow Documentation**:
- See CLAUDE.md "Article Analysis Workflow" section for CLI usage
- See `docs/_meta/architecture.md` for system design and storage boundaries
- See `docs/_meta/cli-reference.md` for command-line interface documentation
- See `docs/_meta/workflow-internals.md` for parallel analysis workflow details
- All boundary annotations documented in code

**Anti-Drift Guardrails Enforced**:
- ✅ **DO**: Store analysis results, generated content
- ❌ **DON'T**: Store source articles (Omnivore IS the storage)
- ✅ **DO**: Reference articles by ID/URL
- ❌ **DON'T**: Duplicate article content locally
- ✅ Git-track content/analysis/ and content/generated/ ONLY
- ✅ SQLite for tracking ONLY, not permanent storage
- ✅ All boundaries marked with AIDEV-NOTE annotations

---

### Phase 4: Building Block 3 - Content Analysis
**Goal**: Extract topics, summary, key points from article using Claude

**Agent Prompt** (src/analysis/prompts/analyze.md):
```markdown
# Content Analysis Prompt

You are analyzing an article for content monetization. Your goal is to extract structured insights that can be used to create valuable blog posts and newsletters.

## Input Article

**Title**: {{ article.title }}
**Author**: {{ article.author }}
**URL**: {{ article.url }}
**Published**: {{ article.publishedAt }}
**Word Count**: {{ article.wordCount }}

**Content**:
{{ article.content }}

{% if article.highlights.length > 0 %}
**Highlights**:
{% for highlight in article.highlights %}
- {{ highlight.quote }}
  {% if highlight.annotation %}Note: {{ highlight.annotation }}{% endif %}
{% endfor %}
{% endif %}

## Analysis Task

Extract the following information in JSON format:

```json
{
  "topics": ["topic1", "topic2", "topic3"],
  "topicScores": {
    "topic1": 0.95,
    "topic2": 0.88,
    "topic3": 0.75
  },
  "summary": "2-3 sentence summary capturing the main points",
  "keyPoints": [
    "First key takeaway",
    "Second key takeaway",
    "Third key takeaway"
  ],
  "sentiment": "positive|neutral|negative",
  "monetizationAngle": "How this article could be turned into valuable content for your audience"
}
```

## Guidelines

1. **Topics**: 2-5 main topics, prioritizing AI, machine learning, software engineering, DevOps, databases, cloud, startups
2. **Topic Scores**: 0-1 confidence score for each topic
3. **Summary**: Focus on "so what?" - why does this matter?
4. **Key Points**: Actionable insights or surprising facts
5. **Sentiment**: Overall tone of the article
6. **Monetization Angle**: How to package this for your audience (e.g., "Compare with 2 other LLM papers for comparison post", "Tutorial on applying this technique")

Return ONLY valid JSON, no markdown code blocks.
```

**Tasks**:
- [ ] Implement ContentAnalyzer.ts (src/analysis/ContentAnalyzer.ts)
  - Load prompt template
  - Call Anthropic API with article content
  - Parse JSON response
  - Handle API errors/retries
  - Rate limiting (respect API limits)
- [ ] Implement AnalysisWriter.ts (src/storage/AnalysisWriter.ts)
  - Save analysis as Markdown with front-matter
  - Update article's front-matter with topics/sentiment
- [ ] Implement anthropic.ts utility (src/utils/anthropic.ts)
  - Wrapper for Anthropic API
  - Retry logic with exponential backoff
  - Token counting
  - Cost tracking

**Test Script**: `test-scripts/03-analyze-content.ts`
```typescript
#!/usr/bin/env node

/**
 * Test: Analyze article content with Claude
 * Validates: API call, prompt rendering, JSON parsing
 */

import { ContentReader } from '../src/storage/ContentReader';
import { ContentAnalyzer } from '../src/analysis/ContentAnalyzer';
import { AnalysisWriter } from '../src/storage/AnalysisWriter';

// Read stored article
const reader = new ContentReader('content/articles');
const articles = await reader.list();
const article = await reader.read(articles[0]);

console.log(`Analyzing: ${article.frontMatter.title}`);

// Analyze (calls Claude API)
const analyzer = new ContentAnalyzer();
const analysis = await analyzer.analyze({
  title: article.frontMatter.title,
  author: article.frontMatter.author,
  url: article.frontMatter.url,
  content: article.content,
  wordCount: article.frontMatter.wordCount,
  highlights: article.highlights || []
});

console.log('\nAnalysis Result:');
console.log(JSON.stringify(analysis, null, 2));

// Save analysis
const writer = new AnalysisWriter('content/analysis');
const analysisPath = await writer.write(article.frontMatter.id, analysis);

console.log(`\n✓ Saved analysis to: ${analysisPath}`);
```

**Deliverable**: Can analyze article and extract structured insights
**Exit Criteria**:
- Claude API call succeeds
- Returns valid JSON
- Topics extracted correctly
- Analysis saved as Markdown

**Post-Phase: Update Groundtruth**
- Create `docs/_meta/analysis-and-generation.md` or update existing groundtruth
- Document ContentAnalyzer, AnalysisWriter classes
- Document prompt templates and how to use them
- Include Anthropic API usage patterns and error handling
- Use @documentation-writer agent

**Anti-Drift Guardrails**:
- Use Anthropic API directly (not Agent SDK yet)
- Test prompt in this chat first
- Track API costs
- Handle rate limiting

---

### Phase 5: Building Block 4 - Content Generation
**Goal**: Generate blog post from analyzed articles

**Agent Prompt** (src/generation/prompts/blog-post.md):
```markdown
# Blog Post Generation Prompt

Generate a blog post based on the analyzed articles below. Follow the writing style and content strategy from the user's guidelines.

## Writing Style (from CLAUDE.md)
- Authoritative yet accessible
- Opinionated with evidence
- Practical and actionable
- Conversational tone
- Short paragraphs (2-3 sentences)
- Use subheadings, bullet points, examples

## Analyzed Articles

{% for article in articles %}
### {{ article.title }}
**URL**: {{ article.url }}
**Author**: {{ article.author }}
**Topics**: {{ article.analysis.topics.join(', ') }}

**Summary**: {{ article.analysis.summary }}

**Key Points**:
{% for point in article.analysis.keyPoints %}
- {{ point }}
{% endfor %}

**Monetization Angle**: {{ article.analysis.monetizationAngle }}

{% endfor %}

## Generation Task

Create a blog post with:

1. **SEO-Optimized Title**: 60 chars max, keyword-rich, curiosity-driven
2. **Meta Description**: 155 chars, compelling summary
3. **Hook**: Start with surprising insight or provocative question
4. **Content Structure**:
   - Introduction with context
   - Analysis of each article (with links)
   - Synthesis connecting multiple sources
   - Practical implications
   - Call-to-action
5. **Length**: 800-1200 words
6. **Links**: Include article URLs as sources

Return in this format:

```yaml
---
title: "SEO Title Here"
metaDescription: "Meta description here"
topics: [topic1, topic2]
publishedAt: {{ now }}
sources:
  - {{ article1.url }}
  - {{ article2.url }}
---

# Actual Title (Can Be Different from SEO Title)

Hook paragraph...

## First Section

Content...

[Link to article](url)

## Conclusion

CTA...
```
```

**Tasks**:
- [ ] Implement BlogPostGenerator.ts (src/generation/BlogPostGenerator.ts)
  - Load analyzed articles
  - Render prompt with article data
  - Call Claude API
  - Parse Markdown response
  - Save to content/generated/blog-posts/
- [ ] Implement template utilities (src/utils/markdown.ts)
  - Markdown parsing and manipulation
  - Slug generation
  - Link validation

**Test Script**: `test-scripts/04-generate-post.ts`
```typescript
#!/usr/bin/env node

/**
 * Test: Generate blog post from analyzed articles
 * Validates: Prompt rendering, content generation, post structure
 */

import { ContentReader } from '../src/storage/ContentReader';
import { BlogPostGenerator } from '../src/generation/BlogPostGenerator';

// Read analyzed articles (last 5)
const articleReader = new ContentReader('content/articles');
const analysisReader = new ContentReader('content/analysis');

const articles = (await articleReader.list()).slice(0, 5);

// Load with analysis
const articlesWithAnalysis = await Promise.all(
  articles.map(async (filePath) => {
    const article = await articleReader.read(filePath);
    const analysisPath = filePath.replace('/articles/', '/analysis/');
    const analysis = await analysisReader.read(analysisPath);
    return { ...article, analysis };
  })
);

console.log(`Generating blog post from ${articlesWithAnalysis.length} articles...`);

// Generate
const generator = new BlogPostGenerator();
const blogPost = await generator.generate(articlesWithAnalysis, {
  type: 'weekly-roundup',
  title: 'AI This Week: Top Stories You Need to Know'
});

console.log('\nGenerated Blog Post:');
console.log('Title:', blogPost.frontMatter.title);
console.log('Meta:', blogPost.frontMatter.metaDescription);
console.log('Word count:', blogPost.content.split(/\s+/).length);
console.log('Sources:', blogPost.frontMatter.sources.length);

// Save
const outputPath = `content/generated/blog-posts/${blogPost.slug}.md`;
await generator.save(blogPost, outputPath);

console.log(`\n✓ Saved to: ${outputPath}`);
```

**Deliverable**: Can generate blog post from analyzed articles
**Exit Criteria**:
- Post has proper structure
- Links to source articles
- Follows writing style
- 800-1200 words
- SEO-optimized title/meta

**Post-Phase: Update Groundtruth**
- Update `docs/_meta/analysis-and-generation.md` with generation classes
- Document BlogPostGenerator, template system
- Include generation prompt patterns and configuration
- Show examples of different content types (roundup, deep-dive, etc.)
- Use @documentation-writer agent

**Anti-Drift Guardrails**:
- Test prompt in chat first
- Follow CLAUDE.md guidelines
- Generate one format (weekly roundup) first
- Validate output structure

---

### Phase 6: Building Block 5 - Publishing
**Goal**: Output generated content to Markdown (Ghost later)

**Tasks**:
- [ ] Implement MarkdownPublisher.ts (src/publishing/MarkdownPublisher.ts)
  - Copy from content/generated/ to public output directory
  - Add publication metadata to front-matter
  - Generate index of published posts
- [ ] (Later) Implement GhostPublisher.ts
  - Authenticate with Ghost Admin API
  - Create draft post
  - Upload as draft (not published)
  - Return post URL

**Test Script**: `test-scripts/05-publish.ts`
```typescript
#!/usr/bin/env node

/**
 * Test: Publish generated blog post
 * Validates: File operations, metadata updates
 */

import { MarkdownPublisher } from '../src/publishing/MarkdownPublisher';

const publisher = new MarkdownPublisher('public/blog');

// Publish latest generated post
const generated = await publisher.getUnpublished('content/generated/blog-posts');
const latestPost = generated[0];

console.log(`Publishing: ${latestPost.frontMatter.title}`);

const result = await publisher.publish(latestPost);

console.log(`\n✓ Published to: ${result.publicPath}`);
console.log(`  Added publishedAt: ${result.publishedAt}`);
```

**Deliverable**: Can output Markdown files for publishing
**Exit Criteria**:
- Files copied to public directory
- Metadata updated
- Index generated

**Post-Phase: Update Groundtruth**
- Create `docs/_meta/publishing-and-workflows.md` or update existing groundtruth
- Document MarkdownPublisher and any other publishing modules
- Include publishing patterns and metadata handling
- Use @documentation-writer agent

---

## Integrated Workflows (After Building Blocks Proven)

### Workflow 1: Daily Analysis
**Trigger**: Manual command
**Steps**:
1. Fetch articles saved in last 24 hours (AI/Tech topics)
2. Store as Markdown files
3. Analyze each article
4. Update search index

**CLI**: `pnpm run fetch-daily`

### Workflow 2: Weekly Roundup
**Trigger**: Manual command (Friday)
**Steps**:
1. List analyzed articles from last 7 days
2. Filter by topic (AI/Tech)
3. Generate weekly roundup blog post
4. Output to Markdown

**CLI**: `pnpm run generate-roundup`

### Workflow 3: Newsletter Creation
**Trigger**: Manual command (Sunday)
**Steps**:
1. List analyzed articles from last week
2. Generate newsletter with curated links
3. Output to Markdown

**CLI**: `pnpm run generate-newsletter`

---

## Success Criteria

### Building Block Completion
Each building block is complete when:
- [ ] Test script runs successfully
- [ ] Output validated manually
- [ ] No errors in console
- [ ] Follows DRY principles
- [ ] Anti-drift guardrails documented

### Promotion to Production
Code moves from test-scripts → cli → src when:
- [ ] Proven to work reliably (5+ successful runs)
- [ ] Error handling added
- [ ] Logging added
- [ ] Configuration externalized
- [ ] Code reviewed for DRY violations

### System Complete
System is complete when:
- [ ] Can fetch articles from Omnivore ✅ (proven)
- [ ] Can store articles as Markdown
- [ ] Can analyze article content
- [ ] Can generate blog posts
- [ ] Can generate newsletters
- [ ] All workflows run end-to-end
- [ ] Documentation complete

---

## Anti-Drift Guardrails

### Phase 0 (Foundation)
- ✅ **DO**: Use existing lib/omnivore/ client as library
- ✅ **DO**: Set up TypeScript for new code only
- ✅ **DO**: Create clear directory structure
- ❌ **DON'T**: Rewrite existing working client
- ❌ **DON'T**: Add database (use front-matter + Git)
- ❌ **DON'T**: Over-engineer build system

### Phase 2 (Fetching)
- ✅ **DO**: Use existing client.js and queries.js
- ✅ **DO**: Test with real self-hosted API
- ✅ **DO**: Use topic queries from queries.js
- ❌ **DON'T**: Build new GraphQL client
- ❌ **DON'T**: Cache responses (fetch fresh each time)
- ❌ **DON'T**: Add rate limiting yet (API handles it)

### Phase 3 (Storage & Tracking)
- ✅ **DO**: Use gray-matter for front-matter (permanent storage)
- ✅ **DO**: Git-track content/ directory (analysis results)
- ✅ **DO**: Use SQLite for immutable AI snapshots + tracking (permanent storage)
- ✅ **DO**: Add AIDEV-NOTE annotations for all boundaries
- ✅ **DO**: Keep Omnivore tables READ-ONLY (never modify)
- ✅ **DO**: Query Omnivore via GraphQL API, not local cache
- ✅ **DO**: Write analysis results to Markdown/JSONL, not database
- ❌ **DON'T**: Store analysis results in SQLite
- ❌ **DON'T**: Modify Omnivore cache tables
- ❌ **DON'T**: Use SQLite for anything permanent
- ❌ **DON'T**: Skip boundary annotations

### Phase 4 (Analysis)
- ✅ **DO**: Test prompt in this chat first
- ✅ **DO**: Use Anthropic API directly initially
- ✅ **DO**: Track API costs
- ❌ **DON'T**: Use Agent SDK yet
- ❌ **DON'T**: Over-complicate prompt
- ❌ **DON'T**: Add ML/embeddings

### Phase 5 (Generation)
- ✅ **DO**: Follow CLAUDE.md writing guidelines
- ✅ **DO**: Test prompt in chat first
- ✅ **DO**: Generate one format first (weekly roundup)
- ❌ **DON'T**: Build complex template engine
- ❌ **DON'T**: Add WYSIWYG editor
- ❌ **DON'T**: Implement multiple formats at once

### General
- ✅ **DO**: Build one mechanic at a time
- ✅ **DO**: Test manually before automating
- ✅ **DO**: Keep it simple
- ❌ **DON'T**: Skip test-scripts phase
- ❌ **DON'T**: Optimize prematurely
- ❌ **DON'T**: Add features not in plan

### Groundtruth Documentation (CRITICAL)
- ✅ **DO**: Read groundtruth docs BEFORE starting any phase
- ✅ **DO**: Update groundtruth IMMEDIATELY after implementing reusable code
- ✅ **DO**: Use @documentation-writer agent for groundtruth updates
- ✅ **DO**: Check for drift by comparing implementation to groundtruth
- ✅ **DO**: Self-correct if drift is found
- ✅ **DO**: Document with hard-to-vary facts and usage examples
- ❌ **DON'T**: Add status markers ("complete", "done", "implemented") to groundtruth
- ❌ **DON'T**: Wait until "the end" to update groundtruth
- ❌ **DON'T**: Manually edit groundtruth (use documentation-writer agent)
- ❌ **DON'T**: Skip drift checking when adding new features
- ❌ **DON'T**: Duplicate functionality without checking groundtruth first

---

## Dependencies Summary

**Current State** (omnivore-content-system/package.json):
```json
{
  "dependencies": {
    // EXISTING - Keep (used by legacy-scripts/ and lib/omnivore/)
    "@anthropic-ai/claude-agent-sdk": "^1.0.0",  // For future agent integration
    "better-sqlite3": "^12.4.1",                  // Legacy scripts use SQLite
    "chalk": "^5.3.0",                            // Console output
    "csv-parse": "^6.1.0",                        // Legacy import scripts
    "dotenv": "^16.4.0",                          // Environment config
    "gray-matter": "^4.0.3",                      // Front-matter parsing
    "markdown-it": "^14.0.0",                     // Markdown processing
    "node-fetch": "^3.3.2",                       // HTTP (lib/omnivore/client.js)
    "p-limit": "^5.0.0",                          // Rate limiting in legacy scripts

    // NEW - Add for content system
    "@anthropic-ai/sdk": "^0.20.0"                // Claude API for analysis/generation
  },
  "devDependencies": {
    "nodemon": "^3.0.0",                          // EXISTING - Dev watcher

    // NEW - Add for TypeScript
    "@types/node": "^20.0.0",                     // Node types
    "typescript": "^5.4.0",                       // TypeScript compiler
    "tsx": "^4.0.0",                              // TypeScript execution
    "vitest": "^1.0.0"                            // Testing framework
  }
}
```

**Important**:
- **ONLY ADD new dependencies** - never remove existing ones
- `better-sqlite3`, `csv-parse`, `p-limit` are used by legacy-scripts/ (migrate, import)
- `node-fetch` is used by existing lib/omnivore/client.js
- New content system uses front-matter + Git (not SQLite), but legacy scripts still need it
- When content system moves to its own repo, dependencies can be cleaned up then

---

## Test Promotion Path

```
┌─────────────────┐
│ test-scripts/   │  Quick proof-of-concept
│  01-fetch.js    │  No error handling
│  02-store.ts    │  Console output only
│  03-analyze.ts  │  Test real API
└────────┬────────┘
         │ PROVEN (5+ successful runs)
         ↓
┌─────────────────┐
│ cli/            │  Working CLI tools
│  fetch.ts       │  + Error handling
│  analyze.ts     │  + Logging
│  generate.ts    │  + Config
└────────┬────────┘
         │ RELIABLE (daily use)
         ↓
┌─────────────────┐
│ src/            │  Production TypeScript
│  storage/       │  + Tests
│  analysis/      │  + Documentation
│  generation/    │  + Type safety
└─────────────────┘
```

---

## Notes

- **Existing client library** (lib/omnivore/) should NOT be modified or rewritten
- **Self-hosted Omnivore** at omnivore-api.caladan.haus is the source of truth
- **Front-matter + Git** replaces database for simplicity
- **Agent prompts** should be tested in chat before implementation
- **Test scripts** are throwaway code - fast iteration, no perfectionism
- **CLI tools** are daily-use scripts - reliable but not production-grade
- **TypeScript src/** is production code - tested, documented, type-safe
- **One building block at a time** - no parallel development until mechanics proven
