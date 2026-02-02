# Foundation and Type System

**Groundtruth Documentation** - What exists and how to use it.

## TypeScript Foundation

### Project Setup

**TypeScript Configuration** (`tsconfig.json`):
```typescript
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "declaration": true,
    "sourceMap": true,
    "paths": {
      "@lib/*": ["./lib/*"],
      "@storage/*": ["./src/storage/*"],
      "@analysis/*": ["./src/analysis/*"],
      "@generation/*": ["./src/generation/*"],
      "@utils/*": ["./src/utils/*"],
      "@omc-types/*": ["./src/types/*"]
    }
  },
  "include": ["src/**/*", "lib/**/*"],
  "exclude": ["node_modules", "dist", "test-scripts", "legacy-scripts"]
}
```

**Build System**:
- Package manager: pnpm
- Build command: `pnpm run build` → compiles to `dist/`
- Type check: `pnpm run typecheck` → validates without emitting
- Dev mode: `pnpm run dev` → watch mode with tsx

### Dependencies

**Runtime** (package.json dependencies):
- `node-fetch` (^3.3.2) - HTTP requests for GraphQL API
- `dotenv` (^16.4.0) - Environment variable loading
- `@anthropic-ai/sdk` (^0.20.0) - Claude API for analysis
- `@anthropic-ai/claude-agent-sdk` (^0.1.1) - Agent framework
- `gray-matter` (^4.0.3) - YAML front-matter parsing
- `markdown-it` (^14.0.0) - Markdown processing
- `chalk` (^5.3.0) - Terminal colors
- `csv-parse` (^6.1.0) - CSV parsing
- `p-limit` (^5.0.0) - Concurrency control
- `better-sqlite3` (^12.4.1) - SQLite (for legacy scripts)

**Development** (package.json devDependencies):
- `typescript` (^5.4.0) - TypeScript compiler
- `@types/node` (^20.0.0) - Node.js type definitions
- `tsx` (^4.0.0) - TypeScript execution
- `vitest` (^1.0.0) - Testing framework
- `nodemon` (^3.0.0) - File watcher

## GraphQL Organization

**Current**:
- Runtime GraphQL client: `lib/omnivore/client.js` (string-based queries)
- TypeScript import surface: `src/lib/omnivore/client.ts`
- In TypeScript code, prefer importing client functions from `@lib/omnivore/client.js`

**Note**:
An older typed GraphQL layer (`src/graphql/**` + `src/types/generated/**`) was removed because it was not integrated into the CLI runtime and created drift risk. See `docs/_meta/graphql-organization.md`.

### Query Builders (`lib/omnivore/queries.js`)

**Purpose**: Helper functions for composing Omnivore query strings.

**NOTE**: Query builders remain in JavaScript (`lib/omnivore/queries.js`) for compatibility with existing client code. They generate query string parameters, not GraphQL query documents.

**Builder Functions**:

1. **`buildComplexQuery({ keywords, labels, timeRange, status, hasHighlights, sortBy })`**
   - Compose multiple filters into single query string
   - Parameters:
     - `keywords`: Array of search terms (OR logic)
     - `labels`: Array of label names (OR logic)
     - `timeRange`: 'last24hrs' | 'last7days' | 'last30days' | date expression
     - `status`: 'inbox' | 'archived' | 'unread' | 'read'
     - `hasHighlights`: boolean (true = has:highlights, false = no:highlights)
     - `sortBy`: Sort order (default: 'saved-desc')
   - Returns: Omnivore query string
   - Example:
     ```javascript
     buildComplexQuery({
       keywords: ['ai', 'machine learning'],
       labels: ['technology'],
       timeRange: 'last7days',
       hasHighlights: true
     })
     // → 'saved:last7days ("ai" OR "machine learning") label:technology has:highlights sort:saved-desc'
     ```

