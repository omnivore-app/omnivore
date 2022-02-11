-- Type: UNDO
-- Name: user_rename_twitter_id
-- Description: rename twitter_id column to source_user_id

BEGIN;

ALTER TABLE omnivore.user
    RENAME COLUMN source_user_id TO twitter_id;

COMMIT;
