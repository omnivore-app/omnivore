# CLI Reference

**Purpose**: Comprehensive command-line interface documentation for the Omnivore Content System.

**Last Updated**: 2026-01-30

**Status**: This file historically mixed design intent with implementation notes. For a full ground-truth audit (including known breakages and fixes), see `docs/_meta/current-state.md`.

## Overview

The CLI provides commands for managing the article analysis queue, fetching content from Omnivore, running analysis, and generating reports. All commands use the `omc` binary.

## Queue Management Commands

### queue add

**Command**: `omc queue add`

**Purpose**: Fetch articles from Omnivore and populate tracking queue.

**Usage**:
```bash
omc queue add --hours 24        # Last 24 hours
omc queue add --label "ai-ml"   # By label
omc queue add --url <url>       # Single article
omc queue add --slug <slug>     # By slug
```

**Parameters**:
- `--hours=N` - Fetch articles from last N hours
- `--label=X` - Fetch articles with specific label
- `--url=X` - Add single article by URL
- `--slug=X` - Add single article by slug

**What It Does (Current)**:
1. Fetches articles from Omnivore (by hours / label / url / slug)
2. Converts results into `{id, slug, url, title, savedAt}` queue rows
3. Inserts into `analysis_queue` via `INSERT OR IGNORE` (deduplication by `article_id`)

**Notes**:
- Content-length filtering and label distribution output are not currently implemented in `omc queue add`.

**Output Example**:
```
Added 38 articles to queue (45 total found)
```

**AIDEV Annotations**:
- `omnivore-boundary` - Fetches via GraphQL API, populates tracking queue
- `tracking-initialization` - Adds articles to SQLite queue for parallel analysis

## Omnivore Integration Commands

### omnivore get

**Command**: `omc omnivore get`

**Purpose**: Fetch an article by slug (metadata by default; raw content with `--content`; full JSON including `content` with `--json`).

**Usage**:
```bash
omc omnivore get <articleSlug>
omc omnivore get <articleSlug> --content
omc omnivore get <articleSlug> --json
```

**Parameters**:
- `articleSlug` - Article slug from Omnivore URL or metadata
- Username is loaded from .env file automatically

**What It Does (Current)**:
1. Queries Omnivore GraphQL API using `article(slug, username)`
2. Default output is a human-readable summary (title/url/author/description)
3. With `--json`, prints the full Article payload (including `content`)
4. With `--content`, prints the raw article content to stdout (agent-friendly)

**Agent usage**:
- Prefer `omc omnivore get <slug> --content` for stable, parse-free access to the article body.
- If you also need metadata, use `--json` and extract `.content`.

**Why Needed**:
- Agents execute via Bash tool and cannot import TypeScript modules
- Provides clean separation between content fetching and analysis
- Enables zero-context-pollution agent workflow (each agent fetches independently)

**Usage in Agent Workflow**:
```typescript
// Agent reads stub file for slug
const stub = JSON.parse(fs.readFileSync(`temp/${filename}`, 'utf-8'));

// Agent calls CLI tool to get content
const contentResult = await bash(`omc omnivore get ${stub.articleSlug}`);
const articleContent = contentResult.stdout;

// Agent analyzes content...
```

**AIDEV Annotations**:
- `omnivore-boundary` - Fetches via GraphQL API, outputs to stdout
- `agent-workflow` - Enables agents to fetch content without TypeScript imports

## Analysis Commands

### analyze auto

**Command**: `omc analyze auto`

**Purpose**: Run the full analysis pipeline non-interactively (cron/launchd friendly).

**Usage**:
```bash
omc analyze auto --batch-size 5
omc analyze auto --article-id <id>
omc analyze auto --all --batch-size 5
omc analyze auto --json
omc analyze auto --batch-size 5 --jsonl
```

