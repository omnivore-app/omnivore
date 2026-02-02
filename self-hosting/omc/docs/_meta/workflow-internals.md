# Workflow Internals

**Purpose**: Deep dive into how the parallel analysis workflow operates, including zero-context-pollution design, agent invocation patterns, and file handling.

**Last Updated**: 2026-01-30

**Status**: This document originally described the legacy `cli/parallel-analyze.ts` + `cli/save-analysis-results.ts` flow. The current workflow is implemented via `omc analyze run` and `omc analyze complete`. See `docs/_meta/current-state.md` for the full audit and issue list.

## Overview

The parallel analysis workflow uses a **zero-context-pollution** design where each agent operates independently with fresh database connections and no shared state from the orchestration script. This enables true parallel execution and prevents race conditions.

## Zero-Context-Pollution Design

### Design Principles

1. **Stub files as communication**: Main context creates minimal stub files containing only article metadata
2. **Fresh connections**: the orchestrator command closes its DB work before agents run; agents should operate independently
3. **Independent content fetching**: agents fetch article content via `omc omnivore get <slug> --json` and extract `.content`
4. **File-based results**: Agents enrich stub files with analysis field, no inter-agent communication
5. **Slug-based naming**: Temp files named by article slug prevents overwrites across batches

### Why This Matters

- **Prevents race conditions**: Each agent reads/writes different files
- **Enables true parallelism**: No database locks during agent execution
- **Supports batch overlap**: Can run multiple batches before saving results
- **Isolates failures**: Failed agent doesn't corrupt others' work
- **Scales horizontally**: Can distribute agents across machines

## Parallel Analysis Workflow

### Automated Mode (`omc analyze auto`)

The automated workflow is the non-interactive, schedulable path:

1. Populate queue: `omc queue add --hours 24`
2. Analyze end-to-end: `omc analyze auto --batch-size 5`

Implementation notes:
- The analysis step shells out to `codex exec` in `read-only` sandbox mode and expects a single JSON object response.
- `CODEX_HOME` is set to `temp/codex-home` during execution to avoid reliance on `~/.codex` permissions in automation environments.

### Step 1: Orchestration (`omc analyze run`)

The orchestration script sets up the batch and prepares for agent invocation:

```typescript
// 1. Fetch pending jobs and mark in_progress
const jobs = queueRepo.getPending(5);
jobs.forEach(job => queueRepo.markInProgress(job.articleId));

// 2. Fetch article metadata from Omnivore API
const result = await getArticle(job.articleSlug, username);
const article = result.article;

// 3. Create stub file with slug-based name
const stubFile = `temp/${job.articleSlug}.jsonl`;
fs.writeFileSync(stubFile, JSON.stringify({
  articleId: job.articleId,
  articleSlug: job.articleSlug,
  username: username,
  articleUrl: article.url,
  articleTitle: article.title,
  savedAt: article.savedAt,
  publishedAt: article.publishedAt,
  updatedAt: article.updatedAt
}));

// 4. Output agent parameters
console.log(JSON.stringify([{
  filename: stubFile,
  articleId: article.id,
  articleSlug: article.slug,
  username: username,
  articleTitle: article.title
}]));

// 5. Close database (agents get fresh connections)
db.close();
```

**Key Points**:
- Database is closed before agents execute
- Stub files contain metadata only (no content)
- Each stub file is named by article slug
- Agent parameters output as JSON array

### Step 2: Agent Execution (@article-content-analyzer)

Each agent operates independently with its own workflow:

```typescript
// Each agent receives: filename, articleId, articleSlug, username, articleTitle

// 1. Read stub file to get metadata
const stub = JSON.parse(fs.readFileSync(filename, 'utf-8'));

// 2. Fetch content via CLI tool (no TypeScript imports)
const contentResult = await bash(`omc omnivore get ${stub.articleSlug} --json`);
const article = JSON.parse(contentResult.stdout);
const articleContent = article.content;

// 3. Analyze content using agent's prompt
const analysis = {
  topics: [...],
  topicScores: {...},
  summary: "...",
  keyPoints: [...],
  sentiment: "positive",
  monetizationAngle: "...",
  analyzedAt: new Date().toISOString()
};

// 4. Re-read stub file (fresh copy, no race conditions)
const enriched = JSON.parse(fs.readFileSync(filename, 'utf-8'));

// 5. Add analysis field ONLY (preserve all original fields)
enriched.analysis = analysis;

// 6. Write enriched data back to same file
fs.writeFileSync(filename, JSON.stringify(enriched, null, 2));
```

