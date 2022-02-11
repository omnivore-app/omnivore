-- Type: DO
-- Name: remove_article_url_hash_constraint
-- Description: Articles do not need a unique url and hash anymore

BEGIN;

ALTER TABLE omnivore.article DROP constraint article_url_hash_key ;

COMMIT;
