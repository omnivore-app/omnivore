-- Type: UNDO
-- Name: article_saving_request
-- Description: Creates article saving request table

BEGIN;

DROP TRIGGER update_article_saving_request_modtime ON omnivore.article_saving_request;

DROP TABLE omnivore.article_saving_request;

COMMIT;