**What It Does (Current)**:
1. Selects jobs from the SQLite queue (`pending` by default; `pending+failed` with `--all`)
2. Fetches article content from Omnivore
3. Calls `codex exec` in **read-only** mode to produce a `ContentAnalysis` JSON object
4. Writes Markdown under `content/analysis/` and stores an immutable analysis snapshot in SQLite
5. Deletes `temp/{slug}.jsonl` unless `--keep-temp`

**Notes**:
- Codex session files are written under `CODEX_HOME`. For automation, the CLI sets `CODEX_HOME=temp/codex-home` so runs don’t depend on `~/.codex` permissions.
- JSONL output is optional: enable with `--jsonl` (defaults to `content/analysis/analyses.jsonl`).

### analyze run

**Command**: `omc analyze run`

**Purpose**: Run parallel analysis on queued articles with zero-context-pollution design.

**Usage**:
```bash
omc analyze run                # Process next 5 articles (default)
omc analyze run --batch-size 10  # Custom batch size
omc analyze run --article-id <id>  # Analyze specific article
omc analyze run --all          # Process entire queue
```

**What It Does**:
1. Fetches next 5 pending jobs from tracking queue
2. Marks jobs as `in_progress` (coordination lock)
3. Fetches article metadata from Omnivore API using `getArticle(slug, username)`
4. Creates slug-based stub files: `temp/{articleSlug}.jsonl` (prevents overwrites when running multiple batches)
5. Each stub file contains: `articleId`, `articleSlug`, `username`, `articleUrl`, `articleTitle`, `savedAt`, `publishedAt`, `updatedAt`
6. Outputs JSON array with agent parameters for parallel invocation
7. Closes database connection (agents get fresh connections with no context pollution)

**File Naming Strategy**:
- Stub files use article slug: `temp/{articleSlug}.jsonl` (e.g., `temp/understanding-llm-fine-tuning.jsonl`)
- Prevents overwrites when running multiple batches before agents complete
- Enables agents to work independently without coordination

**Output Example**:
```
Analysis Queue Status
  Total: 75
  Pending: 42
  In Progress: 0
  Completed: 30
  Failed: 3

Processing batch of 5 articles...

Fetching article metadata from Omnivore API...
✓ Fetched 5 articles
✓ Created stub files: temp/*.jsonl

READY FOR PARALLEL ANALYSIS

[
  {
    "filename": "temp/understanding-llm-fine-tuning.jsonl",
    "articleId": "abc-123",
    "articleSlug": "understanding-llm-fine-tuning",
    "username": "myusername",
    "articleTitle": "Understanding LLM Fine-Tuning Techniques"
  },
  ...
]

Instructions:
1. Invoke 5 @article-content-analyzer agents in parallel (single message)
2. Each agent receives: filename, articleId, articleSlug, username, articleTitle
3. Wait for all agents to complete
4. Run: `omc analyze complete`
```

**AIDEV Annotations**:
- `tracking-coordination` - Uses SQLite queue for parallel execution
- `omnivore-boundary` - Fetches articles via GraphQL API, never local cache
- `tracking-lock` - Marks jobs in_progress to prevent duplicate analysis
- `zero-context-pollution` - Creates stub files, closes DB before agent invocation

### analyze complete

**Command**: `omc analyze complete`

**Purpose**: Persist enriched temp files by writing Markdown + storing an immutable `analysis_json` snapshot in SQLite, then marking jobs completed.

**Input Format** (enriched temp files):
```json
{
  "articleId": "abc-123",
  "articleSlug": "understanding-llm-fine-tuning",
  "username": "myusername",
  "articleUrl": "https://example.com/article",
  "articleTitle": "Article Title",
  "savedAt": "2025-09-30T10:00:00Z",
  "publishedAt": "2025-09-29T14:00:00Z",
  "updatedAt": "2025-09-30T08:00:00Z",
  "analysis": {
    "topics": ["ai", "developer-tools"],
    "topicScores": { "ai": 0.95, "developer-tools": 0.88 },
    "summary": "Article summary...",
    "keyPoints": ["point1", "point2"],
    "sentiment": "positive",
    "monetizationAngle": "Content opportunity...",
    "analyzedAt": "2025-10-01T04:30:00Z"
  }
}
```

