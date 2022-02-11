-- Type: DO
-- Name: user_rename_username
-- Description: rename username column to source_username

BEGIN;

ALTER TABLE omnivore.user
    RENAME COLUMN source_username TO username;

COMMIT;
