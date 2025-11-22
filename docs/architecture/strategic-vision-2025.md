# Strategic Vision 2025: Content Inbox + AI Curator

**Date**: 2025-01-16
**Status**: Strategic Planning - Building for Personal Use First
**Context**: Post-Omnivore, pre-launch, single developer, no users yet

---

## Executive Summary

**What We're Actually Building**: A unified content inbox with AI-powered triage and knowledge capture - think Hey.com meets Omnivore meets Readwise, powered by AI.

**Primary User**: Ourselves (dogfooding approach)
**Launch Strategy**: Build until we love using it daily → polish → invite beta users → iterate based on feedback
**Timeline**: 4-6 months to daily-use quality

---

## The Core Insight

### What We Thought We Were Building
"Personal Scholar" - an ambitious multi-modal knowledge platform with RAG, semantic search, podcasts, audiobooks, video transcripts, publishing platform, collaboration features.

**Problem**: That's 3+ products. Too ambitious. Unfocused.

### What We're Actually Building
**"Universal Content Inbox with AI Triage + Unified Knowledge Capture"**

Three core workflows:

1. **Universal Inbox**: All content flows into ONE place
   - Newsletters (via dedicated email addresses) ⭐ **THE KILLER FEATURE**
   - RSS feeds
   - Web articles (browser extension, mobile share)
   - PDFs, EPUBs
   - (Future) Podcast transcripts, YouTube videos

2. **AI-Powered Triage**: Daily digest that saves you time
   - Morning: "Here's what came in, here's what matters"
   - AI summaries (2-3 sentences per item)
   - Quick decisions: Read, Archive, Delete
   - Get to "Inbox Zero for Content" in minutes

3. **Unified Knowledge Capture**: Highlights work the same everywhere
   - Newsletter article → highlight → save
   - Podcast transcript → highlight → save
   - Web article → highlight → save
   - All highlights in one searchable, exportable collection

---

## Product Positioning

### What Makes This Different

**vs. Omnivore (original)**:
- ✅ We keep: Newsletter email addresses, unified library, highlights
- ➕ We add: AI triage/digest, better highlight workflow
- ➖ We defer: Multi-modal (until core works), publishing, collaboration

**vs. Readwise Reader**:
- ✅ Similar: Newsletter ingestion, highlights, exports
- ➕ Our advantage: Open-source, self-hostable, AI-first triage
- ➖ Their advantage: Mature product, established user base

**vs. Pocket/Instapaper**:
- ✅ Similar: Save articles for later
- ➕ Our advantage: Newsletters, AI summaries, better highlights, open-source
- ➖ Their advantage: Brand recognition, simple UX

**vs. NotebookLM**:
- ✅ Similar: AI over your content
- ➕ Our advantage: Automatic content ingestion (email, RSS), privacy (self-host)
- ➖ Their advantage: Google's AI models, document analysis

### Our Unique Positioning
> **"The open-source content inbox that brings your newsletters, articles, and feeds into one place, then uses AI to help you find what matters and capture insights."**

**Tagline ideas**:
- "Your content inbox, curated by AI"
- "One inbox for everything you read"
- "Newsletters + Articles + AI = Time Saved"
- "Content overload → Curated insights"

---

## Current State Assessment

### What's Built ✅ (Solid Foundation - 80% of infrastructure)

**Technical Foundation** (ARCs 1-8, 10A, 11-12):
- ✅ NestJS architecture with proper DI and modularity
- ✅ Authentication (JWT, Google OAuth, Apple ready)
- ✅ GraphQL API with Apollo Server
- ✅ Database with TypeORM (PostgreSQL)
- ✅ Queue system (BullMQ + EventBus) for background processing
- ✅ Library management (CRUD, search, filtering, sorting)
- ✅ Labels system (tag and organize)
- ✅ Bulk operations (multi-select, batch actions)
- ✅ Content ingestion (Readability + Open Graph for web articles)
- ✅ Basic reader (display articles with clean typography)
- ✅ URL saving with validation and duplicate detection
- ✅ 203 tests passing (87 unit + 116 E2E)
- ✅ Performance optimized (26x faster queries)

