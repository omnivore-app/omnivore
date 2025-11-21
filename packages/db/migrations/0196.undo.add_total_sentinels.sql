-- Type: UNDO
-- Name: add_total_sentinels
-- Description: Remove total_sentinels column from library_item

BEGIN;

DROP INDEX IF EXISTS omnivore.library_item_total_sentinels_idx;

ALTER TABLE omnivore.library_item
DROP COLUMN IF EXISTS total_sentinels;

COMMIT;
