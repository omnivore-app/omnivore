-- Type: DO
-- Name: article_published_at
-- Description: Adds published_at column for the article table

BEGIN;

ALTER TABLE omnivore.article
    ADD COLUMN published_at timestamptz;

COMMIT;
