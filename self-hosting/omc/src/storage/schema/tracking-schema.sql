-- AIDEV-NOTE: tracking and original analysis storage for querying
-- AIDEV-NOTE: analysisJson stores AI-generated output (immutable snapshot)
-- AIDEV-NOTE: git-tracked Markdown files are editable by humans (mutable)
-- AIDEV-NOTE: this database also contains READ-ONLY Omnivore cache tables (if present)

-- Analysis job queue for parallel execution coordination
-- AIDEV-NOTE: gql-article-query-requirements - slug required for article(slug, username) query
-- AIDEV-NOTE: gql-search-query - search(query) does NOT support id: filter
CREATE TABLE IF NOT EXISTS analysis_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id TEXT NOT NULL UNIQUE,  -- AIDEV: from SearchItem.id field
  article_slug TEXT NOT NULL,       -- AIDEV: REQUIRED for article(slug, username) GQL query
  article_url TEXT NOT NULL,
  article_title TEXT NOT NULL,

  -- Article metadata from Omnivore
  saved_at TEXT NOT NULL,           -- AIDEV: when saved to Omnivore (ISO 8601)
  published_at TEXT,                 -- AIDEV: article publication date (ISO 8601), null if unknown
  updated_at_article TEXT,           -- AIDEV: article last update (ISO 8601), null if unknown

  -- Analysis results (immutable AI snapshot)
  analysis_json TEXT,                -- AIDEV: full ContentAnalysis as JSON (null until analyzed)
  markdown_path TEXT,                -- AIDEV: path to git-tracked .md file (null until saved)

  -- Tracking status (coordination lock)
  status TEXT NOT NULL CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')),
  assigned_at TEXT,              -- When marked in_progress (ISO 8601)
  completed_at TEXT,             -- When marked completed (ISO 8601)

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TEXT NOT NULL,      -- When added to queue (ISO 8601)
  updated_at TEXT NOT NULL       -- AIDEV: last tracking status change (ISO 8601)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_analysis_queue_status ON analysis_queue(status);
CREATE INDEX IF NOT EXISTS idx_analysis_queue_article_id ON analysis_queue(article_id);
CREATE INDEX IF NOT EXISTS idx_analysis_queue_created_at ON analysis_queue(created_at DESC);

-- Analysis session metadata (optional - for tracking batches)
CREATE TABLE IF NOT EXISTS analysis_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  total_articles INTEGER,
  completed_articles INTEGER DEFAULT 0,
  failed_articles INTEGER DEFAULT 0,
  notes TEXT
);