2. **`buildTopicQuery(topicKey, timeRange)`**
   - Generate query for predefined topic
   - Topic keys: 'ai', 'devops', 'programming', 'databases', 'web', 'cloud', 'startup', 'security'
   - Each topic has predefined keywords (see TOPIC_QUERIES)
   - Example:
     ```javascript
     buildTopicQuery('ai', 'last7days')
     // → 'saved:last7days ("ai" OR "artificial intelligence" OR "machine learning" OR ...) sort:saved-desc'
     ```

3. **`buildDateRangeQuery(startDate, endDate, sortBy)`**
   - Create date range filter
   - Accepts Date objects or YYYY-MM-DD strings
   - Example:
     ```javascript
     buildDateRangeQuery('2025-09-01', '2025-09-30')
     // → 'saved:>2025-09-01 saved:<2025-09-30 sort:saved-desc'
     ```

4. **`buildLabelQuery(labels, operator)`**
   - Create label filter with AND/OR logic
   - Example:
     ```javascript
     buildLabelQuery(['ai', 'ml'], 'OR')
     // → 'label:ai OR label:ml'
     ```

5. **`buildKeywordQuery(keywords, operator)`**
   - Create keyword search with AND/OR logic
   - Automatically quotes multi-word terms
   - Example:
     ```javascript
     buildKeywordQuery(['ai', 'machine learning'], 'OR')
     // → '("ai" OR "machine learning")'
     ```

**Predefined Patterns** (`QUERY_PATTERNS`):
```javascript
QUERY_PATTERNS.LAST_7_DAYS      // 'saved:last7days sort:saved-desc'
QUERY_PATTERNS.INBOX            // 'in:inbox sort:saved-desc'
QUERY_PATTERNS.WITH_HIGHLIGHTS  // 'has:highlights sort:saved-desc'
QUERY_PATTERNS.AI_ML            // '(ai OR "machine learning" OR llm ...) sort:saved-desc'
QUERY_PATTERNS.RECENT_AI        // 'saved:last7days (ai OR llm OR ...) sort:saved-desc'
// ... more patterns (see lib/omnivore/queries.js:189-221)
```

**Topic Definitions** (`TOPIC_QUERIES`):
```javascript
TOPIC_QUERIES.ai         // keywords: ['ai', 'artificial intelligence', ...]
TOPIC_QUERIES.devops     // keywords: ['devops', 'kubernetes', ...]
TOPIC_QUERIES.programming // keywords: ['programming', 'coding', ...]
// ... more topics (see lib/omnivore/queries.js:305-338)
```

**Integration Example**:
```javascript
import { searchArticles } from '@lib/omnivore/client.js';
import { buildComplexQuery, TOPIC_QUERIES } from '../lib/omnivore/queries.js';

// Build query string
const queryString = buildComplexQuery({
  keywords: TOPIC_QUERIES.ai.keywords.slice(0, 5),
  labels: ['technology', 'research'],
  timeRange: 'last7days',
  hasHighlights: true
});

const result = await searchArticles({ query: queryString, first: 20, includeContent: true });
```

## Omnivore Client Library

### Location

```
lib/omnivore/
├── client.js      # GraphQL client using node-fetch
└── queries.js     # Query builders and patterns (documented above)
```

### Client Module (`lib/omnivore/client.js`)

**Implementation**: Uses `node-fetch` to make GraphQL requests. NOT using Apollo Client.

**Core Function**: `graphqlRequest(query, variables)`
```javascript
async function graphqlRequest(query, variables = {}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': API_KEY,  // From process.env.OMNIVORE_API_KEY
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();
  return result.data;
}
```

**Exported Functions**:

1. **`getMe()`** - Get authenticated user
   - Returns: `{ id, name, email, profile: { username } }`
   - Use: Verify API connection

2. **`searchArticles({ query, first, after, includeContent })`** - Search articles
   - Parameters:
     - `query`: Omnivore query syntax (default: 'in:all')
     - `first`: Number of results (default: 10)
     - `after`: Pagination cursor (default: '')
     - `includeContent`: Include full HTML content (default: false)
   - Returns: `{ search: { pageInfo, edges: [{ node, cursor }] } }`

