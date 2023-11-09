-- Type: UNDO
-- Name: following
-- Description: Create tables for following feature

BEGIN;

DROP TABLE omnivore.feed;

DROP policy library_item_admin_policy ON omnivore.library_item;

ALTER TABLE omnivore.library_item
    DROP COLUMN hidden_at,
    DROP COLUMN shared_at,
    DROP COLUMN shared_by,
    DROP COLUMN links,
    DROP COLUMN preview_content,
    DROP COLUMN seen_at,
    DROP COLUMN shared_source,
    DROP COLUMN is_in_library;

ALTER TABLE omnivore.subscriptions
    DROP COLUMN is_public,
    DROP COLUMN is_fetching_content;

COMMIT;