**What It Does (Current)**:
1. Scans `temp/*.jsonl` for files that contain an `analysis` field
2. For each enriched temp file:
   - Writes Markdown file under `content/analysis/` (date from `savedAt`; slug derived from `articleSlug` when available, otherwise title)
   - Stores `analysis_json` + `markdown_path` into `analysis_queue`
   - Updates tracking status to `completed`
   - Deletes the temp file unless `--keep-temp`
3. On error: marks job as `failed` in tracking queue and preserves the temp file

**JSONL Output (Optional)**:
- Use `--jsonl` to append a machine-readable record to `content/analysis/analyses.jsonl` for each completed analysis.

**File Naming Strategy**:
- Markdown: `content/analysis/YYYY-MM-DD-{slug}-analysis.md` (date from `savedAt`)
- JSONL: written when `--jsonl` is set (`content/analysis/analyses.jsonl` by default)
- Temp files: Automatically deleted after successful save using `unlinkSync(file)`

**Output Example**:
```
Loaded 5 analysis results from temp files
✓ Saved: Understanding LLM Fine-Tuning Techniques...
  → content/analysis/2025-09-30-understanding-llm-fine-tuning-analysis.md
  → Deleted: temp/understanding-llm-fine-tuning.jsonl
✓ Saved: Building Scalable Microservices with Kubernetes...
  → content/analysis/2025-09-29-building-scalable-microservices.md
  → Deleted: temp/building-scalable-microservices.jsonl
✗ Failed: Another Article... - Parse error
  → Preserved: temp/another-article.jsonl

Results:
  Saved: 4
  Failed: 1

Updated Queue Status:
  Pending: 37
  Completed: 34
  Failed: 4
```

**AIDEV Annotations**:
- `analysis-output-boundary` - Saves results to git-tracked Markdown (plus immutable DB snapshot)
- `tracking-update` - Updates SQLite queue status after save
- `git-tracked-output` - Analysis result stored permanently
- `temp-file-cleanup` - Deletes temp files after successful DB save

### analyze status

**Command**: `omc analyze status`

**Purpose**: Show queue statistics and failed/in-progress jobs.

**Usage**:
```bash
omc analyze status
```

**What It Does**:
- Shows queue statistics (total, pending, in_progress, completed, failed)
- Lists failed jobs with error messages and retry counts
- Lists in-progress jobs with assignment timestamps

**Output Example**:
```
Analysis Queue Status
  Total: 75
  Pending: 37 (49%)
  In Progress: 0
  Completed: 33 (44%)
  Failed: 5

Failed Jobs:

  Article: Article That Failed Analysis Due to Timeout...
  ID: xyz-789
  Error: Agent timeout after 120s
  Retries: 2

  Article: Another Failed Article with Parse Error...
  ID: abc-321
  Error: JSON parse error
  Retries: 1
```

**AIDEV Annotations**:
- `tracking-inspection` - Shows queue status, not analysis content

### analyze retry

**Command**: `omc analyze retry`

**Purpose**: Reset failed jobs to pending for retry (max 3 attempts).
**Purpose**: Reset failed jobs to `pending` for retry.

**Usage**:
```bash
omc analyze retry --failed         # Retry all failed
omc analyze retry --article-id <id>  # Retry specific article
```

**What It Does (Current)**:
1. Fetches failed jobs (or a single `--article-id`)
2. Resets status to `pending` and clears error/assigned fields
3. Does not currently enforce a max retry limit (the DB keeps `retry_count` for visibility)