3. **`getArticle({ slug, username })`** - Get single article with content
   - Returns: Full article with content, highlights, labels

4. **`getArticlesByDate({ startDate, endDate, first })`** - Time-range queries
   - Date format: YYYY-MM-DD

5. **`getArticlesByLabel({ label, first })`** - Filter by label name

6. **`getRecentArticles({ period, first })`** - Recent articles
   - Periods: 'last24hours', 'last7days', 'last30days'

7. **`searchByTopic({ topic, period, first })`** - Topic + time filter
   - Topics: 'ai', 'devops', 'programming', etc.

8. **`getUnreadArticles({ first })`** - Inbox/unread items

9. **`getLabels()`** - All available labels
   - Returns: Array of `{ id, name, color, description }`

10. **`getHighlights({ articleId })`** - Article highlights
    - Returns: Array of `{ id, quote, annotation, createdAt }`

11. **`testConnection()`** - Verify API connectivity
    - Calls `getMe()` and logs result
    - Returns: boolean

**Import Pattern**:
```javascript
import { searchArticles, getArticle } from './lib/omnivore/client.js';
```

**NOTE**: Query builders and patterns are documented above in "Query Builders (`lib/omnivore/queries.js`)" section.

## Type System

### Type Files

```
src/types/
├── omnivore.ts    # API response types
├── content.ts     # Storage/front-matter types
├── analysis.ts    # Analysis result types
└── index.ts       # Central exports
```

### Omnivore API Types (`src/types/omnivore.ts`)

**Core Interfaces**:

```typescript
// Article from API
export interface OmnivoreArticle {
  id: string;
  title: string;
  url: string;
  originalArticleUrl?: string;
  slug?: string;
  content?: string;              // Only present if includeContent: true
  description?: string;
  author?: string;
  image?: string;
  siteName?: string;
  pageType?: string;
  wordCount?: number;
  createdAt: string;             // ISO 8601
  savedAt: string;               // ISO 8601
  publishedAt?: string;          // ISO 8601
  updatedAt: string;             // ISO 8601
  readingProgressTopPercent?: number;
  isArchived: boolean;
  folder?: string;
  labels: Label[];
  highlights: Highlight[];
}

// Label metadata
export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
}

// User highlight/annotation
export interface Highlight {
  id: string;
  quote: string;
  annotation?: string;
  createdAt: string;             // ISO 8601
}

// Search parameters
export interface SearchParams {
  query?: string;                // Omnivore query syntax
  first?: number;                // Results per page
  after?: string;                // Pagination cursor
  includeContent?: boolean;      // Include article HTML
}

// Pagination metadata
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
  totalCount: number;
}

// Search result wrapper
export interface SearchResult {
  edges: Array<{
    node: OmnivoreArticle;
  }>;
  pageInfo: PageInfo;
}

// User profile
export interface OmnivoreUser {
  id: string;
  name: string;
  email: string;
  profile: {
    username: string;
  };
}
```

**Import Pattern**:
```typescript
import type { OmnivoreArticle, SearchResult, Label } from '@omc-types/omnivore.js';
// OR
import type { OmnivoreArticle, SearchResult, Label } from '../types/omnivore';
```

### Content Storage Types (`src/types/content.ts`)

**Front-matter Interfaces** for Markdown files with YAML headers:

