-- Type: DO
-- Name: add_tsv_column_to_articles
-- Description: Add a tsvcector column to the articles table to enable full text search

BEGIN;
ALTER TABLE omnivore.article add column tsv tsvector;
CREATE INDEX article_tsv_idx ON omnivore.article USING GIN (tsv);  

CREATE TRIGGER article_tsv_update BEFORE INSERT OR UPDATE
    ON omnivore.article FOR EACH ROW EXECUTE PROCEDURE
    tsvector_update_trigger(
    tsv, 'pg_catalog.english', content, title, description
);

COMMIT;

BEGIN;
-- This will force create all the text vectors
-- We need to do it in a separate transaction 
-- block though, otherwise the trigger wont be
-- executed on update.
UPDATE omnivore.article SET updated_at = NOW();
COMMIT;