**Output Example**:
```
Found 5 failed jobs

✓ Reset: Article That Failed Analysis... (attempt 3)
✓ Reset: Another Failed Article... (attempt 2)
✗ Skip: Permanently Failed Article... (max retries exceeded)

Summary:
  Reset for retry: 4
  Skipped (max retries): 1

Next step: `omc analyze run`
```

**AIDEV Annotations**:
- `tracking-retry` - Resets failed jobs to pending for another attempt

## Reporting Commands

### report corpus

**Command**: `omc report corpus`

**Purpose**: Generate corpus statistics and topic distribution report.

**Usage**:
```bash
omc report corpus
```

**What It Does**:
- Loads completed analyses from SQLite (`analysis_queue.analysis_json`) via `AnalysisQueueRepository.getCompletedWithAnalysis()`
- Generates statistics: total analyses, topic distribution, sentiment distribution, content-type distribution
- Prints the report to stdout (use `--json` for machine-readable output)

**Note**:
- `omc report corpus` reads from SQLite (`analysis_queue.analysis_json`). JSONL is an optional *write-only* output for downstream tooling.

## Storage Layer Commands

**Note**: The most reliable source of truth for the storage-layer API is `src/storage/AnalysisQueueRepository.ts` and `src/storage/AnalysisWriter.ts`. Some type snippets below may drift as the code evolves.

### AnalysisQueueRepository

**Location**: `src/storage/AnalysisQueueRepository.ts`

**Purpose**: Repository for analysis job queue management.

**Import**:
```typescript
import { AnalysisQueueRepository } from '@storage/AnalysisQueueRepository';
import type { AnalysisJob, QueueStats } from '@storage/AnalysisQueueRepository';
```

**Types**:

```typescript
interface AnalysisJob {
  id: number;
  articleId: string;
  articleUrl: string;
  articleTitle: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

interface QueueStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
}
```

**Constructor**:
```typescript
const queueRepo = new AnalysisQueueRepository(db);
```

**Methods**:

1. **`initializeQueue(articles): number`** - Initialize queue from article metadata
   - Parameter: `articles: Array<{ id: string; url: string; title: string }>`
   - Returns: Number of articles inserted (duplicates ignored by UNIQUE constraint)
   - Sets status to `pending` for all new articles
   - AIDEV: `tracking-initialization`

2. **`getPending(limit?: number): AnalysisJob[]`** - Get next batch of pending jobs
   - Default limit: 5
   - Returns jobs in chronological order (oldest first)
   - AIDEV: `tracking-coordination`

3. **`markInProgress(articleId: string): void`** - Lock job for processing
   - Sets status to `in_progress`
   - Records `assigned_at` timestamp
   - Prevents duplicate analysis by parallel workers
   - AIDEV: `tracking-lock`

4. **`markCompleted(articleId: string): void`** - Mark job as completed
   - Sets status to `completed`
   - Records `completed_at` timestamp
   - Called AFTER analysis saved to Markdown/JSONL
   - AIDEV: `tracking-completion`

5. **`markFailed(articleId: string, errorMessage: string): void`** - Mark job as failed
   - Sets status to `failed`
   - Stores error message
   - Increments `retry_count`
   - AIDEV: `tracking-error`

6. **`resetToPending(articleId: string): void`** - Reset failed job for retry
   - Sets status back to `pending`
   - Clears error message and `assigned_at`
   - Does NOT reset `retry_count` (used to enforce max retries)
   - AIDEV: `tracking-retry`

7. **`getStats(): QueueStats`** - Get queue statistics
   - Returns counts for all statuses
   - Used for progress monitoring
   - AIDEV: `tracking-stats`

8. **`getFailed(): AnalysisJob[]`** - Get all failed jobs
   - Sorted by retry count (most retries first), then updated time
   - Used for error investigation
   - AIDEV: `tracking-failures`

9. **`getByStatus(status: string): AnalysisJob[]`** - Get jobs by status
   - Returns jobs matching specified status
   - Sorted by creation time (newest first)

