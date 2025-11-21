-- Type: UNDO
-- Name: sentinel_reading_progress
-- Description: Rollback sentinel-based reading progress and restore scroll percentages

BEGIN;

-- ============================================================
-- PART 1: Restore old scroll-percent columns to library_item
-- ============================================================

ALTER TABLE omnivore.library_item
ADD COLUMN IF NOT EXISTS reading_progress_top_percent NUMERIC,
ADD COLUMN IF NOT EXISTS reading_progress_bottom_percent NUMERIC,
ADD COLUMN IF NOT EXISTS reading_progress_last_read_anchor INTEGER,
ADD COLUMN IF NOT EXISTS reading_progress_highest_read_anchor INTEGER;

-- ============================================================
-- PART 2: Migrate sentinel progress back to scroll percentages
-- ============================================================

-- Estimate scroll percentage from sentinel position
-- Formula: scroll_percent = (highest_seen_sentinel / total_sentinels) * 100
-- This requires guessing total sentinels - use a reasonable default (e.g., 1000)

UPDATE omnivore.library_item li
SET
    reading_progress_top_percent = LEAST(
        100,
        rp.last_seen_sentinel * 0.1
    ),
    reading_progress_bottom_percent = LEAST(
        100,
        rp.last_seen_sentinel * 0.1
    ),
    reading_progress_highest_read_anchor = rp.highest_seen_sentinel,
    reading_progress_last_read_anchor = rp.last_seen_sentinel
FROM omnivore.reading_progress rp
WHERE
    li.id = rp.library_item_id
    AND li.user_id = rp.user_id
    -- Only use the most recent progress record if multiple versions exist
    AND rp.updated_at = (
        SELECT MAX(updated_at)
        FROM omnivore.reading_progress rp2
        WHERE
            rp2.user_id = rp.user_id
            AND rp2.library_item_id = rp.library_item_id
    );

-- ============================================================
-- PART 3: Drop reading_progress table
-- ============================================================

DROP TRIGGER IF EXISTS trig_touch_reading_progress_updated_at ON omnivore.reading_progress;

DROP TABLE IF EXISTS omnivore.reading_progress CASCADE;

-- ============================================================
-- PART 4: Drop content_hash from library_item
-- ============================================================

DROP INDEX IF EXISTS omnivore.library_item_user_content_hash_idx;

ALTER TABLE omnivore.library_item DROP COLUMN IF EXISTS content_hash;

COMMIT;