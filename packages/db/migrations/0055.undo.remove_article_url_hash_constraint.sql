-- Type: UNDO
-- Name: remove_article_url_hash_constraint
-- Description: Articles do not need a unique url and hash anymore

BEGIN;

ALTER TABLE omnivore.article ADD constraint UNIQUE(url, hash) ;

COMMIT;
