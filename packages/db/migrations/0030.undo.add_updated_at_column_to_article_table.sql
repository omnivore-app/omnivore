-- Type: UNDO
-- Name: add_updated_at_column_to_article_table
-- Description: Add an updated_at column to the article table

BEGIN;
ALTER TABLE omnivore.article DROP COLUMN updated_at;
DROP TRIGGER update_article_modtime ON omnivore.article;
COMMIT;
