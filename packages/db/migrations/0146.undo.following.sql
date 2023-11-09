-- Type: UNDO
-- Name: following
-- Description: Create tables for following feature

BEGIN;

DROP TABLE omnivore.feed;

DROP policy library_item_admin_policy ON omnivore.library_item;

ALTER TABLE omnivore.library_item
    DROP COLUMN hidden_at,
    DROP COLUMN added_to_following_at,
    DROP COLUMN added_to_following_by,
    DROP COLUMN links,
    DROP COLUMN preview_content_type,
    DROP COLUMN preview_content,
    DROP COLUMN added_to_following_from,
    DROP COLUMN added_to_library_at;

ALTER TABLE omnivore.subscriptions
    DROP COLUMN is_private,
    DROP COLUMN auto_add_to_library;

COMMIT;
