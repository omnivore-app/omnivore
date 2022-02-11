-- Type: DO
-- Name: user_rename_username
-- Description: rename username column to source_username

BEGIN;

ALTER TABLE omnivore.user
    ALTER COLUMN username DROP NOT NULL;

ALTER TABLE omnivore.user
    RENAME COLUMN username TO source_username;

COMMIT;
