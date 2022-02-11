-- Type: DO
-- Name: rename_article_to_page
-- Description: Rename article table name to page

BEGIN;

ALTER TABLE omnivore.article RENAME TO pages;

COMMIT;