10. **`getByArticleId(articleId: string): AnalysisJob | null`** - Get specific job
    - Returns job or `null` if not found

11. **`hasArticle(articleId: string): boolean`** - Check if article in queue
    - Returns `true` if article exists (any status)
    - AIDEV: `tracking-deduplication`

12. **`clearCompleted(): number`** - Remove completed jobs
    - Deletes all jobs with `completed` status
    - Returns number of deleted jobs
    - AIDEV: `tracking-cleanup`

**Example Usage**:
```typescript
import { initDatabase } from '@storage/database';
import { AnalysisQueueRepository } from '@storage/AnalysisQueueRepository';

const db = initDatabase();
const queueRepo = new AnalysisQueueRepository(db);

// Add articles to queue
const articles = [
  { id: 'abc-123', url: 'https://example.com/1', title: 'Article 1' },
  { id: 'def-456', url: 'https://example.com/2', title: 'Article 2' }
];
const inserted = queueRepo.initializeQueue(articles);
console.log(`Added ${inserted} articles`);

// Get pending jobs
const jobs = queueRepo.getPending(5);
console.log(`Processing ${jobs.length} jobs`);

// Mark as in_progress
for (const job of jobs) {
  queueRepo.markInProgress(job.articleId);
}

// After successful analysis → mark completed
queueRepo.markCompleted('abc-123');

// If analysis fails → mark failed
queueRepo.markFailed('def-456', 'Agent timeout');

// Check statistics
const stats = queueRepo.getStats();
console.log(`Pending: ${stats.pending}, Completed: ${stats.completed}`);

// Get failed jobs for retry
const failed = queueRepo.getFailed();
for (const job of failed) {
  if (job.retryCount < 3) {
    queueRepo.resetToPending(job.articleId);
  }
}

db.close();
```

### AnalysisWriter

**Location**: `src/storage/AnalysisWriter.ts`

**Purpose**: Write `ContentAnalysis` results to Markdown files with YAML front-matter.

**Import**:
```typescript
import { AnalysisWriter } from '@storage/AnalysisWriter';
```

**Configuration**:
```typescript
const writer = new AnalysisWriter({
  outputDir: 'content/analysis'
});
```

**Methods**:

1. **`write(articleId, articleUrl, articleTitle, savedAt, analysis): Promise<string>`** - Write analysis to Markdown
   ```typescript
	   const filePath = await writer.write(
     articleId,        // Omnivore article ID
     articleUrl,       // Source article URL
     articleTitle,     // Source article title
     savedAt,          // When saved to Omnivore (ISO 8601)
     analysis,         // ContentAnalysis from agent
     articleSlug       // Optional Omnivore slug (preferred for filename stability)
   );
	   // Returns: 'content/analysis/2025-09-30-omnivore-slug-analysis.md'
	   ```
   - Creates Markdown file with YAML front-matter
   - File naming: `YYYY-MM-DD-{slug}-analysis.md`
   - Date from `savedAt` timestamp
   - Slug from `articleSlug` when provided; otherwise derived from article title (lowercase, alphanumeric, max 50 chars)
   - AIDEV: `analysis-output-boundary`, `git-tracked-output`

	2. **`appendToJsonl(jsonlPath, data): Promise<void>`** - Append to JSONL file
   ```typescript
   await writer.appendToJsonl('content/analysis/analyses.jsonl', {
     articleId,
     articleUrl,
     articleTitle,
     savedAt,
     analyzedAt: analysis.analyzedAt,
     topics: analysis.topics,
     topicScores: analysis.topicScores,
     summary: analysis.summary,
     keyPoints: analysis.keyPoints,
     sentiment: analysis.sentiment,
     monetizationAngle: analysis.monetizationAngle
   });
	   ```
	   - Called when JSONL output is enabled (`omc analyze complete --jsonl` / `omc analyze auto --jsonl`)
	   - Appends one JSON line to JSONL file
   - Creates file if it doesn't exist
   - Machine-readable format for batch processing
   - AIDEV: `git-tracked-output`

