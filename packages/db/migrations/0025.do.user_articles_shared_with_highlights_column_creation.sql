-- Type: DO
-- Name: user_articles_shared_with_highlights_column_creation
-- Description: Creates the "shared_with_highlights" column for the user_articles table

BEGIN;

ALTER TABLE omnivore.user_articles
    ADD column shared_with_highlights boolean default false;

COMMIT;
