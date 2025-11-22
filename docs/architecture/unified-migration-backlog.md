# Unified Migration Backlog: Express to NestJS

**Last Updated**: November 21, 2025

This is the **active working backlog** containing only pending and in-progress items. Completed items have been moved to `unified-migration-backlog-complete.md`.

**Key Approach**: Start with a new NestJS service (Node.js 22 LTS) running alongside Express, then migrate features slice-by-slice until we can decommission the old services.

---

## 🎯 Current Status Summary

### ✅ **COMPLETED** (16 Major ARCs)
All completed items moved to `unified-migration-backlog-complete.md`. Key achievements:
- **Backend Foundation**: NestJS setup, auth, GraphQL, database integration
- **Core Features**: Library CRUD, search, labels, bulk operations, highlights, reading progress
- **Infrastructure**: Queue system (80%), repository pattern, testing infrastructure
- **Frontend**: Vite migration, library UI, reader page, labels management
- **Technical Debt**: Constants, repository pattern, Testcontainers + factories

**Test Coverage**: 261 tests (174 E2E + 87 unit), 100% passing

### 🚨 **CRITICAL ISSUE IDENTIFIED**
- **Test Database Connection**: Tests writing to live database instead of testcontainer
- **Root Cause**: ENV variable mismatch (`TEST_DB_*` vs `TEST_DATABASE_*`)
- **Priority**: Must fix immediately (high risk)
- **Effort**: 2-4 hours

---

## 🎯 Active Backlog (Priority Order)

### 🔴 CRITICAL PRIORITY

#### FIX-001: Test Database Isolation ⚠️ **CRITICAL**
- **Problem**: E2E tests currently write to live development database instead of testcontainer
- **Root Cause**: `test.config.ts` reads `TEST_DATABASE_*` but global-setup sets `TEST_DB_*`
- **Impact**: Data pollution in development database, potential data loss
- **Fix Required**:
  - Update `src/config/test.config.ts` to prioritize `TEST_DB_*` variables
  - Add validation to block production database names (`omnivore`, `omnivore_prod`)
  - Add safety checks with clear error messages
  - Verify all tests use testcontainer
- **Acceptance Criteria**:
  - All tests run against ephemeral testcontainer
  - Production database names blocked with error
  - No data written to development/production databases
  - All 261 tests still passing
- **Dependencies**: None (critical fix)
- **Effort Estimate**: 2-4 hours
- **Status**: ⚠️ **IDENTIFIED - NEEDS IMMEDIATE FIX**
- **Files**:
  - `packages/api-nest/src/config/test.config.ts` (primary fix)
  - `packages/api-nest/test/setup/global-setup.ts` (verify ENV vars)

---

### 🔴 HIGH PRIORITY

#### ARC-013: Content Extraction & Processing ⭐ **NEXT UP**
- **Problem/Objective**: Complete the save-to-read flow with actual content extraction (currently stubbed)
- **Impact**: Unblocks core user workflow (save article → read article)
- **Current State**:
  - Queue infrastructure ready (ARC-012 at 80%)
  - ContentProcessorService has stub implementation
  - Event system in place
  - SaveUrl mutation working
- **Approach**: Implement real content extraction using Readability.js and related tools

**Tasks**:

**Phase 1: Web Article Extraction** (Days 1-2)
- [ ] Install dependencies:
  - [ ] `@mozilla/readability` - Content extraction
  - [ ] `jsdom` - DOM parsing for Node.js
  - [ ] `dompurify` with jsdom - HTML sanitization
  - [ ] `turndown` - HTML to Markdown conversion (for plain text)
- [ ] Implement ContentFetcherService:
  - [ ] `fetchUrl(url: string): Promise<RawContent>` - HTTP fetch with headers
  - [ ] Handle redirects and SSL certificates
  - [ ] Set proper User-Agent and timeouts
  - [ ] Rate limiting per domain