**Private Methods**:
- `generateSlug(title: string): string` - Create URL-friendly slug
- `formatMarkdown(...)` - Build YAML front-matter and markdown body

**Example Usage**:
```typescript
import { AnalysisWriter } from '@storage/AnalysisWriter';

const writer = new AnalysisWriter({ outputDir: 'content/analysis' });

const analysis = {
  articleId: 'abc-123',
  topics: ['ai', 'developer-tools'],
  topicScores: { ai: 0.95, 'developer-tools': 0.88 },
  summary: 'Article explores...',
  keyPoints: ['First insight', 'Second insight'],
  sentiment: 'positive',
  monetizationAngle: 'Tutorial series on...',
  analyzedAt: new Date().toISOString()
};

const filePath = await writer.write(
  'abc-123',
  'https://example.com/article',
  'Example Article Title',
  '2025-09-30T10:00:00Z',
  analysis
);

console.log(`Saved to: ${filePath}`);
// Saved to: content/analysis/2025-09-30-example-article-title-analysis.md
```

### ContentReader

**Location**: `src/storage/ContentReader.ts`

**Purpose**: Read and parse Markdown files with YAML front-matter.

**Import**:
```typescript
import { ContentReader } from '@storage/ContentReader';
```

**Configuration**:
```typescript
const reader = new ContentReader({
  directory: 'content/analysis'
});
```

**Methods**:

1. **`list(pattern?: string): Promise<string[]>`** - List all Markdown files
   - Returns array of absolute file paths
   - Sorted by date (newest first, assumes `YYYY-MM-DD` prefix)
   - Returns empty array if directory doesn't exist

2. **`read(filePath: string): Promise<StoredAnalysis>`** - Read and parse file
   - Uses `gray-matter` to parse YAML front-matter
   - Extracts markdown sections (Summary, Key Points, Monetization Angle)
   - Returns `StoredAnalysis` with parsed front-matter and content

3. **`findByArticleId(articleId: string): Promise<StoredAnalysis | null>`** - Find by article ID
   - Searches all files for matching `articleId` in front-matter
   - Returns first match or `null`

4. **`searchByTopic(topic: string): Promise<StoredAnalysis[]>`** - Search by topic
   - Returns all analyses containing the topic
   - Topic must match exactly (case-sensitive)

**Example Usage**:
```typescript
import { ContentReader } from '@storage/ContentReader';

const reader = new ContentReader({ directory: 'content/analysis' });

// List all analyses
const files = await reader.list();
console.log(`Found ${files.length} analyses`);

// Read specific analysis
const analysis = await reader.read(files[0]);
console.log(analysis.frontMatter.articleTitle);
console.log(analysis.summary);
console.log(analysis.keyPoints);

// Find by article ID
const found = await reader.findByArticleId('abc-123');
if (found) {
  console.log(`Topics: ${found.frontMatter.topics.join(', ')}`);
}

// Search by topic
const aiArticles = await reader.searchByTopic('ai');
console.log(`${aiArticles.length} articles about AI`);
```

**Private Method**:
- `parseMarkdownSections(content: string)` - Extract sections from markdown body using regex

## Workflow Examples

### Complete Parallel Analysis Workflow

```bash
# 1. Fetch articles from Omnivore → tracking queue
omc queue add --hours 168

# 2. Prepare batch (writes temp/*.jsonl stubs + marks jobs in_progress)
omc analyze run --batch-size 5

# 3. User invokes 5 agents in parallel (single message)
# Each agent:
#   - Reads stub file
#   - Calls: omc omnivore get {slug} --json  (extract `.content`)
#   - Analyzes content
#   - Enriches stub file with analysis field
#   - Writes back to temp file

# 4. Persist results (writes content/analysis/*.md, updates DB, cleans temp files)
omc analyze complete

# 5. Check status / stats
omc analyze status
omc queue stats --detailed

# 6. Retry failed jobs
omc analyze retry --failed

# 7. Continue analysis
omc analyze run --batch-size 5

# 8. Generate report
omc report corpus
```