**Key Points**:
- Agent fetches content via CLI (no direct TypeScript imports)
- Re-reads stub before writing (ensures fresh data)
- Adds `analysis` field only (preserves metadata)
- Each agent writes to unique file (slug-based naming)

### Step 3: Save Results (`omc analyze complete`)

The save script processes all enriched files and updates tracking:

```typescript
// For each enriched temp file:
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));

  // 1) Write to Markdown (git-tracked, human-editable)
  const markdownPath = await writer.write(
    data.articleId,
    data.articleUrl,
    data.articleTitle,
    data.savedAt,
    data.analysis
  );

  // 2) Store immutable snapshot + mark completed in SQLite
  queueRepo.storeAnalysis(
    data.articleId,
    data.publishedAt ?? null,
    data.updatedAt ?? null,
    JSON.stringify(data.analysis),
    markdownPath
  );

  // 3) Delete temp file (cleanup)
  fs.unlinkSync(file);
}
```

**Key Points**:
- Processes all temp files in one pass
- Updates database after successful write
- Automatically deletes temp files (cleanup)
- Preserves temp files on error for debugging

**Note**:
- JSONL output is optional: enable with `omc analyze complete --jsonl` or `omc analyze auto --jsonl`.

## File Lifecycle

### Stub File Creation (`omc analyze run`)

**File**: `temp/{articleSlug}.jsonl`

**Content**: Article metadata only (no content, no analysis)

**Purpose**: Minimal communication between orchestrator and agents

**Example**:
```json
{
  "articleId": "abc-123",
  "articleSlug": "understanding-llm-fine-tuning",
  "username": "myusername",
  "articleUrl": "https://example.com/article",
  "articleTitle": "Understanding LLM Fine-Tuning",
  "savedAt": "2025-09-30T10:00:00Z",
  "publishedAt": "2025-09-29T14:00:00Z",
  "updatedAt": "2025-09-30T08:00:00Z"
}
```

### Enrichment (agent)

**Process**:
1. Reads stub file
2. Fetches content via CLI tool
3. Adds `analysis` field to JSON
4. Writes back to same file

**Enriched Format**:
```json
{
  "articleId": "abc-123",
  "articleSlug": "understanding-llm-fine-tuning",
  "username": "myusername",
  "articleUrl": "https://example.com/article",
  "articleTitle": "Understanding LLM Fine-Tuning",
  "savedAt": "2025-09-30T10:00:00Z",
  "publishedAt": "2025-09-29T14:00:00Z",
  "updatedAt": "2025-09-30T08:00:00Z",
  "analysis": {
    "topics": ["ai", "machine-learning"],
    "topicScores": { "ai": 0.95, "machine-learning": 0.88 },
    "summary": "Article summary...",
    "keyPoints": ["point1", "point2"],
    "sentiment": "positive",
    "monetizationAngle": "Content opportunity...",
    "analyzedAt": "2025-10-01T04:30:00Z"
  }
}
```

### Storage & Cleanup (`omc analyze complete`)

**Process**:
1. Reads enriched file
2. Writes Markdown to `content/analysis/YYYY-MM-DD-{slug}-analysis.md` (slug derived from `articleSlug` when available, otherwise title)
3. Stores immutable snapshot to SQLite (`analysis_json`, `markdown_path`) and marks job `completed`
4. **Deletes temp file** with `unlinkSync(file)`

**Output Files**:
- `content/analysis/2025-09-30-understanding-llm-fine-tuning-analysis.md`

**Temp File**: Deleted after successful save

## Error Handling

### Parse Error

**Scenario**: Enriched file contains invalid JSON

**Handling**:
- Mark job as `failed` in tracking queue
- Preserve temp file for debugging
- Store error message in database
- Increment retry count

