-- Type: DO
-- Name: drop_not_null_on_article_id
-- Description: Drop NOT NULL on article_id in highlights table

BEGIN;

ALTER TABLE omnivore.highlight ALTER COLUMN article_id DROP NOT NULL;

COMMIT;
