-- Type: DO
-- Name: add_article_slug_index
-- Description: Add an index to the article slug column since we typically query on this.

BEGIN;

CREATE INDEX article_slug_idx ON omnivore.article(slug);

COMMIT;
