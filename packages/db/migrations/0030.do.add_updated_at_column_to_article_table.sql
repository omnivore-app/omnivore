-- Type: DO
-- Name: add_updated_at_column_to_article_table
-- Description: Add an updated_at column to the article table

BEGIN;

ALTER TABLE omnivore.article ADD COLUMN updated_at timestamptz NOT NULL DEFAULT current_timestamp;
CREATE TRIGGER update_article_modtime BEFORE UPDATE ON omnivore.article FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMIT;
