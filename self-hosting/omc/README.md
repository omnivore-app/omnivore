# Omnivore Content Monetization System

AI-powered content generation system that transforms your Omnivore reading into monetizable content: blog posts, newsletters, and social media posts.

## 🔎 Current Reality (Audit: 2026-01-30)

- The CLI command set is largely implemented (`omc queue/*`, `omc analyze/*`, `omc content/*`, `omc report/*`, `omc omnivore/*`, `omc db/*`, `omc config/*`).
- There are still critical fixups needed before this repo is “clean build + reliable run”; see `docs/_meta/current-state.md`.

## 🚀 Features

### ✅ Currently Working
- **Omnivore API Client**: Fetch/search/update articles, highlights, and notes
- **Queue + Tracking DB**: SQLite-backed analysis queue (`data/omnivore-content.db`)
- **Analysis Workflow**: Prepare stub files → run external analyzer → persist results to Markdown + DB
- **Reporting**: Topic/sentiment/trend aggregation across saved analyses
- **Sync Back to Omnivore**: Push summaries (and optional NOTE highlights) back to Omnivore

### 🚧 Planned Features (NOT YET IMPLEMENTED)
- **Blog Post Generation** *(Phase 5)*: Create weekly roundups, deep dives, tutorials from your saved articles
- **Newsletter Creation** *(Phase 5)*: Generate curated newsletters with your commentary
- **SEO Optimization** *(Phase 5)*: Automatic title, description, and tag generation
- **Trend Tracking** *(Phase 7)*: Identify emerging topics before they peak
- **Multi-Agent System** *(Phase 6-7)*: Specialized Claude agents for each content type
- **Publishing Integration** *(Phase 6)*: Ghost, WordPress, Medium support
- **First-Class Content Generation Pipeline**: Turn analyses into publishable posts (beyond reporting/export)

## 📋 Prerequisites

- Node.js 18+
- Omnivore account with API key
- Anthropic API key (Claude)
- Self-hosted Omnivore instance OR Omnivore cloud account

## 📦 Current Status

**Phase 0: Foundation ✅ COMPLETE**
- TypeScript toolchain configured
- Omnivore GraphQL client working
- Directory structure created
- Ready for standalone extraction

**Phases 1-6: In Progress**
- See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed roadmap

## 🛠️ Installation

1. **Extract to standalone directory** (if from omnivore repo)
   ```bash
   cp -r omnivore/scripts/omnivore-content-system /path/to/new-repo/
   cd /path/to/new-repo/omnivore-content-system
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys:
   # - OMNIVORE_API_KEY
   # - OMNIVORE_API_URL
   # - ANTHROPIC_API_KEY
   ```

4. **Test setup**
   ```bash
   # Test Omnivore connection
   node lib/omnivore/client.js --test

   # Test TypeScript build
   pnpm run build

   # Note: `pnpm run typecheck` is currently failing due to known alias/import issues.
   # See: docs/_meta/current-state.md
   ```

## ⚙️ Configuration

### Required Environment Variables

```bash
OMNIVORE_API_KEY=your_omnivore_api_key
OMNIVORE_API_URL=https://your-omnivore-instance.com/api/graphql
ANTHROPIC_API_KEY=your_claude_api_key
```

### Optional Configuration (NOT IMPLEMENTED YET)

- **Publishing**: Configure Ghost, WordPress, or Medium credentials *(Phase 6)*
- **Topics**: Edit `config/topics.json` to customize AI/Tech categories *(Phase 1)*
- **Templates**: Modify templates in `templates/` for your style *(Phase 5)*
- **Workflows**: Adjust workflow schedules in `config/workflows.json` *(Phase 9)*

## 🎯 Usage (Current)

### Currently Working
```bash
# Setup checks
omc doctor

# Add recent articles to queue
omc queue add --hours 24

# Prepare stub files for external analysis
omc analyze run --batch-size 5

# After your external analyzer writes `analysis` into temp/*.jsonl:
omc analyze complete

# View/search
omc content list
omc content search "kubernetes"

# Categorized reports
omc report topics
omc report trends
```

For a deeper breakdown (what works, what’s broken, and what to fix next), see `docs/_meta/current-state.md`.

## 📁 Project Structure

```
omnivore-content-system/
├── lib/                    # ✅ Omnivore GraphQL client (WORKING)
│   └── omnivore/
│       ├── client.js       # ✅ Full-featured GraphQL client
│       └── queries.js      # ✅ Query builders
├── src/                    # ✅ TypeScript source (READY)
│   ├── types/             # (Phase 1 - not started)
│   ├── storage/           # (Phase 3 - not started)
│   ├── analysis/          # (Phase 4 - not started)
│   ├── generation/        # (Phase 5 - not started)
│   ├── publishing/        # (Phase 6 - not started)
│   ├── workflows/         # (Phase 9 - not started)
│   └── utils/             # (Phase 2 - not started)
├── content/               # ✅ Storage directories (READY)
│   ├── articles/          # (empty - Phase 3)
│   ├── analysis/          # (empty - Phase 4)
│   └── generated/         # (empty - Phase 5)
├── test-scripts/          # ✅ Test scripts (READY)
├── cli/                   # (Phase 2-6 - not started)
├── tests/                 # ✅ Test directory (READY)
├── legacy-scripts/        # ✅ Original migration scripts (preserved)
├── templates/             # (empty - Phase 5 needed)
├── .claude/               # (Agent SDK config - Phase 6+)
├── tsconfig.json          # ✅ TypeScript config (WORKING)
├── package.json           # ✅ Dependencies (WORKING)
└── .env.example           # ✅ Config template (WORKING)
```

