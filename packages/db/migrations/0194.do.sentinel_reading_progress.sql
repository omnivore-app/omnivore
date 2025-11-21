-- Type: DO
-- Name: sentinel_reading_progress
-- Description: Implement sentinel-based reading progress tracking with content versioning

BEGIN;

-- ============================================================
-- PART 1: Add content_hash to library_item
-- ============================================================

ALTER TABLE omnivore.library_item
ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);

-- Index for fast lookups by user + item + version
CREATE INDEX IF NOT EXISTS library_item_user_content_hash_idx ON omnivore.library_item (user_id, id, content_hash);

COMMENT ON COLUMN omnivore.library_item.content_hash IS 'SHA-256 hash of sanitized content for version tracking and cache invalidation';

-- ============================================================
-- PART 2: Create reading_progress table (sentinel-based)
-- ============================================================


CREATE TABLE IF NOT EXISTS omnivore.reading_progress (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),

  user_id                UUID NOT NULL
                         REFERENCES omnivore."user"(id) ON DELETE CASCADE,

  library_item_id        UUID NOT NULL
                         REFERENCES omnivore.library_item(id) ON DELETE CASCADE,

-- Content version this progress is for
content_version VARCHAR(64),

-- Sentinel-based progress tracking
last_seen_sentinel INTEGER NOT NULL DEFAULT 0,
highest_seen_sentinel INTEGER NOT NULL DEFAULT 0,

-- Timestamps
created_at             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- One progress record per (user, item, content_version)
-- Use COALESCE to handle NULL versions as empty string for uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS reading_progress_unique_key ON omnivore.reading_progress (
    user_id,
    library_item_id,
    COALESCE(content_version, '')
);

-- Hot path: fetch progress for specific user + item + version
CREATE INDEX IF NOT EXISTS reading_progress_lookup_idx ON omnivore.reading_progress (
    user_id,
    library_item_id,
    content_version
);

-- Query latest progress regardless of version
CREATE INDEX IF NOT EXISTS reading_progress_user_item_updated_idx ON omnivore.reading_progress (
    user_id,
    library_item_id,
    updated_at DESC
);

-- ============================================================
-- PART 3: Triggers for updated_at
-- ============================================================

-- Create or reuse the touch_updated_at function
CREATE OR REPLACE FUNCTION omnivore.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END$$;

-- Apply trigger to reading_progress
DROP TRIGGER IF EXISTS trig_touch_reading_progress_updated_at
  ON omnivore.reading_progress;

CREATE TRIGGER trig_touch_reading_progress_updated_at
  BEFORE UPDATE ON omnivore.reading_progress
  FOR EACH ROW
  EXECUTE FUNCTION omnivore.touch_updated_at();

-- ============================================================
-- PART 4: Migrate existing scroll-based progress (optional)
-- ============================================================

-- For users with existing progress, create a sentinel record
-- Estimate sentinel position from scroll percentage
-- Formula: sentinel = FLOOR(highest_anchor * (scroll_percent / 100))
-- This is approximate but provides continuity for existing users

INSERT INTO omnivore.reading_progress (
  user_id,
  library_item_id,
  content_version,
  last_seen_sentinel,
  highest_seen_sentinel,
  created_at,
  updated_at
)
SELECT
  li.user_id,
  li.id,
  li.content_hash,
  -- Estimate last seen sentinel from top percent
  CASE
    WHEN li.reading_progress_highest_read_anchor > 0
    THEN FLOOR(li.reading_progress_highest_read_anchor * (li.reading_progress_top_percent / 100.0))::INTEGER
    ELSE 0
  END,
  -- Use existing highest anchor
  COALESCE(li.reading_progress_highest_read_anchor, 0),
  li.updated_at,
  li.updated_at
FROM omnivore.library_item li
WHERE
  -- Only migrate if there's meaningful progress
  li.reading_progress_top_percent > 0
  OR li.reading_progress_highest_read_anchor > 0
ON CONFLICT (user_id, library_item_id, COALESCE(content_version, ''))
DO NOTHING;

-- ============================================================
-- PART 5: Drop old scroll-percent columns from library_item
-- ============================================================

-- Safe to drop now that data is migrated
ALTER TABLE omnivore.library_item
  DROP COLUMN IF EXISTS reading_progress_top_percent,
  DROP COLUMN IF EXISTS reading_progress_bottom_percent,
  DROP COLUMN IF EXISTS reading_progress_last_read_anchor,
  DROP COLUMN IF EXISTS reading_progress_highest_read_anchor;

-- ============================================================
-- PART 6: Row Level Security (RLS)
-- ============================================================

ALTER TABLE omnivore.reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_reading_progress ON omnivore.reading_progress
  FOR SELECT TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

CREATE POLICY create_reading_progress ON omnivore.reading_progress
  FOR INSERT TO omnivore_user
  WITH CHECK (user_id = omnivore.get_current_user_id());

CREATE POLICY update_reading_progress ON omnivore.reading_progress
  FOR UPDATE TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

CREATE POLICY delete_reading_progress ON omnivore.reading_progress
  FOR DELETE TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.reading_progress TO omnivore_user;

-- ============================================================
-- PART 7: Helpful comments
-- ============================================================

COMMENT ON TABLE omnivore.reading_progress IS
  'Sentinel-based reading progress tracking per user per item per content version';

COMMENT ON COLUMN omnivore.reading_progress.last_seen_sentinel IS
  'Last I/O sentinel the user scrolled past (viewport bottom)';

COMMENT ON COLUMN omnivore.reading_progress.highest_seen_sentinel IS
  'Highest sentinel ever reached by this user (for "furthest read" tracking)';

COMMENT ON COLUMN omnivore.reading_progress.content_version IS
  'Content hash/version this progress applies to - enables re-anchoring on content updates';

COMMIT;