**Example**:
```
✗ Failed: Understanding LLM Fine-Tuning... - Parse error
  → Preserved: temp/understanding-llm-fine-tuning.jsonl
```

### Agent Timeout

**Scenario**: Agent doesn't complete within time limit

**Handling**:
- Status remains `in_progress` in database
- Temp file preserved (partially enriched)
- Manual retry needed via `omc analyze retry`

### Save Failure

**Scenario**: Error writing to Markdown or JSONL

**Handling**:
- Mark job as `failed`
- Preserve temp file
- Log error details
- Can retry after fixing issue

## Parallel Invocation Pattern

### Single Message, Multiple Agents

The workflow requires invoking all agents in a single message for true parallelism:

```
User message:
Analyze these 5 articles in parallel:

@article-content-analyzer {
  filename: "temp/article-1.jsonl",
  articleId: "abc-123",
  articleSlug: "article-1",
  username: "myusername",
  articleTitle: "Article 1 Title"
}

@article-content-analyzer {
  filename: "temp/article-2.jsonl",
  articleId: "def-456",
  articleSlug: "article-2",
  username: "myusername",
  articleTitle: "Article 2 Title"
}

... (3 more agents)
```

### Why Single Message

- **All agents execute in parallel** (no sequential bottleneck)
- **User waits for all results** before saving
- **Failure of one agent** doesn't block others
- **Claude Code orchestrates** parallel execution

### Agent Independence

Each agent:
- Gets unique parameters (filename, articleId, slug, username, title)
- Reads different stub file
- Fetches content independently via CLI
- Writes to different temp file
- No coordination with other agents

## Slug-Based Naming Benefits

### Problem with Sequential IDs

Using sequential names like `temp/result-1.jsonl`, `temp/result-2.jsonl`:
- Running batch 2 overwrites batch 1's files
- Must save batch 1 before running batch 2
- Forces sequential processing

### Solution with Slug-Based Names

Using article slug like `temp/{articleSlug}.jsonl`:
- Each article has unique filename based on slug
- Multiple batches can run simultaneously
- Agents can complete out-of-order
- Save script processes all `temp/*.jsonl` files at once

### Example Workflow

```bash
# Batch 1 creates:
temp/understanding-llm-fine-tuning.jsonl
temp/kubernetes-best-practices.jsonl
temp/rust-performance-tips.jsonl

# Batch 2 creates (while batch 1 agents still running):
temp/python-async-patterns.jsonl
temp/distributed-systems-design.jsonl

# Save all at once:
omc analyze complete
# Processes all 5 files, deletes after successful save
```

## Agent Content Analyzer

### Agent Name

`@article-content-analyzer`

**Location**: `.claude/agents/article-content-analyzer.md`

**Model**: Sonnet

### Core Responsibilities

1. **Topic Extraction & Scoring** - Identify 2-5 topics with confidence scores (0-1)
2. **Strategic Summarization** - 2-3 sentence "so what?" summary
3. **Key Point Extraction** - 3-5 actionable insights or surprising facts
4. **Sentiment Analysis** - Classify as positive/neutral/negative
5. **Monetization Strategy** - Identify specific content opportunities

### Topic Categories

Aligned with content strategy:
- `developer-tools`, `ai-tooling`, `ai`, `machine-learning`, `llm`
- `software-engineering`, `architecture`, `code-quality`
- `devops`, `kubernetes`, `docker`, `cloud-native`
- `databases`, `sql`, `nosql`
- `cloud`, `aws`, `azure`, `serverless`
- `startups`, `product`, `growth`, `monetization`
- `security`, `auth`, `encryption`

### Topic Scores

- **0.90-1.0**: Core focus of article
- **0.70-0.89**: Significant discussion
- **0.50-0.69**: Mentioned but not central
- **Below 0.50**: Excluded

### Output Schema

```json
{
  "topics": ["topic1", "topic2", "topic3"],
  "topicScores": {
    "topic1": 0.95,
    "topic2": 0.88,
    "topic3": 0.75
  },
  "summary": "2-3 sentence summary capturing main points and why this matters",
  "keyPoints": [
    "First key takeaway or insight",
    "Second key takeaway or insight",
    "Third key takeaway or insight"
  ],
  "sentiment": "positive|neutral|negative",
  "monetizationAngle": "Specific content opportunity description"
}
```