- [ ] Implement ReadabilityService:
  - [ ] `extractArticle(html: string, url: string): Promise<Article>`
  - [ ] Clean and sanitize HTML
  - [ ] Extract title, author, published date
  - [ ] Extract main content with images
  - [ ] Generate text excerpt/preview
- [ ] Update ContentProcessorService:
  - [ ] Replace stub with real extraction logic
  - [ ] Call ContentFetcherService → ReadabilityService
  - [ ] Update LibraryItem with extracted content
  - [ ] Set state to SUCCEEDED or FAILED
  - [ ] Handle extraction errors gracefully

**Phase 2: Image Processing** (Day 3)
- [ ] Implement ImageProxyService:
  - [ ] Download and cache images
  - [ ] Resize/optimize images
  - [ ] Generate thumbnails
  - [ ] Return CDN/proxy URLs
- [ ] Update content HTML with proxied image URLs
- [ ] Handle image extraction failures gracefully

**Phase 3: Content Enhancements** (Day 4)
- [ ] Add metadata extraction:
  - [ ] OpenGraph tags (og:title, og:description, og:image)
  - [ ] Twitter Card metadata
  - [ ] JSON-LD structured data
  - [ ] Favicon extraction
- [ ] Implement content hash generation (for duplicate detection)
- [ ] Add word count calculation
- [ ] Add reading time estimation

**Phase 4: Testing & Polish** (Day 5)
- [ ] Create E2E tests:
  - [ ] Save URL → extract content → verify in reader
  - [ ] Handle extraction failures
  - [ ] Handle redirects and SSL issues
  - [ ] Verify image proxying
  - [ ] Test metadata extraction
- [ ] Add integration tests for each service
- [ ] Performance testing (extraction time targets)
- [ ] Error handling and user feedback

**Deferred to ARC-014**:
- [ ] PDF content extraction (pdf-parse)
- [ ] RSS feed parsing
- [ ] YouTube video transcripts
- [ ] Twitter thread unrolling

**Acceptance Criteria**:
- [ ] Save URL extracts article title, author, content, images
- [ ] Extracted content displays correctly in reader
- [ ] Images load through proxy/cache
- [ ] Failed extractions show helpful error messages
- [ ] Content hash prevents duplicates
- [ ] E2E test: Save article → read in reader (full flow)
- [ ] Extraction completes in <10 seconds for typical articles
- [ ] All existing tests still pass (261 tests)

**Dependencies**:
- ARC-011 (completed - Save URL mutation)
- ARC-012 (80% - Queue infrastructure ready)

**Effort Estimate**: 4-5 days

**Status**: ⭐ **READY TO START** (highest priority after FIX-001)

**Priority**: 🔴 **CRITICAL** - Completes core save-to-read workflow

---

### 🟡 MEDIUM PRIORITY

#### ARC-009: Frontend Library Feature Parity ⏳ **95% COMPLETE**
- **Problem/Objective**: Achieve full feature parity with legacy library UI
- **Current State**: Core features complete, polish needed
- **Approach**: Complete remaining UI features and polish

**Remaining Tasks**:
- [ ] Advanced filters UI:
  - [ ] Date range picker (saved date, published date)
  - [ ] Content type filter (article, PDF, etc.)
  - [ ] Read status filter
  - [ ] Has highlights filter
- [ ] Library view modes:
  - [ ] Grid view (current default)
  - [ ] List view (compact)
  - [ ] Magazine view (large cards)
  - [ ] View preference persistence
- [ ] Sort options polish:
  - [ ] Add "Reading Progress" sort
  - [ ] Add "Recently Added" sort
  - [ ] Remember last sort preference
- [ ] Keyboard shortcuts:
  - [ ] `j/k` - Navigate items
  - [ ] `a` - Archive item
  - [ ] `e` - Edit labels
  - [ ] `r` - Read/open item
  - [ ] `x` - Select item
  - [ ] `Shift+X` - Select all
  - [ ] `/` - Focus search
