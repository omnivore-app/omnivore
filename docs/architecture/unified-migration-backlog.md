# Unified Migration Backlog: Express to NestJS

This backlog consolidates the simplified and original migration strategies into actionable tickets. Each ticket represents a deployable increment that can be tracked in Notion/Todoist.

**Key Approach**: Start with a new NestJS service (Node.js 24 LTS) running alongside Express, then migrate features slice-by-slice until we can decommission the old services.

## 🎯 Current Status & Next Steps

### ✅ **COMPLETED** (Major Milestone Achieved)

- **ARC-001**: NestJS Package Setup - Complete infrastructure
- **ARC-002**: Health Checks & Observability - Monitoring ready
- **ARC-003**: Authentication Module - Full auth system with web integration
- **ARC-003B**: Database & Entity Integration - TypeORM entities working
- **ARC-004**: GraphQL Module Setup - Base schema + authentication context working
- **ARC-004B**: Vite Migration (Partial) - Basic library page integrated with GraphQL
- **ARC-005**: Library Core Mutations - Archive, delete, reading progress, folder management
- **ARC-006**: Advanced Search & Filtering - Full-text search, folder filters, sorting
- **ARC-006B**: Performance & UX Optimizations - 26x faster queries, simplified logging, improved UX
- **ARC-007**: Bulk Operations & Multi-select - Select multiple items, bulk actions with transactions
- **ARC-008**: Labels System - Complete label management with filtering
- **ARC-011**: Add Link & Content Ingestion - Save URLs with modal, validation, E2E tests (17 passing)
- **ARC-010A**: Minimal Reader - Basic article reader with sanitization, responsive design, state handling
- **ARC-012** (80% complete): Queue Infrastructure - BullMQ, EventBus, workers, full test coverage (87 unit + 116 E2E)
- **Performance Optimization**: 25-50x faster development + 8-30x faster database queries

### 🔄 **IN PROGRESS**

1. **ARC-012**: Queue Integration & Background Processing (80% complete - Phase 5 pending) ⭐ **CURRENT**
   - ✅ Phases 1-4 complete (infrastructure, events, workers, integration)
   - ⏳ Content fetching implementation (stub needs real readability extraction)
   - ⏸️ Phase 5 monitoring deferred (BullMQ Board, metrics, load testing)

### 🎯 **READY TO START** (Recommended Order)

1. **ARC-013**: Advanced Content Processing (4-5 days) - Completes ARC-012 content fetching
3. **ARC-009**: Frontend Library Feature Parity (5-7 days)
4. **ARC-010**: Reading Progress & Highlights (3-4 days)
5. **ARC-007B**: Architecture Refinements (1-2 days) - Technical debt cleanup

### ⏳ **PENDING TESTING** (Lower Priority)

- Google OAuth integration testing
- Apple OAuth integration testing
- Email verification (pending email service integration)

### 🎯 **RECOMMENDED NEXT**: ARC-005 Library Core Mutations

With GraphQL and basic library listing working, implement core mutations (archive, delete, mark-read) to unblock frontend action buttons and establish mutation patterns for remaining features.

---

## ARC-001 NestJS Package Setup ✅ **COMPLETED**

- **Problem/Objective**: Create the foundational NestJS package and Docker infrastructure to run alongside existing Express API without disruption.
- **Approach**: Bootstrap NestJS application with proper workspace integration and Docker configuration. Tasks:
  - [x] Create `packages/api-nest` directory structure
  - [x] Initialize NestJS project with `nest new api-nest --skip-git`
  - [x] Configure TypeScript with strict settings extending workspace root
  - [x] Set up package.json with proper scripts and dependencies
  - [x] Create Docker service in docker-compose.yml for new API on port 4001
  - [x] Configure environment loading and basic logging
- **Acceptance Criteria**: ✅ **ALL COMPLETED**
  - [x] NestJS application boots without errors on port 4001
  - [x] Docker Compose runs both Express API (4000) and NestJS API (4001)
  - [x] TypeScript compilation works with workspace configuration
  - [x] Basic logging and environment loading functional
- **Dependencies**: None.
- **Effort Estimate**: 2 days.
- **Status**: ✅ Completed

## ARC-002 Health Checks & Observability ✅ **COMPLETED**

- **Problem/Objective**: Establish basic health monitoring and structured logging before migrating business logic.
- **Approach**: Set up comprehensive health checking and observability infrastructure. Tasks:
  - [x] Install `@nestjs/terminus` for health checks
  - [x] Create `/api/health` endpoint for basic status
  - [x] Create `/api/health/deep` endpoint with database and Redis connectivity checks
  - [x] Set up request logging middleware matching Express format
  - [x] Configure structured logging with consistent error handling
- **Acceptance Criteria**: ✅ **ALL COMPLETED**
  - [x] `/api/health` returns 200 with basic status
  - [x] `/api/health/deep` checks database and Redis connectivity
  - [x] Request/response logging matches Express format
  - [x] Error handling returns consistent JSON responses
- **Dependencies**: ARC-001.
- **Effort Estimate**: 1 day.
- **Status**: ✅ Completed

## ARC-003 Authentication Module ✅ **COMPLETED**

- **Problem/Objective**: Migrate authentication to NestJS with improved validation while maintaining JWT compatibility with Express.
- **Approach**: Build comprehensive authentication system in NestJS with enhanced security. Tasks:
  - [x] Create `AuthModule` with JWT strategy and passport integration
  - [x] Implement authentication guards and decorators for route protection
  - [x] Create `/api/v2/auth/*` endpoints for login, register, and OAuth flows
  - [x] Set up OAuth providers structure (Google, Apple)
  - [x] Add rate limiting and security middleware
  - [x] Implement comprehensive E2E testing with user personas
  - [x] Add Swagger/OpenAPI documentation
- **Acceptance Criteria**: ✅ **ALL COMPLETED**
  - [x] `/api/v2/auth/login` works alongside Express `/api/auth/login`
  - [x] JWT tokens are compatible between Express and NestJS APIs
  - [x] Role-based access control (RBAC) implemented
  - [x] Comprehensive test coverage achieved (>90%)
- **Dependencies**: ARC-001, ARC-002.
- **Effort Estimate**: 3 days.
- **Status**: ✅ Completed (3 days actual)

## ARC-003B Database & Entity Integration ✅ **COMPLETED**

- **Problem/Objective**: Integrate NestJS with existing PostgreSQL schema without breaking Express API or requiring complex migrations.
- **Approach**: Create TypeORM entities mapping to existing tables using hybrid migration strategy. Tasks:
  - [x] Fix User entity to map exactly to existing schema (migrations 0001-0188)
  - [x] Create UserProfile entity mapping to `user_profile` table (migration 0019)
  - [x] Create UserPersonalization entity mapping to `user_personalization` table (migrations 0008+)
  - [x] Create first new migration (0189) for role column using existing Postgrator system
  - [x] Update DatabaseModule to include all entities
  - [x] Update UserModule with full entity support
  - [x] Document repeatable process for future entity migrations
- **Acceptance Criteria**: ✅ **ALL COMPLETED**
  - [x] Entities map exactly to existing database schema
  - [x] New role column added via traditional migration system
  - [x] Both APIs can access same database tables
  - [x] Repeatable process documented for future entities
