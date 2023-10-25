-- Type: UNDO
-- Name: add_index_for_cleanup_to_user
-- Description: Add index of status and updated_at to omnivore.user table for cleanup of deleted users

BEGIN;

DROP INDEX IF EXISTS user_status_updated_at_idx;

COMMIT;
