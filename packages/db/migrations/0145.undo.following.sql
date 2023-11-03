-- Type: UNDO
-- Name: following
-- Description: Create tables for following feature

BEGIN;

DROP TABLE omnivore.feed;

ALTER TABLE omnivore.library_item
    DROP COLUMN hidden_at,
    DROP COLUMN shared_at,
    DROP COLUMN shared_by,
    DROP COLUMN links,
    DROP COLUMN preview_content,
    DROP COLUMN seen_at,
    ALTER COLUMN saved_at SET NOT NULL;

ALTER TABLE omnivore.subscriptions
    DROP COLUMN is_public,
    DROP COLUMN is_fetching_content;

COMMIT;
