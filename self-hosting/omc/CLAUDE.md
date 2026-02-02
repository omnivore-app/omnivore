# Omnivore Content System - Agent Context

## Project Purpose
Transform voracious reading habits into monetizable content through AI-powered analysis and generation.

## Content Strategy

### Primary Topics
- **AI & Machine Learning**: LLMs, agents, training, deployment
- **Tech Infrastructure**: Cloud, DevOps, databases, system design
- **Software Engineering**: Best practices, tools, frameworks
- **Startup/Business**: Product, growth, monetization strategies

### Content Goals
1. **Weekly Blog Roundup**: Top 5-10 AI/Tech stories with analysis
2. **Deep Dive Posts**: Multi-article synthesis into original analysis
3. **Newsletter**: Curated links with personal commentary
4. **SEO Optimization**: Drive organic traffic through strategic keywords
5. **Monetization**: Build audience → affiliate links → sponsorships

## Writing Style

### Voice & Tone
- **Authoritative yet accessible**: Technical depth without jargon overload
- **Opinionated**: Strong takes backed by evidence from reading
- **Practical**: Focus on actionable insights and implications
- **Conversational**: Write like talking to a smart colleague

### Content Structure
- **Hook**: Start with surprising insight or provocative question
- **Context**: Brief background from articles
- **Analysis**: Your unique take connecting multiple sources
- **Implications**: What this means for readers
- **CTA**: Subscribe, share, engage

### Writing Guidelines
- Use active voice
- Short paragraphs (2-3 sentences max)
- Subheadings for scannability
- Bullet points for lists
- Examples and analogies
- Link to sources (Omnivore articles)

## Content Types

### 1. Weekly Roundup (Fridays)
**Format**: "AI/Tech This Week: Top 5 Stories You Need to Know"
- 5-10 articles from the week
- 100-150 words per story
- Overall theme/trend analysis
- 800-1200 words total

### 2. Deep Dive (Monthly)
**Format**: "The Complete Guide to [Topic]"
- Synthesize 10-20 articles on single topic
- Original analysis and insights
- Code examples, diagrams
- 2000-3000 words

### 3. Newsletter (Sundays)
**Format**: "Weekend Reading: AI/Tech Digest"
- 7-10 curated links
- Personal commentary (50-75 words each)
- Quick hits section (5-10 line items)
- 600-800 words total

### 4. Social Media
**Twitter Threads**: Key insights from deep dives (8-10 tweets)
**LinkedIn Posts**: Professional takeaways (300-500 words)

## SEO Strategy

### Primary Keywords
- "AI trends 2025"
- "LLM development"
- "Claude agents tutorial"
- "Tech infrastructure best practices"
- "Startup engineering advice"

### Content Optimization
- Title: 60 chars, keyword-rich, curiosity-driven
- Meta description: 155 chars, compelling summary
- H2 headers: Question-based, keyword-targeted
- Internal links: Cross-reference related posts
- External links: High-authority sources (Omnivore articles)

## Monetization Path

### Phase 1: Audience Building (Months 1-3)
- Publish 2x/week (roundup + deep dive)
- Email list growth (newsletter signups)
- SEO optimization for organic traffic
- Social media distribution

### Phase 2: Engagement (Months 4-6)
- Reader surveys and topic requests
- Comments and discussions
- Guest posts and collaborations
- Community building

### Phase 3: Monetization (Months 7+)
- Affiliate links (tools, books, courses)
- Sponsored posts (relevant products)
- Premium newsletter tier
- Consulting/advisory services

## Quality Standards

### Before Publishing
- [ ] Fact-check all claims against source articles
- [ ] Verify all links work
- [ ] Run through Grammarly or similar
- [ ] Check SEO optimization (Yoast, etc.)
- [ ] Preview formatting on target platform
- [ ] Add cover image (if applicable)

### Performance Tracking
- Google Analytics: Traffic, engagement, conversions
- Email metrics: Open rate, click rate, growth
- Social metrics: Shares, comments, saves
- Database: Track which articles → which posts → performance

## Article Analysis Workflow

### How to Process Queued Articles

When user asks to analyze articles, use the unified CLI:

**Automated (cron/launchd):**
```bash
# End-to-end, non-interactive (uses codex exec in read-only mode)
omc queue add --hours 24
omc analyze auto --batch-size 5

# Retry failures (optional)
omc analyze retry --failed
```

