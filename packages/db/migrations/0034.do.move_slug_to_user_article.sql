-- Type: DO
-- Name: move_slug_to_user_article
-- Description: Move the slug column from the article to the user article 

BEGIN;

ALTER TABLE omnivore.user_articles ADD COLUMN slug TEXT;
UPDATE omnivore.user_articles SET slug = a.slug FROM omnivore.article a WHERE article_id = a.id ;
ALTER TABLE omnivore.user_articles ALTER COLUMN slug SET NOT NULL;

ALTER TABLE omnivore.article DROP column slug;

COMMIT;
