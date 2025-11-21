-- Type: DO
-- Name: add_total_sentinels
-- Description: Add total_sentinels column to library_item for reading progress percentage calculation

BEGIN;

-- ============================================================
-- Add total_sentinels to library_item
-- ============================================================

ALTER TABLE omnivore.library_item
ADD COLUMN IF NOT EXISTS total_sentinels INTEGER DEFAULT 0;

-- Index for efficient progress queries (joining with reading_progress)
CREATE INDEX IF NOT EXISTS library_item_total_sentinels_idx
  ON omnivore.library_item (id, total_sentinels)
  WHERE total_sentinels > 0;

COMMENT ON COLUMN omnivore.library_item.total_sentinels IS
  'Total number of sentinel markers in the article content. Used to calculate reading progress percentage: (highest_seen_sentinel / total_sentinels) * 100';

COMMIT;