**Basic Analysis:**
```bash
# Prepare batch (creates stub files, outputs agent params)
omc analyze run --batch-size 5

# Prepare specific article
omc analyze run --article-id <article-id>

# After agents complete: save results to database + markdown
omc analyze complete

# Save with keeping temp files for debugging
omc analyze complete --keep-temp
```

**Queue Management:**
```bash
# Add articles to queue
omc queue add --hours 24          # Last 24 hours
omc queue add --label "ai-ml"     # By label
omc queue add --url <url>         # Single article
omc queue add --slug <slug>       # By slug

# Check queue status
omc queue list                    # All queued articles
omc queue list --status pending   # Filter by status
omc queue stats                   # Statistics

# Retry failed analyses
omc analyze retry --failed        # All failed
omc analyze retry --article-id <id>  # Specific article
```

**Automation notes:**
- `omc analyze auto` shells out to `codex exec -s read-only` and expects a single JSON object response.
- For schedulers, we set `CODEX_HOME=temp/codex-home` so runs don’t depend on `~/.codex` permissions.
- Prefer running installs/builds via Corepack (`corepack pnpm ...`) to avoid native-module ABI mismatches.

**View Results:**
```bash
# Show analysis for specific article
omc content show <article-id>

# List all analyzed content
omc content list

# Search analyses
omc content search "keyword"

# Generate reports
omc report corpus                 # Full corpus analysis
omc report topics                 # Topic distribution
omc report trends                 # Trending topics
```

**Sync to Omnivore (Create Notebook Notes):**
```bash
# Sync single article with note creation
omc content sync <article-id> --create-notes

# Sync all analyzed articles with notes
omc content sync --all --create-notes

# Sync without creating notes (metadata only)
omc content sync <article-id>
```

### Complete Workflow (Agent-Assisted Analysis)

**From Reading to Published Notes:**

1. **Add to Queue**: `omc queue add --hours 168` (or by label, URL, slug)
2. **Prepare Batch**: `omc analyze run --batch-size 5`
   - Creates stub files in `temp/*.jsonl`
   - Marks jobs as "in_progress"
   - Outputs agent parameters (copy these)
3. **Invoke Agents**: Copy agent parameters and invoke article-content-analyzer agents via Task tool
   - Agents fetch content via `omc omnivore get`
   - Agents analyze and enrich stub files
   - Run 5 agents in parallel for performance
4. **Save Results**: `omc analyze complete`
   - Reads enriched JSONL from temp/
   - Writes markdown to `content/analysis/*.md`
   - Saves to database
   - Marks jobs "completed"
5. **Review**: `omc content show <article-id>` or `omc content list`
6. **Sync to Omnivore**: `omc content sync --all --create-notes`
   - Updates article descriptions
   - Creates notebook notes with full analysis
7. **Repeat**: Go back to step 2 until queue empty

**Key Commands:**
- `omc analyze run --batch-size 5` - Prepare next batch
- `omc analyze complete` - Save completed analyses
- `omc content sync --all --create-notes` - Push to Omnivore

### Legacy Scripts (Archived)
Old workflow scripts have been archived in `cli/archived-scripts/`. Use the CLI commands above instead.

## Code Quality Tools

### OACC (Omniarcs Code Checker)
The project has access to `oacc analyze` for automated code quality analysis. **Use this instead of manual analysis.**

**Available via Bash tool (auto-approved):**
```bash
oacc analyze <file_path>
oacc analyze --functions <file_path>
```

**What oacc provides:**
- **Function length analysis**: Automatic counting with thresholds
  - GREEN: ≤20 lines (target)
  - YELLOW: 21-25 lines (warning)
  - RED: >25 lines (must fix)
- **Function-level reports**: Shows each function with line count
- **Exit codes**: 0 = GREEN, 1 = YELLOW/RED
- **FTA scores**: Code quality metrics

**DO NOT manually:**
- Write Python/shell scripts to count lines
- Parse files with regex to find functions
- Manually count function lengths
- Create custom analysis tools

**DO use oacc:**
```bash
# Check single file
oacc analyze src/commands/queue/export.ts

# Get function-level details
oacc analyze --functions src/commands/queue/export.ts

# Analyze multiple files in quality-guard agent
for file in src/commands/**/*.ts; do
  oacc analyze "$file"
done
```

**Quality-guard agent**: Always use `oacc analyze` for function length validation. It's pre-approved and faster than manual analysis.

