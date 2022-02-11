-- Type: UNDO
-- Name: move_slug_to_user_article
-- Description: Move the slug column from the article to the user article 

BEGIN;

ALTER TABLE omnivore.article ADD COLUMN slug TEXT;
UPDATE omnivore.article a SET slug = ua.slug FROM omnivore.user_articles ua WHERE article_id = a.id;

ALTER TABLE omnivore.user_articles DROP COLUMN slug;
ALTER TABLE omnivore.article ALTER COLUMN slug SET NOT NULL;
CREATE INDEX article_slug_idx ON omnivore.article(slug);

COMMIT;