**Legend:**
- ✅ = Working and ready to use
- (empty) = Directory created but no files yet
- (Phase X) = Implementation planned, not started
- (WORKING) = Fully functional

## 🤖 Agent Architecture (NOT IMPLEMENTED - Phase 6-8)

### Orchestrator Agent *(NOT IMPLEMENTED)*
Main controller that coordinates all subagents and workflows.

### Specialized Agents *(NOT IMPLEMENTED)*
- **Content Analyzer** *(Phase 7)*: Analyzes reading patterns, extracts themes
- **Blog Writer** *(Phase 7)*: Generates blog posts from analyzed content
- **Newsletter Creator** *(Phase 7)*: Creates newsletters with commentary
- **SEO Optimizer** *(Phase 7)*: Optimizes titles, descriptions, tags
- **Trend Tracker** *(Phase 7)*: Identifies emerging topics and opportunities

### MCP Servers *(NOT IMPLEMENTED - Phase 8)*
- **Omnivore MCP**: Tools for searching, fetching articles, highlights
- **Content DB MCP**: Tools for saving and tracking generated content

## 📝 Content Templates (NOT IMPLEMENTED - Phase 5)

### Blog Post Types *(NOT IMPLEMENTED)*
- **Weekly Roundup**: Top 5-10 articles from the week
- **Deep Dive**: Multi-article synthesis into long-form analysis
- **Tutorial**: How-to content extracted from technical articles
- **Comparison**: "X vs Y" posts from related articles

### Newsletter Formats *(NOT IMPLEMENTED)*
- **Weekly Digest**: Curated links with your commentary
- **Themed Edition**: Deep dive into single topic

### Social Media *(NOT IMPLEMENTED)*
- **Twitter Threads**: Key insights from articles
- **LinkedIn Posts**: Professional summaries

## 🔧 Legacy Scripts

All original Omnivore scripts are preserved in `legacy-scripts/`:
- `import-pocket.js` - Import from Pocket
- `apply-labels.js` - Label management
- `migrate-omnivore.js` - Data migration
- And more...

These can be called from agents as needed or run independently.

## 💾 Content Storage (Phase 3 - NOT IMPLEMENTED)

Will use **Markdown + front-matter + Git** (no database):
- **content/articles/** *(empty)*: Omnivore articles saved as Markdown
- **content/analysis/** *(empty)*: AI analysis results
- **content/generated/** *(empty)*: Generated blog posts and newsletters
- **Front-matter**: YAML metadata in each file
- **Git**: Version control and history

Directories are created but no storage implementation yet.

## 🚀 Publishing (Phase 6 - NOT IMPLEMENTED)

### Ghost CMS *(NOT IMPLEMENTED)*
```bash
# Configuration ready in .env.example, but no publisher code yet
GHOST_API_URL=https://your-blog.ghost.io
GHOST_API_KEY=your_admin_api_key
```

### WordPress *(NOT IMPLEMENTED)*
```bash
WORDPRESS_URL=https://your-site.com
WORDPRESS_API_KEY=your_api_key
```

### Medium *(NOT IMPLEMENTED)*
```bash
MEDIUM_TOKEN=your_integration_token
```

## 🐛 Troubleshooting

### API Connection Issues (Currently Applicable)
- Verify `OMNIVORE_API_KEY` is correct
- Check `OMNIVORE_API_URL` is accessible
- Test with: `node lib/omnivore/client.js --test`

### TypeScript Build Issues (Currently Applicable)
- Run `pnpm install` to ensure dependencies are installed
- Run `pnpm run typecheck` to verify no type errors
- Check that Node.js version is ≥18.0.0

### Agent Issues *(NOT APPLICABLE YET - Phase 6+)*
- Check `ANTHROPIC_API_KEY` is set
- Verify Claude Agent SDK is installed
- Review logs in `data/logs/`

### Storage Issues *(NOT APPLICABLE YET - Phase 3+)*
- Check permissions on `content/` directory
- Verify Git is initialized if using version control

## 📚 Documentation

- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - ✅ Detailed implementation roadmap (current)
- **[EXTRACTION_CHECKLIST.md](./EXTRACTION_CHECKLIST.md)** - ✅ Steps to move to standalone repo (current)
- **[CLAUDE.md](./CLAUDE.md)** - ✅ Agent context and content strategy (current)
- ~~Setup Guide~~ *(NOT CREATED - covered in this README)*
- ~~Workflows~~ *(NOT CREATED - Phase 9)*
- ~~Agent Architecture~~ *(NOT CREATED - Phase 6-8)*
- ~~API Documentation~~ *(NOT CREATED - Phase 1-7)*

## 🤝 Contributing

This is a personal content system, but suggestions welcome!

## 📄 License

MIT

## 🙏 Credits

Built with:
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk-typescript) by Anthropic
- [Omnivore](https://omnivore.app/) for reading management
- Your voracious reading habit!