## CLI Development Ground Truths

### Architecture Patterns (Established 2025-01-05)

**1. All Commands MUST Extend BaseCommand**
- Location: `src/lib/cli/base-command.ts:16`
- Pattern: `export default class MyCommand extends BaseCommand`
- Why: Provides standard error handling, run() method, and OCLIF integration
- Evidence: All 63 commands use this pattern (verified 2025-01-05)

**2. Database Operations MUST Use withDatabase()**
- Location: `src/lib/cli/database.ts:17`
- Pattern: `await withDatabase(async (db, repo) => { ... })`
- Why: Ensures proper connection cleanup and error handling
- Evidence: 45/46 database commands use this (db/backup.ts fixed 2025-01-05)

**3. JSON Parsing MUST Use parseJsonSafely()**
- Location: `src/lib/cli/command-utils.ts:45`
- Pattern: `const data = parseJsonSafely<ContentAnalysis>(job.analysisJson)`
- Why: Prevents crashes on malformed JSON, provides type safety
- Evidence: 15+ commands updated to use this (2025-01-05)

**4. Shared Flags MUST Use Utility Functions**
- `jsonFlag()`: `src/lib/cli/shared-flags.ts:14` - Standard JSON output flag
- `statusFlag()`: `src/lib/cli/shared-flags.ts:8` - Queue status filtering
- Why: DRY principle, consistent flag behavior
- Evidence: 45/63 commands use jsonFlag()

**5. Output Formatting MUST Use Shared Formatters**
- `formatHeader()`: `src/lib/cli/formatters.ts:18` - Section headers
- `formatSuccess()`: `src/lib/cli/formatters.ts:37` - Success messages
- `formatError()`: `src/lib/cli/formatters.ts:48` - Error messages
- Why: Consistent user experience, single source of truth
- Evidence: All 63 commands use these formatters

**6. GraphQL Operations MUST Use checkGraphQLResult()**
- Location: `src/lib/cli/graphql.ts:21`
- Pattern: `checkGraphQLResult(result)` after every GraphQL call
- Why: Checks both result.errors AND domain errorCodes
- Evidence: All 9 omnivore commands use this

**7. Environment Variables MUST Use loadEnvFile()**
- Location: `src/lib/cli/command-utils.ts:58`
- Pattern: `const env = loadEnvFile('.env')`
- Why: Centralized .env parsing, no duplicate implementations
- Evidence: 2 duplicate implementations removed (2025-01-05)

### Shared Utilities Reference

**Database Utilities:**
```typescript
// src/lib/cli/database.ts
withDatabase<T>(callback: (db, repo) => Promise<T>): Promise<T>
```

**Data Utilities:**
```typescript
// src/lib/cli/command-utils.ts
parseJsonSafely<T>(jsonString: string, fallback?: T): T | undefined
loadEnvFile(envPath: string = '.env'): Record<string, string>
handleCommandError(command: Command, error: unknown): void
outputResult(command: Command, data: any, successMessage: string, jsonMode: boolean): void
```

**Flag Utilities:**
```typescript
// src/lib/cli/shared-flags.ts
jsonFlag(): Flags.Boolean
statusFlag(): Flags.String
```

**Formatting Utilities:**
```typescript
// src/lib/cli/formatters.ts
formatHeader(title: string): string
formatSuccess(message: string): string
formatError(message: string): string
formatDivider(): string
```

**GraphQL Utilities:**
```typescript
// src/lib/cli/graphql.ts
checkGraphQLResult(result: any): void
fetchUsername(): Promise<string>
```

**Display Utilities:**
```typescript
// src/lib/cli/queue-display.ts
displayQueueStats(stats: QueueStats): void
displayJobs(jobs: AnalysisJob[]): void
```

### Command Structure Pattern

**Every command follows this structure:**
```typescript
import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { withDatabase } from '@lib/cli/database.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { formatSuccess } from '@lib/cli/formatters.js';

export default class MyCommand extends BaseCommand {
  static override description = 'Clear description';

  static override examples = [
    '$ omc command arg --flag'
  ];

  static override args = {
    myArg: Args.string({ description: 'Arg description', required: true })
  };

  static override flags = {
    json: jsonFlag(),
    myFlag: Flags.string({ description: 'Flag description' })
  };

  protected async execute(flags: any): Promise<void> {
    await withDatabase(async (db, repo) => {
      // 1. Validate input
      // 2. Execute business logic
      // 3. Format output
      if (flags.json) {
        this.log(JSON.stringify(result, null, 2));
      } else {
        this.log(formatSuccess('Success message'));
      }
    });
  }
}
```

