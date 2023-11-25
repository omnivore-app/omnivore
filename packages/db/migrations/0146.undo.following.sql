-- Type: UNDO
-- Name: following
-- Description: Create tables for following feature

BEGIN;

DROP policy library_item_admin_policy ON omnivore.library_item;

ALTER TABLE omnivore.library_item
    DROP COLUMN links,
    DROP COLUMN preview_content,
    DROP COLUMN preview_content_type,
    DROP COLUMN folder;

ALTER TABLE omnivore.subscriptions
    DROP COLUMN is_private,
    DROP COLUMN auto_add_to_library;

COMMIT;
