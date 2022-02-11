-- Type: UNDO
-- Name: article_published_at
-- Description: Adds published_at column for the article table

BEGIN;

ALTER TABLE omnivore.article 
    DROP COLUMN published_at;

COMMIT;