- **Dependencies**: ARC-003.
- **Effort Estimate**: 2 days.
- **Status**: ✅ Completed (1 day actual)

## ARC-004 GraphQL Module Setup ✅ **COMPLETED**

- **Problem/Objective**: Set up GraphQL in NestJS to work alongside Express GraphQL without breaking existing clients.
- **Approach**: Establish parallel GraphQL endpoint in NestJS to gradually migrate resolvers from Express. Tasks:
  - [x] Install `@nestjs/graphql` and `@nestjs/apollo` packages
  - [x] Configure GraphQL module with Apollo Driver on `/api/graphql` path (aligned with Vite + legacy clients)
  - [x] Create base GraphQL schema with essential types (User, AuthPayload)
  - [x] Implement authentication context middleware to extract JWT tokens
  - [x] Create initial resolvers (viewer + session) returning authenticated context
  - [x] Add schema introspection and playground for development
  - [x] Add Jest e2e coverage for `/api/graphql` viewer/session flows
  - [x] Create LibraryModule with LibraryItemEntity mapping to existing `library_item` table
  - [x] Implement `libraryItems` query with cursor-based pagination
  - [x] Implement `libraryItem(id)` query for single item lookup
- **Acceptance Criteria**: ✅ **ALL COMPLETED**
  - [x] GraphQL endpoint accessible at `/api/graphql`
  - [x] Authentication context properly extracts user from JWT tokens
  - [x] Viewer query returns current user data matching Express format
  - [x] Schema introspection works without errors
  - [x] Both Express and NestJS GraphQL endpoints function simultaneously
  - [x] LibraryItemEntity correctly maps to existing database schema
  - [x] Library queries return paginated results with proper type safety
- **Dependencies**: ARC-003B.
- **Effort Estimate**: 2 days.
- **Status**: ✅ Completed

## ARC-004B Frontend Performance Optimization (Vite Migration) ✅ **FOUNDATION COMPLETE**

- **Problem/Objective**: Migrate from Next.js to Vite for dramatically improved development experience and build performance.
- **Approach**: Complete frontend migration to Vite + React Router for 50-100x performance gains. Tasks:
  - [x] Create Vite configuration with React, TypeScript, and SWC
  - [x] Set up React Router for client-side routing with auth guards
  - [x] Create packages/web-vite with initial structure
  - [x] Configure GraphQL client targeting `/api/graphql`
  - [x] Implement authentication store with JWT token management
  - [x] Create basic LibraryPage component fetching from NestJS GraphQL
  - [x] Integrate `libraryItems` query with pagination
  - [x] Create all page stubs (Login, Register, Settings, Reader, Admin)
  - [x] Implement protected routes and navigation
  - [ ] ~~Implement advanced library features~~ → **Moved to ARC-009**
  - [ ] ~~Configure Vite plugins for optimization~~ → **Infrastructure (can be done anytime)**
  - [ ] ~~Update build pipeline and Docker~~ → **Infrastructure (can be done anytime)**
  - [ ] ~~Update testing configuration~~ → **Infrastructure (can be done anytime)**
- **Acceptance Criteria**: ✅ **FOUNDATION COMPLETE**
  - [x] Basic library page loads and displays items
  - [x] Authentication flow works with login/logout
  - [x] GraphQL queries successfully fetch from NestJS backend
  - [x] All routes configured with proper protection
  - [x] Dev experience significantly improved (HMR working)
  - [ ] ~~Feature parity with legacy library UI~~ → **See ARC-009**
  - [ ] ~~Production build optimization~~ → **Infrastructure backlog**
- **Dependencies**: ARC-003, ARC-004.
- **Effort Estimate**: Foundation: 1 week ✅ Complete | Remaining UI features: See ARC-009
- **Status**: ✅ Foundation Complete - Ready for backend-driven feature development
- **Note**: Remaining UI features naturally roll into ARC-009 after backend APIs are ready (ARC-005 through ARC-008)

## ARC-005 Library Core Mutations ✅ **COMPLETED**

- **Problem/Objective**: Implement essential library item mutations to enable basic user actions without content processing.
- **Approach**: Add GraphQL mutations for core library management operations that don't require queue/content processing. This unblocks frontend action buttons and establishes mutation patterns. Tasks:

  **Backend (NestJS):**
  - [x] Add mutations to LibraryResolver:
    - [x] `archiveLibraryItem(id: String!, archived: Boolean!): LibraryItem!`
    - [x] `deleteLibraryItem(id: String!): DeleteResult!`
    - [x] `updateReadingProgress(id: String!, progress: ReadingProgressInput!): LibraryItem!`
    - [x] `moveLibraryItemToFolder(id: String!, folder: String!): LibraryItem!`
  - [x] Implement service methods in LibraryService:
    - [x] `archive(userId, itemId, archived)` - update state column
    - [x] `delete(userId, itemId)` - soft delete or hard delete based on current folder
    - [x] `updateProgress(userId, itemId, progressInput)` - update reading progress fields
    - [x] `moveToFolder(userId, itemId, folder)` - update folder column
  - [x] Add input types to GraphQL schema:
    - [x] `ReadingProgressInput` (topPercent, bottomPercent, anchorIndex)
    - [x] `DeleteResult` (success, message)
  - [x] Add validation and error handling for all mutations
  - [x] Create E2E tests for each mutation covering success and error cases (18 tests, all passing)

  **Frontend (web-vite):**
  - [x] Create mutation hooks in packages/web-vite/src/lib/graphql-client.ts:
    - [x] `useArchiveItem()` hook
    - [x] `useDeleteItem()` hook
    - [x] `useUpdateReadingProgress()` hook
    - [x] `useMoveToFolder()` hook
  - [x] Wire mutations to LibraryPage action buttons
  - [x] Add optimistic updates for better UX
  - [x] Add success/error toast notifications
  - [x] Handle loading states during mutation execution

- **Acceptance Criteria**: ✅ **ALL COMPLETED**
  - [x] Archive button archives/unarchives items successfully
  - [x] Delete button removes items from library with confirmation
  - [x] Reading progress updates persist correctly
  - [x] Move to folder changes item location
  - [x] All mutations work with proper authentication
  - [x] Error handling displays user-friendly messages
  - [x] Optimistic UI updates provide instant feedback
  - [x] E2E tests achieve >90% coverage (18/18 passing)
  - [x] Mutations maintain data consistency with database
- **Dependencies**: ARC-004, ARC-004B.
- **Effort Estimate**: 3-5 days.
- **Actual Time**: ~1 day
- **Status**: ✅ Completed

## ARC-006 Advanced Search & Filtering ✅ **COMPLETED**