- [ ] Import/export (deferred to separate ARC):
  - [ ] Export library to JSON/CSV
  - [ ] Import from Pocket/Instapaper

**Acceptance Criteria**:
- [ ] All filter combinations work correctly
- [ ] View modes toggle and persist preference
- [ ] Keyboard shortcuts functional and documented
- [ ] Advanced filters performance acceptable
- [ ] UI matches design system

**Dependencies**: None (frontend polish)

**Effort Estimate**: 2-3 days

**Status**: 95% complete, polish remaining

**Priority**: 🟡 **MEDIUM** - UX improvement, not blocking

---

#### ARC-010B: Reading Progress & Highlights (Frontend Polish)
- **Problem/Objective**: Polish highlight and reading progress UI/UX
- **Current State**: Backend complete (ARC-010), basic frontend working
- **Approach**: Enhance UI components for better user experience

**Tasks**:
- [ ] Highlight creation UI:
  - [ ] Improve text selection UX
  - [ ] Color picker for highlights
  - [ ] Quick annotation input
  - [ ] Highlight preview before save
- [ ] Highlight sidebar polish:
  - [ ] Group highlights by color
  - [ ] Sort options (position, date, color)
  - [ ] Search/filter highlights
  - [ ] Jump to highlight in text
- [ ] Reading progress UI:
  - [ ] Visual progress bar in reader
  - [ ] Percentage complete indicator
  - [ ] Resume reading from last position
  - [ ] Scroll position persistence
- [ ] Notebook improvements:
  - [ ] Markdown preview
  - [ ] Rich text editor option
  - [ ] Autosave indicator
  - [ ] Version history (future)

**Acceptance Criteria**:
- [ ] Highlighting feels smooth and intuitive
- [ ] Progress bar accurately reflects reading position
- [ ] Notebook autosaves without data loss
- [ ] All highlight colors work correctly
- [ ] Performance acceptable with 100+ highlights

**Dependencies**: ARC-010 (completed - backend)

**Effort Estimate**: 2-3 days

**Status**: Backend complete, frontend basic working

**Priority**: 🟡 **MEDIUM** - Polish, core functionality working

---

### 🟢 LOW PRIORITY (Future Work)

#### ARC-012 Phase 5: Queue Monitoring & Optimization
- **Problem/Objective**: Add monitoring UI and performance optimizations
- **Current State**: Infrastructure complete (80%), monitoring deferred
- **Approach**: Incremental additions

**Remaining Tasks** (Phase 5):
- [ ] Add BullMQ Board UI endpoint (`/admin/queues`)
- [ ] Implement Prometheus metrics export:
  - [ ] Queue depth by queue
  - [ ] Job latency histograms
  - [ ] Success/failure rates
  - [ ] Worker utilization
- [ ] Create AlertManager rules:
  - [ ] Queue backlog threshold
  - [ ] Job failure rate spike
  - [ ] Worker downtime
- [ ] Add worker concurrency auto-adjustment
- [ ] Performance profiling and optimization
- [ ] Load testing: 100+ concurrent jobs

**Acceptance Criteria**:
- [ ] BullMQ Board accessible to admins
- [ ] Metrics exported to Prometheus
- [ ] Alerts fire correctly
- [ ] Load test passes with target throughput

**Dependencies**: ARC-012 Phases 1-4 (complete), ARC-013 (real content processing)

**Effort Estimate**: 1-2 days

**Status**: Infrastructure complete, monitoring deferred

**Priority**: 🟢 **LOW** - Can add incrementally

---

#### ARC-014: Additional Content Types
- **Problem/Objective**: Support PDF, RSS, video content types
- **Approach**: Extend content processing pipeline

**Tasks**:
- [ ] PDF extraction:
  - [ ] Install `pdf-parse` or `pdfjs-dist`
  - [ ] Extract text from PDFs
  - [ ] Generate PDF thumbnails
  - [ ] Handle scanned PDFs (OCR)