**Frontend** (Partial - Vite migration in progress):
- ✅ Basic library page with search/filter
- ✅ Authentication flow
- ✅ Multi-select UI
- ✅ Label picker
- ✅ Basic reader page
- ⏳ Missing: Complete UI polish, all interaction patterns

### What's Missing 🔴 (Critical for MVP)

**Core Features** (needed to use daily):
1. ⭐ **Email-to-Library** (THE killer feature - not built)
   - Create unique email addresses per user
   - SMTP inbound parsing
   - Extract newsletter content
   - Auto-save to library

2. ⭐ **AI Digest System** (the differentiator - not built)
   - Daily digest view ("what came in today")
   - AI summaries (integrate OpenAI/Anthropic)
   - Quick triage UI (Read/Archive/Delete from digest)
   - Smart prioritization

3. ✅ **Highlights System** (partially built, needs polish)
   - Basic highlights work in reader
   - Missing: Highlights view (all highlights across content)
   - Missing: Export to Obsidian/Notion
   - Missing: Content-type agnostic workflow

4. 🟡 **RSS Feed Ingestion** (not built, medium priority)
   - Subscribe to RSS/Atom feeds
   - Auto-fetch new articles
   - Treat like newsletters

5. 🟡 **Frontend Polish** (70% done, needs completion)
   - Complete library UI (ARC-009)
   - Polish reader experience (ARC-010)
   - Add keyboard shortcuts
   - Mobile responsive design

### What's Deferred ⏸️ (Future Nice-to-Haves)

**Multi-Modal** (not needed for MVP):
- ⏸️ Podcast transcription
- ⏸️ YouTube video transcripts (Omnivore had this in beta!)
- ⏸️ Audiobook support
- ⏸️ Voice notes

**Advanced AI** (too ambitious for MVP):
- ⏸️ RAG over entire library (Q&A: "What have I learned about X?")
- ⏸️ Semantic search (pgvector is ready, but not wired up)
- ⏸️ Cross-content synthesis
- ⏸️ Knowledge graph

**Social/Collaboration** (not relevant for solo use):
- ⏸️ Publishing highlights/collections
- ⏸️ Shared libraries
- ⏸️ Social features

---

## Realistic MVP Definition

### "Good Enough to Use Daily" Criteria

**When we've succeeded**:
1. ✅ All newsletters come into the app (not email inbox)
2. ✅ Every morning, AI digest shows what came in + summaries
3. ✅ Can triage 20 newsletters in 5 minutes (vs. 30 minutes in email)
4. ✅ When reading, can highlight and those highlights are easy to find later
5. ✅ Can search across all saved content (articles, newsletters)
6. ✅ Can export highlights to Obsidian for synthesis
7. ✅ Mobile works well enough to save/read on phone

**What we're willing to skip for MVP**:
- ❌ Podcasts (can add later if we want)
- ❌ Perfect UI polish (functional > beautiful)
- ❌ Advanced search (basic is fine)
- ❌ Social features (building for ourselves first)

---

## Revised Roadmap

### Phase 1: Complete Foundation (2-3 weeks) ⭐ **IN PROGRESS**

**Goal**: Finish what's 80% done so we have a solid base.

**Tasks**:
- [ ] ARC-009: Complete library UI feature parity (grid/list views, keyboard shortcuts)
- [ ] ARC-010: Finish reading experience (highlights, reading progress)
- [ ] ARC-016: Update Structurizr to reflect current vs. target state
- [ ] Frontend polish (mobile responsive, loading states, error handling)

**Outcome**: Can save articles, read them, highlight them. Still missing email ingestion and AI features.

---

### Phase 2: Email Ingestion (1-2 weeks) ⭐ **CRITICAL PATH**

**Goal**: Get newsletters flowing into the app - this is THE killer feature.

**New ARC**: **ARC-017: Email-to-Library System**