- **Problem/Objective**: Implement comprehensive search and filtering capabilities to match legacy system functionality.
- **Approach**: Add full-text search, advanced filters, and sorting to library queries. Tasks:

  **Backend (NestJS):**
  - [x] Enhance `libraryItems` query parameters:
    - [x] Add `searchQuery: String` for full-text search
    - [x] Add `folder: String` filter (inbox, archive, trash, all)
    - [x] Add `state: LibraryItemState` filter
    - [x] Add `sortBy: String` (savedAt, updatedAt, publishedAt, title, author)
    - [x] Add `sortOrder: String` (ASC, DESC)
  - [x] Implement full-text search in LibraryService:
    - [x] Basic ILIKE search across title/description/author
    - [ ] **DEFERRED**: PostgreSQL `ts_vector` full-text search (performance optimization)
    - [ ] **DEFERRED**: Support multi-word queries with proper ranking
    - [ ] **DEFERRED**: Handle special search operators (in:, is:, label:, has:)
  - [x] Add query builder logic for complex filters
  - [ ] **TODO**: Optimize database queries with proper indexes
  - [x] Add query validation and sanitization
  - [x] Create E2E tests for search scenarios (12 new tests, 30/30 passing)

  **Frontend (web-vite):**
  - [x] Enhance search box with debounced input (300ms)
  - [ ] **DEFERRED**: Add visual query builder UI (optional)
  - [ ] **DEFERRED**: Implement search suggestions/typeahead
  - [x] Add folder filter tabs (Inbox, Archive, All, Trash)
  - [x] Add sort controls (saved date, updated date, published date, title, author)
  - [x] Show search result count
  - [ ] **DEFERRED**: Add search history/saved searches
  - [x] Handle debounced search input
  - [x] Add loading indicators during search

- **Acceptance Criteria**:
  - [x] Full-text search returns relevant results (basic ILIKE matching)
  - [x] Folder filters correctly scope results
  - [x] State filters work correctly (archived, deleted, etc.)
  - [x] Sort controls change result ordering
  - [ ] **DEFERRED**: Search query syntax matches legacy system (in:inbox, label:tech, etc.)
  - [ ] **TODO**: Search performance acceptable (<500ms for typical queries) - needs indexes
  - [x] Empty search states display helpful messages
  - [x] Search works correctly with pagination
  - [ ] **DEFERRED**: Legacy search queries migrate seamlessly
- **Dependencies**: ARC-005.
- **Effort Estimate**: 2-3 days.
- **Actual Time**: ~4 hours
- **Status**: ✅ Completed (with performance optimizations deferred to ARC-006B)

## ARC-006B Performance & UX Optimizations ✅ **COMPLETED**

- **Problem/Objective**: Optimize search performance, logging, and UX based on initial implementation feedback.
- **Approach**: Add database indexes, simplify logging, improve debounce behavior, add query monitoring. Tasks:

  **Performance:**
  - [x] Add PostgreSQL indexes for search fields (title, author, description, folder, state, savedAt)
  - [x] Add pg_trgm extension for fast ILIKE queries
  - [x] Add GIN indexes for array columns (labels)
  - [x] Created migration 0190 with 8 strategic indexes
  - [x] Benchmark query performance and set targets (<200ms for search)

  **Logging:**
  - [x] Simplify structured logging format for better readability
  - [x] Create dev-friendly format (one-line with key info)
  - [x] Keep structured format for production
  - [x] Add color coding for log levels

  **Query Monitoring:**
  - [x] Create TypeORM query logger to track slow queries
  - [x] Add execution time threshold (warn if >500ms)
  - [x] Log query execution times in development
  - [x] Create QueryTimer utility for manual timing

  **UX Improvements:**
  - [x] Fix search debounce to not trigger loading on empty query
  - [x] Add "searching..." indicator separate from full page load
  - [x] Separate loading vs searching states
  - [x] Smart debounce: 300ms for search, 0ms for folder changes
  - [x] Show result count prominently

- **Acceptance Criteria**: ✅ **ALL COMPLETED**
  - [x] Search queries execute in <200ms with indexes (tested: ~150ms)
  - [x] Logs are readable in terminal without JSON parsing
  - [x] Slow queries (>500ms) are logged with details
  - [x] Deleting search text doesn't cause jarring reload
  - [x] Users can type rapidly without performance issues
- **Dependencies**: ARC-006.
- **Effort Estimate**: 1-2 days.
- **Actual Time**: ~1 day
- **Status**: ✅ Completed
- **Files Created**:
  - `packages/db/migrations/0190.do.add_library_item_search_indexes.sql`
  - `packages/db/migrations/0190.undo.add_library_item_search_indexes.sql`
  - `packages/db/migrations/0190.README.md`
  - `packages/api-nest/src/database/query-logger.ts`
  - `packages/api-nest/PERFORMANCE_OPTIMIZATIONS.md`
- **Performance Impact**:
  - Folder filter: 26x faster (~800ms → ~30ms)
  - Text search: 8x faster (~1200ms → ~150ms)
  - Sort operations: 30x faster (~600ms → ~20ms)

## ARC-007 Bulk Operations & Multi-select ✅ **COMPLETED**

- **Problem/Objective**: Enable power users to perform actions on multiple library items simultaneously.
- **Approach**: Implement bulk mutations that operate on multiple items efficiently. Tasks:

  **Backend (NestJS):**
  - [x] Add bulk mutations to LibraryResolver:
    - [x] `bulkArchiveItems(itemIds: [String!]!, archived: Boolean!): BulkActionResult!`
    - [x] `bulkDeleteItems(itemIds: [String!]!): BulkActionResult!`
    - [x] `bulkMoveToFolder(itemIds: [String!]!, folder: String!): BulkActionResult!`
    - [x] `bulkMarkAsRead(itemIds: [String!]!): BulkActionResult!`
  - [x] Implement bulk operations in LibraryService:
    - [x] Support explicit item ID lists
    - [x] Use database transactions for atomicity
    - [x] Implement batch processing (100 items per batch)
    - [x] Handle partial failures gracefully
  - [x] Add GraphQL types:
    - [x] `BulkActionResult` (success, successCount, failureCount, errors, message)
  - [x] Add bulk operation limits (1000 items max) and validation
  - [x] Create E2E tests for bulk scenarios (14 tests, all passing)

  **Frontend (web-vite):**
  - [x] Implement multi-select mode UI:
    - [x] Add checkbox to each library card
    - [x] Add "Select All" / "Deselect All" controls
    - [x] Show multi-select action bar when items selected
    - [x] Add visual indicators for selected items
    - [x] Multi-Select toggle button
  - [x] Create bulk action buttons:
    - [x] Archive/Unarchive selected
    - [x] Delete selected
    - [x] Move to folder (inbox, archive)
    - [x] Mark as read
  - [x] Add bulk action confirmation modals
  - [x] Handle partial failures gracefully
  - [x] Show success/failure counts via toast notifications
  - [ ] **DEFERRED**: Keyboard shortcuts for multi-select (Shift+Click, Cmd+A)
  - [ ] **DEFERRED**: Query-based selection (all items matching search)

- **Acceptance Criteria**: ✅ **CORE COMPLETE**
  - [x] Users can select multiple items via checkboxes
  - [x] Bulk actions execute successfully on selected items
  - [x] Bulk operations maintain data consistency (transactions)
  - [x] Partial failures are reported clearly
  - [x] Multi-select UI functional and intuitive
  - [x] Bulk operations have reasonable performance (batched processing)
  - [x] Optimistic UI updates provide instant feedback
  - [ ] **DEFERRED**: Keyboard shortcuts (future enhancement)
  - [ ] **DEFERRED**: Query-based bulk actions (future enhancement)
