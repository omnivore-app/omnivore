-- Type: UNDO
-- Name: add_status_to_user
-- Description: Add status to user table

BEGIN;

DROP TYPE IF EXISTS user_status_type CASCADE;

ALTER TABLE omnivore.user DROP COLUMN IF EXISTS status;

COMMIT;
