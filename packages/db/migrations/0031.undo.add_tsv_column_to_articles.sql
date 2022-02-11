-- Type: UNDO
-- Name: add_tsv_column_to_articles
-- Description: Add a tsvcector column to the articles table to enable full text search

BEGIN;
DROP INDEX omnivore.article_tsv_idx ;
ALTER TABLE omnivore.article drop column tsv;
DROP TRIGGER article_tsv_update ON omnivore.article;
COMMIT;