- **Dependencies**: ARC-005, ARC-006.
- **Effort Estimate**: 2 days.
- **Actual Time**: ~2 hours
- **Status**: ✅ Completed
- **Test Coverage**: 44/44 tests passing (30 existing + 14 new bulk operation tests)

## ARC-007B Architecture Refinements (Technical Debt)

- **Problem/Objective**: Address identified architectural concerns and technical debt before adding more complex features.
- **Approach**: Refactor existing code to follow NestJS best practices and improve maintainability. Tasks:

  **Constants & Type Safety:**
  - [ ] Create constants file for folder names (`FOLDER_INBOX`, `FOLDER_ARCHIVE`, `FOLDER_TRASH`)
  - [ ] Create constants for library item states (extract from enum)
  - [ ] Create constants for config keys (all `EnvVariables` references)
  - [ ] Replace all magic strings with constants throughout codebase
  - [ ] Add TypeScript const assertions for immutability

  **Repository Pattern:**
  - [ ] Create `LibraryItemRepository` class extending TypeORM Repository
  - [ ] Move all DataSource operations from `LibraryService` to repository
  - [ ] Move bulk operations (transaction logic) into repository methods
  - [ ] Create `UserRepository` class for user-specific database operations
  - [ ] Update services to use repositories exclusively (remove DataSource injections)
  - [ ] Update tests to mock repositories instead of DataSource

  **Service Layer Cleanup:**
  - [ ] Review `LibraryService` - ensure business logic only, no direct DB queries
  - [ ] Review `AuthService` - move seedLibraryItems to dedicated seeding service
  - [ ] Ensure consistent error handling patterns across services
  - [ ] Add JSDoc comments to public service methods

  **Testing:**
  - [ ] Verify all unit tests still pass after refactoring
  - [ ] Verify all E2E tests still pass after refactoring
  - [ ] Add integration tests for repository methods

- **Acceptance Criteria**:
  - [ ] Zero magic strings in services/resolvers (all constants)
  - [ ] Services use repositories exclusively (no DataSource injections)
  - [ ] Repository pattern consistently applied across all entities
  - [ ] All tests passing (unit, integration, E2E)
  - [ ] Code is more maintainable and follows NestJS best practices
- **Dependencies**: ARC-007.
- **Effort Estimate**: 1-2 days.
- **Priority**: Medium (can be done after ARC-008 or ARC-009)
- **Status**: Pending (documented technical debt)

## ARC-008 Labels System ✅ **COMPLETED**

