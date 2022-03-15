-- Type: DO
-- Name: migrate_elastic_page_id_data
-- Description: Migrate elastic_page_id field from article_id in highlight and article_saving_request tables

BEGIN;

UPDATE omnivore.article_saving_request
    SET elastic_page_id = article_id
    WHERE elastic_page_id is NULL AND article_id is NOT NULL;
UPDATE omnivore.highlight
    SET elastic_page_id = article_id
    WHERE elastic_page_id is NULL AND article_id is NOT NULL;

COMMIT;
