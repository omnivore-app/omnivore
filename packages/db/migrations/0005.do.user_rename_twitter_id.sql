-- Type: DO
-- Name: user_rename_twitter_id
-- Description: rename twitter_id column to source_user_id

BEGIN;

ALTER TABLE omnivore.user
    RENAME COLUMN twitter_id TO source_user_id;

COMMIT;
