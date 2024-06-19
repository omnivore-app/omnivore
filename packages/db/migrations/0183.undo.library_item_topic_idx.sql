-- Type: UNDO
-- Name: library_item_topic_idx
-- Description: Create index on topic column in library_item table

BEGIN;

DROP INDEX IF EXISTS omnivore.library_item_topic_idx;

COMMIT;