```typescript
// Article metadata (content/articles/*.md)
export interface ArticleFrontMatter {
  id: string;                    // Omnivore article ID
  url: string;
  title: string;
  author?: string;
  savedAt: string;               // ISO 8601
  publishedAt?: string;          // ISO 8601
  labels: string[];              // Label names (not IDs)
  highlights: number;            // Count
  wordCount: number;
  siteName?: string;
  topics?: string[];             // Added by analysis
  sentiment?: string;            // Added by analysis
  analyzed?: boolean;
}

// Analysis metadata (content/analysis/*.md)
export interface AnalysisFrontMatter {
  articleId: string;
  analyzedAt: string;            // ISO 8601
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  topicScores: Record<string, number>;
}

// Generated content metadata (content/generated/**/*.md)
export interface GeneratedContentFrontMatter {
  title: string;
  metaDescription: string;       // Max 155 chars
  generatedAt: string;           // ISO 8601
  type: 'blog-post' | 'newsletter';
  sources: string[];             // Article URLs
  topics: string[];
  publishedAt?: string;          // ISO 8601
  slug?: string;
}

// Complete stored article (after reading Markdown file)
export interface StoredArticle {
  frontMatter: ArticleFrontMatter;
  content: string;               // Markdown content
  highlights?: Array<{
    quote: string;
    annotation?: string;
  }>;
}

// Complete stored analysis
export interface StoredAnalysis {
  frontMatter: AnalysisFrontMatter;
  summary: string;
  keyPoints: string[];
  monetizationAngle: string;
}

// Complete generated content
export interface StoredGeneratedContent {
  frontMatter: GeneratedContentFrontMatter;
  content: string;
}

// Search index entry (content/.metadata/index.json)
export interface SearchIndexEntry {
  id: string;
  slug: string;
  title: string;
  topics: string[];
  savedAt: string;
  analyzed: boolean;
}
```

### Analysis Types (`src/types/analysis.ts`)

**AI Analysis Interfaces**:

```typescript
// Analysis result from Claude
export interface ContentAnalysis {
  articleId: string;
  topics: string[];              // 2-5 main topics
  topicScores: Record<string, number>;  // Topic → confidence (0-1)
  summary: string;               // 2-3 sentences
  keyPoints: string[];           // 3-5 takeaways
  sentiment: 'positive' | 'neutral' | 'negative';
  monetizationAngle: string;     // Content opportunity
  analyzedAt: string;            // ISO 8601
}

// Input to Claude for analysis
export interface AnalysisRequest {
  title: string;
  author?: string;
  url: string;
  content: string;
  wordCount: number;
  highlights: Array<{
    quote: string;
    annotation?: string;
  }>;
  publishedAt?: string;
}

// Topic with confidence
export interface TopicScore {
  topic: string;
  score: number;                 // 0-1
  keywords: string[];
}

// Analysis configuration
export interface AnalysisConfig {
  focusTopics?: string[];
  minTopicScore?: number;
  maxTopics?: number;
  includeSentiment?: boolean;
}

// Batch analysis result
export interface BatchAnalysisResult {
  articles: Array<{
    articleId: string;
    analysis: ContentAnalysis;
  }>;
  commonTopics: string[];
  trends: Array<{
    topic: string;
    frequency: number;
    averageScore: number;
  }>;
  analyzedAt: string;
}
```

### Central Exports (`src/types/index.ts`)

**Re-exports all types** plus utility types:

```typescript
// Re-exports
export * from './omnivore';
export * from './content';
export * from './analysis';

// Utility types
export type DateString = string;  // ISO 8601
export type UUID = string;
export type Slug = string;

// Generation config
export interface BlogPostConfig {
  type: 'single-article' | 'weekly-roundup' | 'deep-dive';
  title?: string;
  targetWordCount?: number;
  includeSources?: boolean;
  seoOptimize?: boolean;
}

export interface NewsletterConfig {
  type: 'weekly' | 'monthly';
  includeSections?: string[];
  maxArticles?: number;
  personalCommentary?: boolean;
}

// Publishing
export type PublishingPlatform = 'markdown' | 'ghost' | 'wordpress' | 'medium';

export interface PublishResult {
  platform: PublishingPlatform;
  success: boolean;
  url?: string;
  error?: string;
  publishedAt: string;
}
```

**Import Pattern**:
```typescript
// Import from index for convenience
import type {
  OmnivoreArticle,
  ContentAnalysis,
  ArticleFrontMatter
} from '@omc-types';

// OR import from specific files
import type { OmnivoreArticle } from '@omc-types/omnivore.js';
import type { ContentAnalysis } from '@omc-types/analysis.js';
```

## Environment Configuration

### Required Variables

**File**: `.env` (project root, gitignored)