### Critical Rules

- Returns ONLY JSON object (no markdown code blocks, no explanatory text)
- All topic labels from approved category list
- Topic scores between 0-1, at least one ≥ 0.70
- Summary is 2-3 sentences focusing on implications
- 3-5 specific, actionable key points
- Monetization angle suggests concrete content opportunity
- User highlights receive extra weight if provided

### Usage in Workflow

The agent is invoked with parameters from the orchestration script:

```
@article-content-analyzer {
  filename: "temp/understanding-llm-fine-tuning.jsonl",
  articleId: "abc-123",
  articleSlug: "understanding-llm-fine-tuning",
  username: "myusername",
  articleTitle: "Understanding LLM Fine-Tuning Techniques"
}
```

Agent then:
1. Reads stub file for metadata
2. Calls `omc omnivore get understanding-llm-fine-tuning --json` for content (extract `.content`)
3. Analyzes content using its prompt template
4. Enriches stub file with analysis
5. Writes back to temp file

## Analysis Prompt Template

**Location**: `src/analysis/prompts/analyze.md`

**Purpose**: Structured prompt template for article analysis (used by agent).

### Template Variables

- `{{title}}` - Article title
- `{{author}}` - Article author
- `{{url}}` - Article URL
- `{{wordCount}}` - Word count
- `{{publishedAt}}` - Publication date
- `{{content}}` - Article content (HTML or text)
- `{{#if highlights}}...{{/if}}` - Conditional highlights section
- `{{#each highlights}}...{{/each}}` - Iterate over highlights

### Highlights Format

If user highlights are present:

```
{{#each highlights}}
- "{{quote}}"{{#if annotation}} — Note: {{annotation}}{{/if}}
{{/each}}
```

### Output Format

JSON matching `ContentAnalysis` schema (no markdown code blocks).

### Example Rendered Prompt

```markdown
# Article Content Analysis Prompt

You are analyzing an article for content monetization opportunities...

## Article Details

**Title**: Understanding LLM Fine-Tuning
**Author**: Jane Smith
**URL**: https://example.com/llm-finetuning
**Word Count**: 3200
**Published**: 2025-09-25T10:00:00Z

**Content**:
[Full article content here...]

**User Highlights**:
- "LoRA reduces trainable parameters by 90%" — Note: Key metric for cost savings
- "Prompt engineering vs fine-tuning trade-offs"

## Analysis Task

Extract the following information and return as JSON:
[JSON schema and guidelines...]
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ORCHESTRATION (omc analyze run)                          │
│                                                              │
│   Queue DB → Get 5 pending → Mark in_progress               │
│            → Fetch metadata from Omnivore API               │
│            → Create stub files (temp/{slug}.jsonl)          │
│            → Output agent parameters as JSON                │
│            → Close DB connection                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PARALLEL AGENT EXECUTION (@article-content-analyzer × 5) │
│                                                              │
│   Each agent independently:                                 │
│   - Read stub file for metadata                             │
│   - Call `omc omnivore get {slug} --json` for content      │
│   - Analyze content using prompt template                   │
│   - Enrich stub file with analysis field                    │
│   - Write back to temp/{slug}.jsonl                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. SAVE RESULTS (omc analyze complete)                      │
│                                                              │
│   Read all temp/*.jsonl files                               │
│   For each:                                                 │
│   - Write to content/analysis/YYYY-MM-DD-{slug}-analysis.md │
│   - Store snapshot in DB + mark completed                   │
│   - Delete temp file                                        │
└─────────────────────────────────────────────────────────────┘
```

## Complete Example

### Real Analysis Output

**File**: `content/analysis/2025-09-30-cchistory-tracking-claude-code-system-prompt-and-t-analysis.md`

