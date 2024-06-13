-- Type: UNDO
-- Name: batch_delete_trash_items
-- Description: Create a function to batch delete library items in trash

BEGIN;

DROP PROCEDURE IF EXISTS omnivore.batch_delete_trash_items();

COMMIT;