### Programmatic Queue Management

```typescript
import { initDatabase } from '@storage/database';
import { AnalysisQueueRepository } from '@storage/AnalysisQueueRepository';
import { AnalysisWriter } from '@storage/AnalysisWriter';
import type { ContentAnalysis } from '@omc-types/analysis.js';

// Initialize database and repository
const db = initDatabase('data/omnivore-content.db');
const queueRepo = new AnalysisQueueRepository(db);
const writer = new AnalysisWriter({ outputDir: 'content/analysis' });

// Add articles to queue
const articles = [
  { id: 'abc-123', url: 'https://example.com/1', title: 'Article 1' },
  { id: 'def-456', url: 'https://example.com/2', title: 'Article 2' }
];
const inserted = queueRepo.initializeQueue(articles);
console.log(`Added ${inserted} articles to queue`);

// Get pending jobs
const jobs = queueRepo.getPending(5);

// Mark as in_progress
for (const job of jobs) {
  queueRepo.markInProgress(job.articleId);
}

// After agent analysis completes...
const analysis: ContentAnalysis = {
  articleId: 'abc-123',
  topics: ['ai', 'developer-tools'],
  topicScores: { ai: 0.95, 'developer-tools': 0.88 },
  summary: 'Article explores...',
  keyPoints: ['First insight', 'Second insight'],
  sentiment: 'positive',
  monetizationAngle: 'Tutorial series on...',
  analyzedAt: new Date().toISOString()
};

// Save to Markdown (PERMANENT)
const mdPath = await writer.write(
  'abc-123',
  'https://example.com/1',
  'Article 1',
  '2025-09-30T10:00:00Z',
  analysis
);

// Append to JSONL (PERMANENT)
await writer.appendToJsonl('content/analysis/analyses.jsonl', {
  articleId: 'abc-123',
  articleUrl: 'https://example.com/1',
  articleTitle: 'Article 1',
  savedAt: '2025-09-30T10:00:00Z',
  analyzedAt: analysis.analyzedAt,
  topics: analysis.topics,
  topicScores: analysis.topicScores,
  summary: analysis.summary,
  keyPoints: analysis.keyPoints,
  sentiment: analysis.sentiment,
  monetizationAngle: analysis.monetizationAngle
});

// Update tracking status (EPHEMERAL)
queueRepo.markCompleted('abc-123');

// Check statistics
const stats = queueRepo.getStats();
console.log(`Pending: ${stats.pending}, Completed: ${stats.completed}`);

db.close();
```

### Reading Analysis Results

```typescript
import { ContentReader } from '@storage/ContentReader';

const reader = new ContentReader({ directory: 'content/analysis' });

// List all analyses (newest first)
const files = await reader.list();
console.log(`Total analyses: ${files.length}`);

// Read latest analysis
const latest = await reader.read(files[0]);
console.log(`Title: ${latest.frontMatter.articleTitle}`);
console.log(`Topics: ${latest.frontMatter.topics.join(', ')}`);
console.log(`Summary: ${latest.summary}`);
console.log(`Key Points:\n${latest.keyPoints.map(p => `- ${p}`).join('\n')}`);

// Find specific article's analysis
const found = await reader.findByArticleId('abc-123');
if (found) {
  console.log(`Sentiment: ${found.frontMatter.sentiment}`);
}

// Search by topic
const aiArticles = await reader.searchByTopic('ai');
console.log(`AI articles: ${aiArticles.length}`);
```

## Related Documentation

- [Architecture](architecture.md) - System design and storage boundaries
- [Workflow Internals](workflow-internals.md) - How the parallel analysis workflow operates
- [Foundation & Type System](foundation-and-types.md) - TypeScript setup, type definitions