**Tasks**:
1. Research email parsing options:
   - Option A: SendGrid Inbound Parse (easiest, ~$20/mo)
   - Option B: AWS SES + Lambda (more control, similar cost)
   - Option C: Self-hosted SMTP (most control, most work)

2. Implement EmailModule:
   - Generate unique email addresses per user (e.g., username-abc123@app.com)
   - Parse inbound emails (extract text/HTML content)
   - Strip tracking pixels, clean HTML
   - Handle attachments (PDFs)
   - Save to library automatically with source = "email"

3. Frontend:
   - Settings page: Show user their email address(es)
   - "Add Email Address" button (create more if needed)
   - Test email ingestion flow

**Outcome**: Can subscribe to newsletters using app email address. All newsletters appear in library automatically.

**Technical Decisions Needed**:
- Email service provider (recommend: SendGrid for ease)
- Email address format: `{username}-{randomId}@domain.com`?
- Allow multiple email addresses per user? (e.g., one for news, one for tech)

---

### Phase 3: AI Digest & Triage (2-3 weeks) ⭐ **DIFFERENTIATOR**

**Goal**: AI summarizes what came in so you can triage in minutes.

**New ARC**: **ARC-018: AI Digest & Triage System**

**Tasks**:
1. OpenAI/Anthropic Integration:
   - Choose provider (recommend: OpenAI GPT-4o-mini for cost)
   - Implement summarization service
   - Batch summarization (summarize overnight content in one job)

2. Create AIModule:
   - `SummarizationService` (content → 2-3 sentence summary)
   - `DigestService` (generate daily digest)
   - Queue job: "Generate morning digest at 6am"

3. Digest UI:
   - New route: `/digest` or `/today`
   - Card layout: Title, Summary, Quick Actions (Read/Archive/Delete)
   - "Mark all as triaged" button
   - Sort by: Date, AI priority (future)

4. Backend:
   - Add `summary` column to library_item table
   - Add `triage_status` enum: pending, read, archived, deleted
   - Mutation: `bulkTriage(itemIds, action)`

**Outcome**: Morning routine = open app → digest shows 10 newsletters → read summaries → click into 2 interesting ones → archive rest → done in 5 minutes.

**Cost Estimate**:
- 20 newsletters/day × 1000 tokens/summary × $0.0001/token = ~$2/month
- Reasonable for personal use

---

### Phase 4: Unified Highlights (1 week) ⭐ **KNOWLEDGE CAPTURE**

**Goal**: Make highlights work the same across all content types and easy to review/export.

**New ARC**: **ARC-019: Unified Highlight System**

**Tasks**:
1. Backend:
   - Ensure highlight schema works for all content types
   - Add `content_type` field (article, newsletter, pdf, podcast_transcript)
   - Query: `highlights(filters: HighlightFilters)` - all highlights across everything

2. Frontend:
   - New route: `/highlights`
   - View all highlights (list or cards)
   - Filter by: content type, date, label, source
   - Search within highlights
   - Export: Markdown, JSON, Obsidian format

3. Reader improvements:
   - Show existing highlights when opening article
   - "Copy highlight" button (with citation)
   - Keyboard shortcut: H to view highlights panel

**Outcome**: Can highlight anything while reading → go to /highlights → see all captured insights → export to Obsidian for synthesis.

---

### Phase 5: RSS Feeds (1 week) 🟡 **NICE TO HAVE**

**Goal**: Support RSS feeds alongside newsletters.

**New ARC**: **ARC-020: RSS Feed Ingestion**

**Tasks**:
1. Create FeedModule:
   - `FeedEntity` (store feed subscriptions)
   - `FeedService` (fetch and parse RSS/Atom)
   - Cron job: Poll feeds every hour, add new items to library

2. Frontend:
   - Settings page: "Add RSS Feed" form
   - List subscribed feeds
   - Unsubscribe option

3. Feed discovery:
   - Detect RSS feeds on websites (optional)
   - Import OPML (optional)

**Outcome**: Can subscribe to RSS feeds. New articles appear in library automatically like newsletters.