```markdown
---
articleId: 1039961b-8de3-4ccf-b3e8-df888d6174b8
articleUrl: https://mariozechner.at/posts/2025-08-03-cchistory/
articleTitle: "cchistory: Tracking Claude Code System Prompt and Tool Changes"
savedAt: 2025-09-30T02:27:46.000Z
analyzedAt: 2025-10-01T04:25:16.676Z
topics: [developer-tools, ai-tooling, reverse-engineering, software-debugging]
topicScores:
  developer-tools: 0.95
  ai-tooling: 0.9
  reverse-engineering: 0.85
  software-debugging: 0.75
sentiment: positive
---

## Summary

Developer creates tools to reverse-engineer and track changes in Claude Code's system prompts and tool definitions over time. The cchistory project monitors Claude Code updates by intercepting and archiving system messages, revealing how Anthropic evolves the assistant's behavior and capabilities.

## Key Points

- Created claude-trace to intercept and log Claude Code's internal API communications
- Built cchistory to automatically track and diff system prompt changes across versions
- Discovered Claude Code switched from Sonnet to Haiku for certain operations to reduce costs
- System prompts reveal detailed behavioral instructions and tool usage patterns
- Tracking changes helps understand how AI coding assistants evolve over time

## Monetization Angle

Tutorial series on 'Reverse Engineering AI Tools' - developers want to understand how Claude Code works under the hood. Could create content comparing system prompt evolution, analyzing cost optimization strategies, or teaching prompt engineering through real examples from production AI systems.
```

### Example JSONL Record (Optional Output)

**File**: `content/analysis/analyses.jsonl` (written when `--jsonl` is enabled)

```json
{"articleId":"1039961b-8de3-4ccf-b3e8-df888d6174b8","articleUrl":"https://mariozechner.at/posts/2025-08-03-cchistory/","articleTitle":"cchistory: Tracking Claude Code System Prompt and Tool Changes","savedAt":"2025-09-30T02:27:46.000Z","analyzedAt":"2025-10-01T04:25:16.676Z","topics":["developer-tools","ai-tooling","reverse-engineering","software-debugging"],"topicScores":{"developer-tools":0.95,"ai-tooling":0.9,"reverse-engineering":0.85,"software-debugging":0.75},"sentiment":"positive","summary":"Developer creates tools to reverse-engineer and track changes in Claude Code's system prompts and tool definitions over time. The cchistory project monitors Claude Code updates by intercepting and archiving system messages, revealing how Anthropic evolves the assistant's behavior and capabilities.","keyPoints":["Created claude-trace to intercept and log Claude Code's internal API communications","Built cchistory to automatically track and diff system prompt changes across versions","Discovered Claude Code switched from Sonnet to Haiku for certain operations to reduce costs","System prompts reveal detailed behavioral instructions and tool usage patterns","Tracking changes helps understand how AI coding assistants evolve over time"],"monetizationAngle":"Tutorial series on 'Reverse Engineering AI Tools' - developers want to understand how Claude Code works under the hood. Could create content comparing system prompt evolution, analyzing cost optimization strategies, or teaching prompt engineering through real examples from production AI systems."}
```

## What Does NOT Exist Yet

**Implemented**:
- ✅ SQLite tracking database for parallel execution
- ✅ Job queue with status tracking (pending/in_progress/completed/failed)
- ✅ Parallel analysis workflow (batch of 5)
- ✅ Error handling with retry logic (max 3 attempts)
- ✅ CLI tools for queue management
- ✅ JSONL output format
- ✅ Boundary enforcement with AIDEV annotations
- ✅ Zero-context-pollution design
- ✅ Slug-based file naming

**Future Enhancements**:
- **Automated agent invocation** - Currently requires manual copy/paste of prompts; could integrate Claude Agent SDK for direct invocation
- **Real-time progress tracking** - Add progress bars during fetch/analysis operations
- **Session management** - `analysis_sessions` table exists but not yet used for batch tracking
- **Queue cleanup automation** - Manual `clearCompleted()` call; could auto-cleanup after export
- **Distributed execution** - Agents across multiple machines
- **Advanced error recovery** - Automatic retry with backoff
- **Batch prioritization** - Priority queue for time-sensitive articles
- **Content pre-filtering** - Skip articles unlikely to be valuable
- **Incremental updates** - Re-analyze articles when content changes

## Related Documentation

- [Architecture](architecture.md) - System design and storage boundaries
- [CLI Reference](cli-reference.md) - Command-line interface documentation
- [Foundation & Type System](foundation-and-types.md) - TypeScript setup, type definitions