```bash
# Omnivore API (REQUIRED)
OMNIVORE_API_KEY=your_api_key_here
OMNIVORE_API_URL=https://omnivore-api.caladan.haus/api/graphql

# Anthropic API (REQUIRED for analysis/generation phases)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Content directories (OPTIONAL - defaults provided)
CONTENT_OUTPUT_DIR=./content
ARTICLES_DIR=./content/articles
ANALYSIS_DIR=./content/analysis
GENERATED_DIR=./content/generated
```

### For Self-Hosted Omnivore

If using self-hosted Omnivore instance:
- Set `OMNIVORE_API_URL` to your instance's GraphQL endpoint
- Get API key from your instance's settings

### Example: `.env.example`

Template file included in repo shows all available configuration options.

## Usage Examples

### Fetching Articles

```javascript
import { searchArticles } from './lib/omnivore/client.js';
import { QUERY_PATTERNS } from './lib/omnivore/queries.js';

// Fetch AI articles from last 7 days
const result = await searchArticles({
  query: QUERY_PATTERNS.AI_ML + ' ' + QUERY_PATTERNS.LAST_7_DAYS,
  first: 10,
  includeContent: true
});

// Access articles
const articles = result.search.edges.map(edge => edge.node);
articles.forEach(article => {
  console.log(article.title);
  console.log(article.labels.map(l => l.name));
});
```

### Type-Safe Operations

```typescript
import type { OmnivoreArticle, SearchResult } from '@omc-types';
import { searchArticles } from './lib/omnivore/client.js';

async function getAIArticles(): Promise<OmnivoreArticle[]> {
  const result = await searchArticles({
    query: 'label:ai',
    first: 20
  }) as SearchResult;

  return result.edges.map(edge => edge.node);
}
```

### Testing Connection

```bash
# Test API connection
node lib/omnivore/client.js --test

# Expected output:
# ✅ Connected to Omnivore API
#    User: Your Name (your@email.com)
#    Username: yourusername
```

## File System Conventions

### Content Storage

```
content/
├── articles/              # Original articles as Markdown
│   └── YYYY-MM-DD-{slug}.md
├── analysis/              # Analysis results
│   └── YYYY-MM-DD-{slug}.md
├── generated/             # Generated content
│   ├── blog-posts/
│   │   └── YYYY-MM-DD-{title}.md
│   └── newsletters/
│       └── YYYY-WW-roundup.md
└── .metadata/
    └── index.json         # Search index
```

### Markdown Format

**Article File** (`content/articles/2025-09-30-example.md`):
```markdown
---
id: omnivore-abc123
url: https://example.com/article
title: Example Article
author: John Doe
savedAt: 2025-09-30T10:00:00Z
labels: [ai, machine-learning]
highlights: 3
wordCount: 2500
---

# Example Article

Article content here...

## Highlights

> Important quote
— Note: Why this matters
```

## Build System Details

### TypeScript Compilation

```bash
# Development build (with source maps & declarations)
pnpm run build
# Output: dist/ with .js, .d.ts, .js.map files

# Type check only (no output)
pnpm run typecheck

# Watch mode for development
pnpm run dev
```

### Path Aliases

Configured in tsconfig.json, usable in TypeScript files:
- `@lib/*` → `src/lib/*`
- `@storage/*` → `src/storage/*`
- `@analysis/*` → `src/analysis/*`
- `@generation/*` → `src/generation/*`
- `@utils/*` → `src/utils/*`
- `@omc-types/*` → `src/types/*`

### Module System

- **Type**: ESM (ES Modules)
- **Import syntax**: `import { x } from './file.js'` (include `.js` extension)
- **package.json**: `"type": "module"`

## What Does NOT Exist Yet

This groundtruth documents what IS built. These are NOT implemented:
- Automated content generation modules (blog posts/newsletters) - Phase 5
- Publishing modules (Ghost/WordPress/etc.) - Phase 6
- End-to-end scheduled orchestration beyond analysis (e.g., daily generation + publishing)

See IMPLEMENTATION_PLAN.md for what needs to be built.