---

### Phase 6: Polish & Dogfood (2-4 weeks) ✨ **USE IT DAILY**

**Goal**: Fix everything that annoys us in daily use.

**Tasks**:
- Use the app every day for all newsletters and articles
- Document friction points
- Fix bugs and UX issues
- Optimize performance
- Mobile polish (if we use mobile a lot)
- Dark mode (if we want it)
- Keyboard shortcuts (if we're power users)

**Outcome**: We love using it. It saves us time every day. We want to keep using it.

---

### Phase 7: Beta & Iteration (Ongoing) 🚀 **AFTER DOGFOODING**

**Goal**: Invite others, get feedback, iterate.

**Tasks**:
- Choose a name (rebrand from Omnivore)
- Polish landing page
- Write docs (setup, usage, self-hosting)
- Invite 10-20 beta users
- Collect feedback
- Iterate based on feedback
- Consider adding features users request (podcasts, video, etc.)

**Outcome**: Small but happy user base. Product-market fit validated. Ready for broader launch.

---

## Timeline Estimate

**Realistic timeline** (assuming part-time work, ~15-20 hours/week):

| Phase | Duration | Completion Date |
|-------|----------|----------------|
| Phase 1: Complete Foundation | 2-3 weeks | Early Feb 2025 |
| Phase 2: Email Ingestion | 1-2 weeks | Mid Feb 2025 |
| Phase 3: AI Digest | 2-3 weeks | Early Mar 2025 |
| Phase 4: Highlights | 1 week | Mid Mar 2025 |
| Phase 5: RSS Feeds | 1 week | Late Mar 2025 |
| Phase 6: Polish & Dogfood | 2-4 weeks | End of April 2025 |
| **Total to "Daily Use Quality"** | **~3-4 months** | **April 2025** |

**Optimistic**: 3 months if focused full-time
**Realistic**: 4-5 months with other commitments
**Pessimistic**: 6 months if lots of unknowns/blockers

---

## Resource Requirements

### Technical Infrastructure

**Development**:
- ✅ Already set up (NestJS, PostgreSQL, Redis, Docker)
- ✅ CI/CD (if needed)

**Services** (for hosted version):
- **Email parsing**: SendGrid Inbound Parse (~$20/mo for hobby tier)
- **AI summaries**: OpenAI API (~$2-5/mo for personal use)
- **Hosting**: Railway/Render/DigitalOcean (~$20-50/mo)
- **Storage**: S3/R2 (~$5/mo)
- **Total**: ~$50-80/mo for hosted version

**Self-Hosted** (alternative):
- Own server/VPS
- Self-hosted SMTP (more work to set up)
- Local AI models (Llama) or API keys
- **Total cost**: Just compute + domain

### Development Resources

**Solo developer (you)**:
- Estimate: 15-20 hours/week
- Timeline: 4-5 months

**If you had help**:
- +1 frontend dev: Could cut 2-3 weeks off timeline
- +1 backend dev: Could parallelize email + AI work
- **With small team**: 2-3 months

---

## Key Decision Points

### Decisions Needed Now

1. **Name & Branding**
   - Can't use "Omnivore"
   - Need new name before beta launch
   - Options: Synthesize, Distill, Curator, Nexus, Scholar, Nota, Codex?
   - Decision: Pick a working name soon, can refine later

2. **Email Service**
   - Recommendation: SendGrid Inbound Parse (easiest)
   - Alternative: AWS SES (more control)
   - Self-hosted SMTP (most work)
   - Decision: Start with SendGrid, can migrate later

3. **AI Provider**
   - Recommendation: OpenAI (GPT-4o-mini for cost)
   - Alternative: Anthropic Claude (often better quality)
   - Local models (too much work for MVP)
   - Decision: Start with OpenAI, easy to swap later

4. **Monetization Strategy** (future)
   - Freemium: Core free, premium AI features paid
   - Open-core: Self-hosted free, hosted service paid
   - Donation-based: Free + support the project
   - Decision: Can decide after launch, focus on product first

### Decisions That Can Wait

- Multi-modal (podcasts, video) - defer until after MVP
- Publishing/sharing features - not needed for solo use
- Mobile apps (native) - web + PWA might be enough
- Collaboration features - not relevant yet
- Advanced AI (RAG, semantic search) - too ambitious now

---

## Risk Assessment

### High-Confidence Areas ✅

**What we know works**:
- NestJS architecture is solid (proven through ARCs 1-12)
- Content extraction works (Readability + Open Graph)
- Queue system works (BullMQ tested)
- Database design is sound (TypeORM + PostgreSQL)
- We can ship working code (203 tests prove this)

### Medium-Risk Areas ⚠️

**What needs validation**:
- Email parsing (new territory, but well-documented solutions exist)
- AI summarization quality (will summaries actually be useful?)
- Daily usage (will we actually use this enough to find issues?)
- Performance at scale (works for 1 user, what about 100?)

### Unknown-Risk Areas ❓

**What we don't know yet**:
- Name/branding resonance (will name matter for adoption?)
- Product-market fit beyond ourselves (will others want this?)
- Self-hosting complexity (will users struggle to deploy?)
- Operating costs at scale (can we afford to run hosted version?)

### Mitigation Strategies

1. **Email parsing risk**: Start with SendGrid (proven solution), can always switch
2. **AI quality risk**: Prototype with OpenAI playground first, test different prompts
3. **Usage risk**: Commit to using it daily for 2 months before declaring success
4. **Scale risk**: Start self-hosted, optimize before offering hosted service

---

## Success Metrics

### Phase 1-6 (Building for Ourselves)

**How we'll know it's working**:
1. ✅ We use it every single day
2. ✅ We've stopped checking email for newsletters (they all go to app)
3. ✅ We can triage 20+ items in <10 minutes (vs. 30 minutes before)
4. ✅ We have 100+ highlights collected across articles
5. ✅ We prefer reading in the app over original websites
6. ✅ We haven't thought "I wish this did X" in 2 weeks (no major gaps)

**Red flags** (it's not working):
- 🚩 We stop using it after 2 weeks
- 🚩 We keep going back to email for newsletters
- 🚩 AI summaries aren't useful (still read everything anyway)
- 🚩 Highlights workflow feels clunky
- 🚩 Performance is frustrating (slow, buggy)

### Phase 7+ (Beta Users)

**Early traction indicators**:
- 10+ beta users actively using it
- Positive feedback: "This saves me time"
- Users highlight and export (using knowledge capture features)
- Low churn (users keep coming back)
- Feature requests align with roadmap (validates vision)

**Failure indicators**:
- Users try it once and don't return
- Feedback: "I don't understand what this is for"
- Requests for features we don't want to build
- No organic word-of-mouth

---

## Comparison to Original Product Brief

### What We're Keeping from "Personal Scholar" Vision

✅ **Core principles**:
- Open-source and self-hostable
- Privacy-first (no data selling, no ads)
- Unified library for all content types
- Highlights and knowledge capture
- API and integrations (Obsidian, Logseq)

✅ **Key features**:
- Newsletter ingestion (via email addresses) ⭐
- Web article saving
- PDF support
- Search and filtering
- Labels and organization
- Highlights system

### What We're Changing/Deferring

🔄 **Scope reduction** (from ambitious to focused):
- ❌ Not building: Podcasts, audiobooks, YouTube (for now)
- ❌ Not building: Publishing platform, social features
- ❌ Not building: Voice notes, real-time audio clipping
- ❌ Not building: Full RAG system, semantic search
- ➕ Adding: AI digest and triage (new focus)
- ➕ Adding: Better email workflow (expanded focus)

🔄 **Product positioning** (from "everything" to "content inbox"):
- Before: "Personal Scholar - learn from your entire knowledge base"
- After: "Content Inbox - newsletters and articles, curated by AI"
- More focused, more achievable, still valuable

🔄 **Go-to-market** (from community to dogfood-first):
- Before: Build features users requested from Omnivore community
- After: Build for ourselves first, then invite others
- More sustainable, ensures product quality

### What We Learned

**Original brief was too ambitious**:
- "Personal Scholar" = 3+ products in one
- Multi-modal + AI + publishing + collaboration = years of work
- Tried to be everything to everyone

**New approach is more focused**:
- "Content Inbox" = 1 product with clear use case
- Start with newsletters + articles + AI triage
- Add multi-modal later if we need it
- Build for ourselves first = clear validation

**The core insight remains**:
> People are drowning in content (newsletters, articles, feeds). They need a single place to collect it all, AI to help them triage, and a way to capture insights.

That's what we're building. Everything else is secondary.

---

## Next Steps (This Week)

### Immediate Actions

1. **[ ] Update Structurizr** (ARC-016)
   - Create `workspace.current-state.dsl` showing what's built
   - Update `workspace.dsl` as target state with new vision
   - Document EmailModule, DigestModule, AIModule architecture
   - Generate diagrams showing current → target

2. **[ ] Strategic Alignment**
   - Share this document for review/refinement
   - Decide on working name (brainstorm options)
   - Confirm MVP scope and timeline
   - Choose email service (SendGrid recommended)
   - Choose AI provider (OpenAI recommended)

3. **[ ] Finish In-Progress Work** (ARC-009, ARC-010)
   - Complete library UI features
   - Finish reading experience with highlights
   - Test end-to-end flow (save → read → highlight)

### This Month (January 2025)

**Week 1-2** (Now):
- ✅ Strategic planning (this document)
- [ ] Architecture updates (Structurizr)
- [ ] Finish library UI (ARC-009)

**Week 3-4**:
- [ ] Complete reading experience (ARC-010)
- [ ] Begin email ingestion research (ARC-017)
- [ ] Set up OpenAI API access (for future AI work)

### Next Month (February 2025)

**Week 1-2**:
- [ ] Implement email-to-library (ARC-017)
- [ ] Test with real newsletters

**Week 3-4**:
- [ ] Start AI digest system (ARC-018)
- [ ] Build digest UI

---

## Appendix: Name Ideas

Since we can't use "Omnivore," here are some options organized by theme:

### Inbox/Curation Theme
- **Curator** - organize and maintain your content collection
- **Distill** - extract the essential meaning from information
- **Synthesize** - combine information into coherent whole
- **Streamline** - make content flow efficient
- **Nexus** - central connection point for all content

### Knowledge/Learning Theme
- **Scholar** - simple, direct, fits "Personal Scholar"
- **Nota** - Latin for notes/marks (nota.app)
- **Codex** - ancient manuscript, knowledge container
- **Digest** - process and absorb information (digest.app)
- **Archive** - preserve and organize knowledge

### Focus/Clarity Theme
- **Clarity** - cut through information overload
- **Focus** - what matters from the noise
- **Essence** - the most important elements
- **Signal** - find signal in the noise

### Action/Process Theme
- **Triage** - sort and prioritize (medical term, fits AI sorting)
- **Pipeline** - content flows through processing
- **Filter** - separate valuable from noise
- **Sift** - carefully examine and select what's valuable

**My top picks**:
1. **Synthesize** - captures curation + knowledge synthesis
2. **Distill** - captures AI triage + extracting essence
3. **Nexus** - captures central hub concept
4. **Scholar** - connects to original "Personal Scholar" vision
5. **Curator** - self-explanatory, professional

---

## Conclusion

**We're building the content inbox we wish existed**:

- One place for newsletters, articles, feeds
- AI that triages so we don't have to read everything
- Highlights that actually become a useful knowledge base
- Open-source so we own our data

**We're at 80% of the technical foundation. We need 4-5 more months to get to "daily use quality."**

The path forward is clear:
1. Finish what's in progress (1 month)
2. Add email ingestion (2 weeks)
3. Add AI digest (3 weeks)
4. Polish highlights (1 week)
5. Dogfood until we love it (1 month)

**Then we launch.**

Let's build something we actually want to use every day.