### Complete Command Inventory (63 total)

**Queue Management (9 commands):**
- `queue:add` - Add articles to queue
- `queue:list` - List queued articles
- `queue:stats` - Show queue statistics (with --detailed)
- `queue:reset` - Reset article status
- `queue:remove` - Remove from queue
- `queue:clear` - Bulk clear operations
- `queue:export` - Export queue state
- `queue:import` - Import queue state
- `queue:retry` - Retry failed items

**Analysis Operations (4 commands):**
- `analyze:run` - Process articles
- `analyze:retry` - Retry failed analyses
- `analyze:status` - Show analysis status
- `analyze:watch` - Real-time monitoring

**Omnivore Integration (9 commands):**
- `omnivore:get` - Fetch article by slug
- `omnivore:search` - Search articles
- `omnivore:list` - List recent articles
- `omnivore:update` - Update article metadata
- `omnivore:note:add` - Add note
- `omnivore:note:get` - Get notes
- `omnivore:note:update` - Update note
- `omnivore:highlight:add` - Add highlight
- `omnivore:highlight:list` - List highlights

**Content Operations (5 commands):**
- `content:show` - Display analysis
- `content:list` - List analyzed content
- `content:search` - Full-text search
- `content:sync` - Sync to Omnivore
- `content:export` - Export for blog

**Database Management (9 commands):**
- `db:migrate` - Run migrations
- `db:schema` - Show schema
- `db:seed` - Load sample data
- `db:vacuum` - Optimize database
- `db:backup` - Create backup
- `db:restore` - Restore from backup
- `db:reset` - Drop and recreate
- `db:check` - Integrity check
- `db:stats` - Database statistics

**Reporting (7 commands):**
- `report:corpus` - Full corpus analysis
- `report:topics` - Topic distribution
- `report:trends` - Trending topics
- `report:monetization` - Opportunities
- `report:sentiment` - Sentiment analysis
- `report:custom` - Custom queries
- `report:export` - Export reports

**Configuration (7 commands):**
- `config:show` - Display config
- `config:get` - Get value
- `config:set` - Set value
- `config:test` - Test API connection
- `config:validate` - Validate config
- `config:env:list` - List environments
- `config:env:use` - Switch environment

**System (3 commands):**
- `init` - Initialize project
- `doctor` - System health check
- `version` - Version info

### DRY Principles (Zero Tolerance)

**Violations to Avoid:**
1. ❌ Direct `JSON.parse()` without error handling → Use `parseJsonSafely()`
2. ❌ Manual database init/close → Use `withDatabase()`
3. ❌ Duplicate flag definitions → Use `jsonFlag()`, `statusFlag()`
4. ❌ Custom error handling → Extend `BaseCommand`
5. ❌ Duplicate .env parsing → Use `loadEnvFile()`
6. ❌ Direct Command extension → Extend `BaseCommand`
7. ❌ Custom formatters → Use formatHeader/Success/Error
8. ❌ GraphQL without error check → Use `checkGraphQLResult()`

**Evidence of Compliance:**
- All 63 commands extend BaseCommand ✓
- All 45 database commands use withDatabase() ✓
- All 15+ JSON parsing uses parseJsonSafely() ✓
- Zero duplicate helper functions ✓
- (Last verified: 2025-01-05)

### Quality Metrics

**Function Length Distribution (2025-01-05):**
- GREEN (≤20 lines): 52 commands (83%)
- YELLOW (21-25 lines): 11 commands (17%)
- RED (>25 lines): 0 commands (0%)

**Build Status:**
- TypeScript: Strict mode enabled
- Compilation: 0 errors, 0 warnings
- Bundle size: Optimized with ESBuild
- Commands registered: 63/63 (100%)

## Notes for Agents
- **Always cite sources**: Link back to Omnivore articles
- **Maintain authenticity**: Sound like the human, not generic AI
- **Be selective**: Quality content over quantity
- **Stay current**: Focus on recent articles (last 7-30 days)
- **Think monetization**: Every piece should serve the business goal
- **Use oacc for code analysis**: Don't reinvent code quality tools