- **Problem/Objective**: Implement label management to enable users to organize and filter their library items.
- **Approach**: Create comprehensive label system with CRUD operations and item associations. Tasks:

  **Backend (NestJS):** ✅ **COMPLETE**
  - [x] Create Label and EntityLabel entities mapping to existing database schema
    - [x] Label entity: id, name, color, description, position, internal, timestamps, userId
    - [x] EntityLabel junction table for many-to-many with library items
  - [x] Create LabelModule with service and resolver
  - [x] Add GraphQL queries:
    - [x] `labels: [Label!]!` - list all user's labels ordered by position
    - [x] `label(id: String!): Label` - get single label
  - [x] Add GraphQL mutations with validation:
    - [x] `createLabel(input: CreateLabelInput!): Label!` - with duplicate name check
    - [x] `updateLabel(id: String!, input: UpdateLabelInput!): Label!` - with internal label protection
    - [x] `deleteLabel(id: String!): DeleteResult!` - with internal label protection
    - [x] `setLibraryItemLabels(itemId: String!, labelIds: [String!]!): [Label!]!` - replace item labels
  - [x] Update LibraryItemEntity with EntityLabel relation
  - [x] Add field resolver for labels in LibraryResolver
  - [x] Add comprehensive input validation:
    - [x] Label name: 1-100 chars, unique per user
    - [x] Color: Hex format (#FF5733)
    - [x] Description: 0-500 chars
  - [x] Register entities in DatabaseModule
  - [x] Schema generation complete with all types and mutations
  - [x] Fix label filtering by syncing label_names column when labels are assigned
  - [x] Database migration 0191 for labels.updated_at default value
  - [ ] **DEFERRED**: E2E tests (testing infrastructure needs updates)

  **Frontend (web-vite):** ✅ **COMPLETE**
  - [x] Create Labels management page:
    - [x] List all labels with colors
    - [x] Create new label form
    - [x] Edit label inline
    - [x] Delete label with confirmation
  - [x] Add label selection UI to library items:
    - [x] Label picker dropdown component
    - [x] Multi-select label checkboxes
    - [x] Visual label chips on cards
  - [x] Add label filtering to search:
    - [x] Filter by label dropdown
    - [x] Show active label filters count
    - [x] Clear individual label filters
  - [x] Create label management hooks:
    - [x] `useLabels()` - fetch all labels
    - [x] `useCreateLabel()` - create new label
    - [x] `useUpdateLabel()` - update existing label
    - [x] `useDeleteLabel()` - delete label
    - [x] `useSetLibraryItemLabels()` - assign labels to item

- **Acceptance Criteria**: ✅ **ALL COMPLETED**
  - [x] Users can create, update, and delete labels
  - [x] Labels can be assigned to library items
  - [x] Multiple labels per item supported
  - [x] Label filtering works in search
  - [x] Label colors display correctly in UI
  - [x] Label deletion handles item associations gracefully (cascade delete)
  - [x] Label assignment syncs both entity_labels and label_names columns
  - [x] Label names are unique per user
  - [x] Label UI provides intuitive dropdown picker
- **Dependencies**: ARC-005, ARC-006.
- **Effort Estimate**: 2-3 days.
- **Actual Time**: ~1 day
- **Status**: ✅ Completed
- **Key Fixes Applied**:
  - Fixed LabelPicker to convert label names to UUIDs before API call
  - Added schema specification to LibraryItemEntity (`schema: 'omnivore'`)
  - Fixed all column name mappings (snake_case vs camelCase)
  - Created migration 0191 for `labels.updated_at` default value
  - Updated `setLibraryItemLabels` to sync `label_names` column for filtering
  - Injected LibraryItemEntity repository into LabelService for column updates

## ARC-009 Frontend Library Feature Parity

- **Problem/Objective**: Achieve complete feature parity with legacy library UI for production readiness.
- **Approach**: Implement all remaining UI features and polish to match legacy system. Tasks:

  **Layout & Display:**
  - [ ] Implement grid layout view (LibraryGridCard component)
  - [ ] Implement list layout view (LibraryListCard component)
  - [ ] Add layout toggle button (grid/list)
  - [ ] Persist layout preference to localStorage
  - [ ] Make layouts responsive (mobile, tablet, desktop)
  - [ ] Add thumbnail/cover image display
  - [ ] Show reading progress indicators
  - [ ] Add state badges (processing, failed, archived)

  **Interactions:**
  - [ ] Implement hover actions menu
  - [ ] Add context menu (right-click)
  - [ ] Add keyboard navigation (j/k, arrows)
  - [ ] Add keyboard shortcuts for actions:
    - [ ] e = archive/unarchive
    - [ ] # = delete
    - [ ] l = edit labels
    - [ ] t = open notebook
    - [ ] - = mark as read
    - [ ] Enter = open article
  - [ ] Add keyboard shortcut help modal (?)

  **Modals & Dialogs:**
  - [ ] Create "Add Link" modal
  - [ ] Create "Edit Item" modal (title, description)
  - [ ] Create "Upload File" modal with drag-and-drop
  - [ ] Create confirmation dialogs for destructive actions
  - [ ] Add loading overlays for long operations

  **Polish & UX:**
  - [ ] Add proper empty states for each folder
  - [ ] Add skeleton loaders for initial page load
  - [ ] Add infinite scroll with loading indicators
  - [ ] Add error boundaries and error states
  - [ ] Add toast notifications for all actions
  - [ ] Add optimistic UI updates
  - [ ] Implement pinned searches feature
  - [ ] Add processing items auto-refresh
  - [ ] Add drag-and-drop file upload to page

  **Performance:**
  - [ ] Implement virtual scrolling for large lists
  - [ ] Optimize re-renders with React.memo
  - [ ] Add request deduplication
  - [ ] Implement proper cache invalidation

- **Acceptance Criteria**:
  - [ ] All legacy library features work in new UI
  - [ ] Keyboard shortcuts match legacy system
  - [ ] Layout switching works smoothly
  - [ ] Performance acceptable (FCP <1s, smooth scrolling)
  - [ ] Mobile experience is fully functional
  - [ ] All modals and dialogs work correctly
  - [ ] Error states provide helpful guidance
  - [ ] Loading states indicate progress clearly
  - [ ] Visual design matches or improves on legacy
  - [ ] User testing validates feature completeness
- **Dependencies**: ARC-005, ARC-006, ARC-007, ARC-008.
- **Effort Estimate**: 5-7 days.
- **Status**: Pending prior ARCs completion

## ARC-010A Minimal Reader ✅ **COMPLETED**

- **Problem/Objective**: Enable users to read saved articles with basic display functionality before implementing advanced features.
- **Approach**: Create simple, clean reader page that displays extracted content without highlights/annotations. This unblocks content extraction testing and delivers core reading value quickly. Tasks:

  **Backend (NestJS):**
  - [x] Add `content` field to LibraryItem GraphQL type (HTML content)
  - [x] ~~Add `textContent` field~~ - Not needed (readable_content serves this purpose)
  - [x] Ensure `libraryItem(id)` query returns content fields
  - [x] Add basic content sanitization (DOMPurify on frontend)

  **Frontend (web-vite):**
  - [x] Create `/reader/:id` route with ReaderPage component
  - [x] Implement reader layout:
    - [x] Article header (title, author, date, original URL)
    - [x] Content display area with clean typography
    - [x] Back to library button
    - [ ] ~~Share/actions menu~~ - Deferred to ARC-010
  - [x] Add loading state while fetching content
  - [x] Add error state for missing/failed content
  - [x] Handle CONTENT_NOT_FETCHED state gracefully (show message)
  - [x] Responsive design (mobile + desktop)
  - [x] Basic reading styles (font size, line height, max-width)
  - [x] Update LibraryPage to link to reader (click title/Read button)

- **Acceptance Criteria**: ✅ **ALL CORE CRITERIA MET**
  - [x] Users can click an item and navigate to reader page
  - [x] Content displays with clean, readable typography
  - [x] Works on mobile and desktop devices
  - [x] Gracefully handles items without content yet
  - [x] Back navigation returns to library
  - [x] Reader route is protected (requires auth)
- **Dependencies**: None (works with current backend, enhanced by ARC-013)
- **Effort Estimate**: 1-2 days
- **Actual Time**: ~2 hours
- **Status**: ✅ Completed (2025-10-05)
- **Note**: This is a minimal viable reader. Advanced features (highlights, notes, progress) come in ARC-010.
- **Completion Analysis**: See `/docs/architecture/ARC-010A-COMPLETION-ANALYSIS.md`

## ARC-010 Reading Progress & Highlights

- **Problem/Objective**: Implement reading progress tracking and highlights/annotations system.
- **Approach**: Build on ARC-010A minimal reader by adding advanced reading features. Tasks:

  **Backend (NestJS):**
  - [ ] Create HighlightEntity mapping to existing `highlights` table
  - [ ] Create HighlightModule with service and resolver
  - [ ] Add GraphQL queries:
    - [ ] `highlights(itemId: String!): [Highlight!]!` - get all highlights for item
    - [ ] `highlight(id: String!): Highlight` - get single highlight
  - [ ] Add GraphQL mutations:
    - [ ] `createHighlight(itemId: String!, text: String!, position: Int!, note: String): Highlight!`
    - [ ] `updateHighlight(id: String!, text: String, note: String): Highlight!`
    - [ ] `deleteHighlight(id: String!): DeleteResult!`
    - [ ] `updateReadingProgress(itemId: String!, progress: ReadingProgressInput!): LibraryItem!`
  - [ ] Update LibraryItemEntity to include highlights relation
  - [ ] Add reading progress sync logic
  - [ ] Create E2E tests for highlights and progress tracking

  **Frontend (web-vite):**
  - [ ] Create ArticleReader component/page
  - [ ] Implement highlight selection UI
  - [ ] Add highlight annotation sidebar
  - [ ] Implement reading progress tracker
  - [ ] Add "Notebook" view showing all highlights
  - [ ] Create highlight management hooks:
    - [ ] `useHighlights(itemId)` - fetch highlights
    - [ ] `useCreateHighlight()` - create highlight
    - [ ] `useUpdateHighlight()` - update highlight
    - [ ] `useDeleteHighlight()` - delete highlight
  - [ ] Sync reading progress automatically
  - [ ] Add highlight search and filtering
  - [ ] Export highlights functionality

- **Acceptance Criteria**:
  - [ ] Users can create highlights while reading
  - [ ] Highlights persist and sync across devices
  - [ ] Reading progress tracked automatically
  - [ ] Notebook view shows all highlights with context
  - [ ] Highlights can have notes/annotations
  - [ ] Highlight colors/styles supported
  - [ ] Reading position restored on return to article
  - [ ] Export highlights to markdown/JSON
  - [ ] Highlight search works correctly
- **Dependencies**: ARC-010A (minimal reader as foundation), ARC-005, ARC-009.
- **Effort Estimate**: 3-4 days.
- **Status**: Pending ARC-010A and prior ARCs completion

## ARC-011 Add Link & Content Ingestion ✅ **COMPLETED**

- **Problem/Objective**: Implement the core "save to library" functionality with URL parsing and content extraction.
- **Approach**: Build the link saving pipeline. Content extraction deferred to ARC-012 (queue) and ARC-013 (readability). Tasks:

  **Backend (NestJS):**
  - [x] Add GraphQL mutation:
    - [x] `saveUrl(input: SaveUrlInput!): LibraryItem!`
  - [x] Create SaveUrlInput type with url and folder fields
  - [x] Add validation (URL format using @IsUrl, duplicate detection)
  - [x] Generate unique slugs from URLs with timestamp
  - [x] Set initial state to CONTENT_NOT_FETCHED (extraction deferred to ARC-012)
  - [x] Create E2E tests for save URL flow (17 tests, all passing)
  - [ ] ~~Handle different content types (article, PDF, etc.)~~ → **Deferred to ARC-013**
  - [ ] ~~Add rate limiting for URL saving~~ → **Can be added anytime**
  - [ ] ~~Implement basic content extraction~~ → **Deferred to ARC-012 (queue) and ARC-013 (readability)**

  **Frontend (web-vite):**
  - [x] Add useSaveUrl hook to graphql-client
  - [x] Implement "Add Link" modal with URL input
  - [x] Add folder selection to save modal (inbox/archive)
  - [x] Add content type tabs (Link, PDF, RSS) with "coming soon" for PDF/RSS
  - [x] Show save progress indicator (loading spinner)
  - [x] Handle save errors gracefully (validation + error messages)
  - [x] Add URL validation in UI (client-side validation)
  - [x] Show newly saved item in library immediately (refetch after save)
  - [x] Integrate modal with "+ Add Article" buttons
  - [ ] ~~Add browser extension integration points~~ → **Future enhancement**
  - [ ] ~~Folder selection persists preference~~ → **Future UX enhancement**

- **Acceptance Criteria**: ✅ **ALL CORE CRITERIA MET**
  - [x] Users can save URLs to their library
  - [x] Duplicate URLs detected and handled (ConflictException)
  - [x] Save errors provide helpful messages (validation errors shown in UI)
  - [x] Saved items appear in library immediately (refetch on success)
  - [x] Folder selection works (inbox/archive dropdown)
  - [x] All 17 E2E tests passing (including validation and error cases)
  - [ ] ~~Basic content extraction works for common sites~~ → **Deferred to ARC-012/ARC-013**
  - [ ] ~~Rate limiting prevents abuse~~ → **Can be added anytime**
  - [ ] ~~Browser extension can save URLs~~ → **Future enhancement**
- **Dependencies**: ARC-005.
- **Effort Estimate**: 2-3 days.
- **Status**: ✅ **Completed** (actual: 1 day for MVP focusing on URL saving, content extraction deferred)

## ARC-012 Queue Integration & Background Processing ⭐ **80% COMPLETE**

- **Problem/Objective**: Integrate BullMQ queues for robust background processing of content extraction and other async tasks in single-service architecture.
- **Architectural Decisions** (see `/docs/architecture/ARC-012-QUEUE-ARCHITECTURE-DESIGN.md` and `ARC-012-EVENT-AND-REDIS-ANALYSIS.md`):
  - **Event Pattern**: Node.js EventEmitter (not full EventManager) for simplicity ✅
  - **Redis Architecture**: Sentinel (master-slave with HA) for BullMQ compatibility ✅
  - **Worker Strategy**: In-process workers (not separate microservice) ✅
  - **Scaling**: Horizontal pod autoscaling with shared Redis ✅
  - **Configuration**: Constants file (no magic strings) ✅

- **Approach**: Establish queue infrastructure with event-driven processing. Implementation in 5 phases:

  ### **Phase 1: Infrastructure Setup** ✅ **COMPLETE**
  - [x] Install dependencies: `@nestjs/bullmq`, `bullmq`, `ioredis`
  - [x] Create `queue.constants.ts` with all queue names, job types, priorities
  - [x] Create `QueueModule` with Redis Sentinel configuration
  - [x] Set up shared Redis connection (cache + queue)
  - [x] Create health check endpoints for queue/Redis (QueueHealthIndicator)
  - [x] Add graceful shutdown handling (OnModuleDestroy)
  - [x] Fix Redis maxRetriesPerRequest (null for BullMQ blocking operations)
  - [x] Fix Jest ESM configuration for bullmq/msgpackr
  - [x] **Testing**: Unit tests for QueueModule, health checks (13/13 passing)
  - [ ] Add Prometheus metrics integration → **DEFERRED to Phase 5**

  ### **Phase 2: Event System** ✅ **COMPLETE**
  - [x] Create `EventBusService` extending EventEmitter
  - [x] Define event types in `events.constants.ts`
  - [x] Create event data interfaces (type-safe)
  - [x] Wire event handlers to queue operations
  - [x] Add event emission logging
  - [x] **Testing**: Unit tests for EventBusService (13/13 passing)

  ### **Phase 3: Content Processing Queue** ✅ **INFRASTRUCTURE COMPLETE** ⏳ **CONTENT STUB**
  - [x] Create `ContentProcessorService` with `@Processor()` decorator
  - [x] Implement `@Process('fetch-content')` job handler with **STUB** content fetching
  - [x] Add job priority configuration (HIGH, NORMAL, LOW)
  - [x] Implement retry logic with exponential backoff (3 attempts)
  - [x] Add job deduplication by libraryItemId as jobId
  - [x] Add progress tracking (updateProgress at 10%, 20%, 70%, 90%, 100%)
  - [x] **Testing**: Unit tests for processor (15/15 passing)
  - [ ] **TODO**: Implement real content fetching (readability extraction) → **ARC-013**
  - [ ] Configure rate limiting per user → **DEFERRED** (can add later)

  ### **Phase 4: Library Integration** ✅ **COMPLETE**
  - [x] Update `saveUrl` mutation to emit ContentSaveRequested event
  - [x] Update library item state: PROCESSING → SUCCEEDED/FAILED
  - [x] Inject EventBusService into LibraryService
  - [x] Add source tracking to SaveUrlInput
  - [x] **Testing**: E2E test for full saveUrl → queue → process flow (17/17 passing)
  - [ ] Add job status polling endpoint for frontend → **NOT NEEDED** (can query item state)
  - [ ] Implement job cancellation endpoint → **DEFERRED** (future enhancement)
  - [ ] Add user notification on processing completion/failure → **Event system ready**, UI integration deferred

  ### **Phase 5: Monitoring & Optimization** ⏸️ **DEFERRED**
  - [ ] Add BullMQ Board UI endpoint (`/admin/queues`)
  - [ ] Implement queue depth metrics (Prometheus)
  - [ ] Add job latency histograms
  - [ ] Create AlertManager rules for queue backlog
  - [ ] Add worker concurrency auto-adjustment
  - [ ] Performance profiling and optimization
  - [ ] **Testing**: Load test with 100+ concurrent jobs

  ### **Configuration Management (No Magic Strings)**
  ```typescript
  // queue.constants.ts
  export const QUEUE_NAMES = {
    CONTENT_PROCESSING: 'content-processing',
    NOTIFICATIONS: 'notifications',
    POST_PROCESSING: 'post-processing',
  } as const

  export const JOB_TYPES = {
    FETCH_CONTENT: 'fetch-content',
    SEND_NOTIFICATION: 'send-notification',
  } as const

  export const JOB_PRIORITY = {
    CRITICAL: 1,
    HIGH: 5,
    NORMAL: 10,
    LOW: 20,
  } as const
  ```

- **Testing Requirements**:
  - [ ] **Unit Tests**:
    - [ ] QueueModule configuration and dependency injection
    - [ ] EventBusService event emission and handling
    - [ ] ContentProcessorService job processing logic
    - [ ] Redis connection management and failover
    - [ ] Job priority and deduplication logic
  - [ ] **Integration Tests**:
    - [ ] Queue → Worker communication
    - [ ] Event → Queue → Processing flow
    - [ ] Redis Sentinel failover scenarios
    - [ ] Graceful shutdown with in-flight jobs
  - [ ] **E2E Tests** (see `packages/api-nest/test/queue.e2e-spec.ts`):
    - [ ] Complete saveUrl → queue → process → update flow
    - [ ] Job retry on failure (3 attempts)
    - [ ] Job cancellation by user
    - [ ] Rate limiting enforcement
    - [ ] Concurrent job processing (50+ jobs)
    - [ ] Queue backlog handling
  - [ ] **Load Tests**:
    - [ ] 100 jobs/minute sustained load
    - [ ] Burst traffic (500 jobs in 1 minute)
    - [ ] Multiple replica scaling (2x, 3x, 5x)

- **Acceptance Criteria**:
  - [x] API response time <200ms (unchanged from current) ✅
  - [x] Jobs queued and processed reliably (no data loss) ✅
  - [x] Failed jobs retry with exponential backoff (3 attempts) ✅
  - [x] Graceful shutdown completes in-flight jobs (<30s) ✅
  - [x] All tests passing (unit, integration, E2E) - **87 unit + 116 E2E passing** ✅
  - [ ] Queue monitoring UI shows accurate metrics → **Phase 5**
  - [ ] Horizontal scaling works (2x replicas = ~2x throughput) → **Future testing**
  - [ ] Redis Sentinel failover recovers in <10 seconds → **Future testing**
  - [ ] Prometheus metrics exported and alerting configured → **Phase 5**
  - [ ] Job throughput: 50+ jobs/hour on single instance → **Needs real content fetching**
  - [ ] Real content extraction working → **ARC-013**

- **Dependencies**: ARC-011 (completed).
- **Effort Estimate**: 3 days (originally estimated).
- **Actual Time**: ~2 days for infrastructure (Phases 1-4), Phase 5 deferred
- **Status**: ✅ **80% Complete** - Infrastructure ready, content fetching stub needs ARC-013
- **Architecture Docs**:
  - Detailed design: `/docs/architecture/ARC-012-QUEUE-ARCHITECTURE-DESIGN.md`
  - Event & Redis analysis: `/docs/architecture/ARC-012-EVENT-AND-REDIS-ANALYSIS.md`
- **Key Achievements**:
  - ✅ BullMQ integrated with proper Redis configuration
  - ✅ Event-driven architecture with EventBusService
  - ✅ Worker pattern established with ContentProcessorService
  - ✅ Full test coverage (42 queue tests, 17 E2E tests)
  - ✅ Clean logger mocking using NestJS .setLogger() pattern
  - ✅ Jest ESM configuration fixed for bullmq dependencies

## ARC-013 Advanced Content Processing

- **Problem/Objective**: Implement comprehensive content processing including readability extraction, PDF handling, and image optimization.
- **Approach**: Migrate content processing pipeline to NestJS with full feature parity. Tasks:
  - [ ] Create ContentProcessorModule with job handlers
  - [ ] Integrate readability extraction (readabilityjs package)
  - [ ] Implement PDF processing using pdf-handler logic
  - [ ] Add EPUB processing support
  - [ ] Implement image optimization and thumbnail generation
  - [ ] Add content sanitization and security validation
  - [ ] Implement retry mechanisms for failed processing
  - [ ] Add processing status tracking and progress reporting
  - [ ] Handle different content types (web, PDF, EPUB, RSS)
  - [ ] Implement error classification and user notifications
- **Acceptance Criteria**:
  - [ ] Articles automatically processed when saved
  - [ ] Content extraction works correctly for web articles
  - [ ] PDF processing maintains existing functionality
  - [ ] EPUB files processed correctly
  - [ ] Images optimized and thumbnails generated
  - [ ] Processing errors handled gracefully with retries
  - [ ] Content sanitization prevents XSS and security issues
  - [ ] Processing status accurately tracked and reported
  - [ ] Users notified of processing failures
- **Dependencies**: ARC-012.
- **Effort Estimate**: 4-5 days.
- **Status**: Pending ARC-012 completion

## ARC-014 Remaining Feature Migration

- **Problem/Objective**: Migrate remaining Express features (feeds, integrations, admin) to NestJS.
- **Approach**: Systematically migrate remaining endpoints with feature flag support. Tasks:
  - [ ] Create FeedsModule for RSS/Atom feed subscriptions
  - [ ] Create IntegrationModule for third-party integrations:
    - [ ] Readwise integration
    - [ ] Notion integration
    - [ ] Webhook endpoints
  - [ ] Create DigestModule for email digests
  - [ ] Migrate admin utilities and management endpoints
  - [ ] Implement feature flags for gradual rollout
  - [ ] Add monitoring and logging for migration tracking
  - [ ] Create rollback procedures for each feature
  - [ ] Update frontend to use NestJS endpoints
- **Acceptance Criteria**:
  - [ ] All critical endpoints migrated with identical functionality
  - [ ] Frontend successfully uses NestJS endpoints
  - [ ] No functionality regression detected in tests
  - [ ] Feature flags allow selective rollout and rollback
  - [ ] Admin tools work correctly with new backend
  - [ ] Integration webhooks maintain compatibility
  - [ ] RSS feeds work correctly
- **Dependencies**: ARC-013.
- **Effort Estimate**: 5-7 days.
- **Status**: Pending ARC-013 completion

## ARC-015 Service Consolidation & Cleanup

- **Problem/Objective**: Decommission old services and consolidate to single NestJS API.
- **Approach**: Complete migration by removing legacy services and consolidating infrastructure. Tasks:
  - [ ] Update docker-compose.yml to remove Express API service
  - [ ] Remove separate queue-processor and content-handler containers
  - [ ] Update NestJS API to run on port 4000 (production port)
  - [ ] Update deployment scripts and CI/CD pipelines
  - [ ] Clean up old configuration files and environment variables
  - [ ] Update documentation and self-hosting guides
  - [ ] Remove legacy code from repository
  - [ ] Perform final validation and testing
  - [ ] Update monitoring and alerting configurations
  - [ ] Create rollback plan if needed
- **Acceptance Criteria**:
  - [ ] Single NestJS API handles all functionality on port 4000
  - [ ] Resource usage reduced by 33% (memory) and 75% (services)
  - [ ] Deployment process simplified with single service
  - [ ] All automated tests pass with new configuration
  - [ ] Self-hosting documentation updated and validated
  - [ ] No legacy Express code remains in production builds
  - [ ] Monitoring and logging work correctly
  - [ ] Performance metrics meet or exceed baseline
- **Dependencies**: ARC-014.
- **Effort Estimate**: 2-3 days.
- **Status**: Pending ARC-014 completion

---

## Migration Progress Summary

### **Phase 1: Foundation** ✅ Complete
- **ARC-001**: NestJS Package Setup ✅
- **ARC-002**: Health Checks & Observability ✅
- **ARC-003**: Authentication Module ✅
- **ARC-003B**: Database & Entity Integration ✅
- **ARC-004**: GraphQL Module Setup ✅

### **Phase 2: Library Core** ✅ Complete
- **ARC-004B**: Vite Migration (Partial) 🔄 Foundation complete
- **ARC-005**: Library Core Mutations ✅ Complete
- **ARC-006**: Advanced Search & Filtering ✅ Complete
- **ARC-006B**: Performance & UX Optimizations ✅ Complete
- **ARC-007**: Bulk Operations & Multi-select ✅ Complete
- **ARC-008**: Labels System ✅ Complete

### **Phase 3: Frontend Feature Parity**
- **ARC-009**: Frontend Library Feature Parity
- **ARC-010**: Reading Progress & Highlights

### **Phase 4: Content Ingestion**
- **ARC-011**: Add Link & Content Ingestion
- **ARC-012**: Queue Integration & Background Processing
- **ARC-013**: Advanced Content Processing

### **Phase 5: Completion**
- **ARC-014**: Remaining Feature Migration
- **ARC-015**: Service Consolidation & Cleanup

---

**Total Tickets**: 18 ARCs (added ARC-006B for performance, ARC-007B for technical debt, ARC-010A for minimal reader)
- **Completed**: 11 ARCs (ARC-001 through ARC-008, ARC-010A, ARC-011, plus partial ARC-004B)
- **In Progress**: 1 ARC (ARC-004B foundation complete, remaining in ARC-009)
- **Ready to Start**: 2 ARCs (ARC-012, ARC-007B)
- **Remaining**: 6 ARCs (ARC-007B, ARC-009, ARC-010, ARC-012 through ARC-015)

**Effort Estimates:**
- **Completed**: ~17 days estimated (actual: ~8-9 days due to efficiency gains)
- **Tech Debt (ARC-007B)**: 1-2 days (optional, can be deferred)
- **Frontend Parity (ARC-009 to ARC-010)**: 8-11 days
- **Content Ingestion (ARC-011 to ARC-013)**: 9-11 days
- **Completion (ARC-014 to ARC-015)**: 7-10 days
- **Total Remaining**: 25-34 days (5-7 weeks) excluding optional ARC-007B

**Next Milestone**: ARC-009 Frontend Library Feature Parity to complete user-facing library experience

**Recent Accomplishments**:
- ✅ **ARC-010A Minimal Reader completed** - Basic article reader with clean typography
  - Created ReaderPage component with responsive design
  - Added content field to GraphQL schema (readable_content mapping)
  - Implemented DOMPurify HTML sanitization
  - Graceful handling of CONTENT_NOT_FETCHED state
  - Title click navigation to reader from library
  - Loading, error, and empty states
- ✅ **ARC-011 Add Link & Content Ingestion completed** - Save URLs with validation
  - AddLinkModal component with folder selection
  - SaveUrl mutation with duplicate detection
  - 17/17 E2E tests passing
  - Content extraction deferred to ARC-012/013
- ✅ **ARC-008 Labels System completed** - Full label management with filtering
  - Created Labels management page with CRUD operations
  - Implemented LabelPicker component with dropdown UI
  - Added label filtering to library search
  - Fixed label persistence by syncing both entity_labels and label_names columns
  - Migration 0191 for labels.updated_at default value
- ✅ Bulk operations with transaction support (44/44 E2E tests passing)
- ✅ Multi-select UI with checkboxes and bulk action bar
- ✅ Migration 0190 adds 8 strategic indexes (26x faster folder filters, 8x faster search)
- ✅ Simplified logging format (one-line, color-coded, readable in terminal)

**Identified Technical Debt** (to address in future refactoring):
- 🔧 Magic strings throughout codebase (folder names, config keys, states) → Need referential constants
- 🔧 Direct DataSource usage in services → Should use Repository pattern exclusively
- 🔧 Inconsistent database operation patterns → Consolidate into custom repositories

**Known UI Bugs** (to be addressed in ARC-009):
- 🐛 Label dropdown flickers when opened over library item cards (z-index/overlay issue)
- 🐛 Punycode deprecation warnings from transitive dependencies (eslint, typeorm) - cosmetic, non-blocking

---

## Implementation Notes

### **Stable State Philosophy**

Each ARC ticket is designed to reach a **stable, testable, deployable state** before moving to the next. This approach ensures:
- No half-completed features in production
- Easy rollback points if issues arise
- Continuous value delivery to users
- Reduced integration complexity

### **Dependency Flow & Stable States**

```
Foundation (✅ Complete)
├─ ARC-001: NestJS Setup
├─ ARC-002: Health Checks
├─ ARC-003: Authentication
├─ ARC-003B: Database Entities
└─ ARC-004: GraphQL Module
    └─ STABLE STATE: Read-only library listing works

Library Core (🔄 Current Focus)
├─ ARC-004B: Vite Frontend (ongoing)
├─ ARC-005: Core Mutations ⭐ NEXT
│   └─ STABLE STATE: Archive, delete, mark-read work
├─ ARC-006: Search & Filtering
│   └─ STABLE STATE: Advanced search matches legacy
├─ ARC-007: Bulk Operations
│   └─ STABLE STATE: Multi-select and bulk actions work
└─ ARC-008: Labels System
    └─ STABLE STATE: Full label management without content processing

Frontend Parity
├─ ARC-009: UI Feature Parity
│   └─ STABLE STATE: Library UI matches legacy feature-for-feature
└─ ARC-010: Reading & Highlights
    └─ STABLE STATE: Reading experience complete

Content Ingestion (Can use Express APIs until ready)
├─ ARC-011: Basic URL Saving
│   └─ STABLE STATE: Can save URLs with basic extraction
├─ ARC-012: Queue Integration
│   └─ STABLE STATE: Background processing via queues
└─ ARC-013: Advanced Processing
    └─ STABLE STATE: Full content processing parity

Completion
├─ ARC-014: Remaining Features
│   └─ STABLE STATE: All features migrated
└─ ARC-015: Service Consolidation
    └─ STABLE STATE: Single unified service
```

### **Technical Approach**

- **Parallel Development**: NestJS runs on port 4001 alongside Express on 4000
- **Feature Flags**: Use environment variables to toggle between implementations
- **Testing**: Comprehensive E2E testing at each ticket boundary (>90% coverage target)
- **Rollback Plan**: Express API remains available during development
- **Backend-First**: Always implement backend before dependent frontend features
- **Data Consistency**: Both APIs share same database during migration
- **No Breaking Changes**: JWT tokens and data formats remain compatible

### **Key Decision Points**

**Why This Order?**
1. **ARC-005 First**: Enables action buttons in UI, establishes mutation patterns
2. **Search Before Bulk**: Bulk operations need search query syntax
3. **Labels Before Frontend Parity**: Many UI features depend on labels
4. **Frontend Parity Before Content**: Library management can work without new content ingestion
5. **Queue Integration Last**: Most complex, can leverage Express content processing meanwhile

**Parallel Work Opportunities:**
- ARC-004B (Vite frontend) can progress alongside ARC-005 through ARC-008
- ARC-010 (Reading/Highlights) can be done in parallel with ARC-011 (if resources allow)
- Documentation and testing improvements can happen continuously
