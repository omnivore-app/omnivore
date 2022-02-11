-- Type: UNDO
-- Name: add_article_slug_index
-- Description: Add an index to the article slug column since we typically query on this.

BEGIN;

DROP INDEX omnivore.article_slug_idx;

COMMIT;
