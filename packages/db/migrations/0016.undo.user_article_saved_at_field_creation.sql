-- Type: UNDO
-- Name: user_articles_saved_at_field_creation
-- Description: Creates the "saved_at" field for the user_articles table

BEGIN;

ALTER TABLE omnivore.user_articles
    DROP COLUMN saved_at;

COMMIT;