- [ ] RSS feed parsing:
  - [ ] Install `rss-parser`
  - [ ] Subscribe to RSS feeds
  - [ ] Auto-import new articles
  - [ ] Feed management UI
- [ ] Video transcripts:
  - [ ] YouTube transcript API
  - [ ] Video metadata extraction
  - [ ] Thumbnail extraction
- [ ] Twitter threads:
  - [ ] Thread unrolling
  - [ ] Author attribution
  - [ ] Media preservation

**Acceptance Criteria**:
- [ ] PDFs extract and display correctly
- [ ] RSS feeds auto-import articles
- [ ] Video content saves with metadata
- [ ] Twitter threads unroll properly

**Dependencies**: ARC-013 (web article extraction)

**Effort Estimate**: 5-7 days

**Status**: Not started

**Priority**: 🟢 **LOW** - After core web articles working

---

#### TD-006 Phase 3-5: Test Conversion & Documentation
- **Problem/Objective**: Convert E2E tests to unit tests (test pyramid inversion fix)
- **Current State**: Infrastructure ready (Phases 1-2 complete)
- **Approach**: Incremental conversion as services are refactored

**Remaining Phases**:
- [ ] **Phase 3**: Convert 80-90 E2E tests to unit tests
  - [ ] Identify tests that should be unit tests
  - [ ] Convert using repository mocks
  - [ ] Update factories for unit test usage
  - [ ] Maintain E2E tests for critical flows
- [ ] **Phase 4**: Update documentation
  - [ ] Create `docs/TESTING.md` guide
  - [ ] Document factory patterns
  - [ ] Add mocking examples
  - [ ] Troubleshooting guide
- [ ] **Phase 5**: Deprecate old utilities
  - [ ] Remove TD-001 seed scripts
  - [ ] Archive manual test DB setup docs
  - [ ] Update CI/CD pipelines

**Target Test Distribution**:
- Current: 87 unit (33%) / 174 E2E (67%) = **Inverted pyramid**
- Target: 220 unit (85%) / 25 integration (10%) / 15 E2E (5%) = **Proper pyramid**

**Acceptance Criteria**:
- [ ] Test pyramid corrected (85% unit, 10% integration, 5% E2E)
- [ ] All tests still passing
- [ ] Documentation complete
- [ ] CI/CD pipeline updated

**Dependencies**: TD-003, TD-006 Phases 1-2 (both complete)

**Effort Estimate**: 5-7 days (can be done incrementally)

**Status**: Infrastructure ready, conversion deferred

**Priority**: 🟢 **LOW** - Technical debt, not blocking features

---

## 📋 Backlog Management Notes

### Completed Items
All completed ARCs (001-008, 010A, 010, 011, 012 partial) and TDs (003, 004, 006 Phases 1-2) have been moved to `unified-migration-backlog-complete.md` for historical reference.

### Next Review
- **When**: After ARC-013 completion
- **Focus**: Evaluate ARC-014 priority, frontend polish items
- **Metrics**: Test coverage, performance benchmarks, user feedback

### Dependencies
```
FIX-001 → [No dependencies, critical fix]
ARC-013 → Requires: ARC-011 ✅, ARC-012 Phase 1-4 ✅
ARC-009 → Can start anytime (frontend only)
ARC-010B → Requires: ARC-010 ✅
ARC-012 Phase 5 → Requires: ARC-013 (real jobs to monitor)
ARC-014 → Requires: ARC-013 ✅
TD-006 Phases 3-5 → Can proceed anytime (incremental)
```

### Success Metrics for Next Milestone
- [ ] FIX-001 complete (test isolation)
- [ ] ARC-013 complete (content extraction working)
- [ ] Full save-to-read flow working end-to-end
- [ ] 280+ tests passing (with new ARC-013 tests)
- [ ] User can: register → login → save article → read extracted content → highlight → annotate

---

**Document Version**: 2.0
**Last Updated**: November 21, 2025
**Managed By**: Development Team
**See Also**: `unified-migration-backlog-complete.md` for completed items
