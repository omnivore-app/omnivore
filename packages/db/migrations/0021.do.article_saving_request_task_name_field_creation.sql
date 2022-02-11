-- Type: DO
-- Name: article_saving_request_task_name_field_creation
-- Description: Creates the "task_name" field for the article_saving_request table

BEGIN;

ALTER TABLE omnivore.article_saving_request
    ADD column task_name text;

COMMIT;
