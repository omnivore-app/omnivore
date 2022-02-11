-- Type: UNDO
-- Name: article_saving_request_task_name_field_creation
-- Description: Creates the "task_name" field for the article_saving_request table

BEGIN;

ALTER TABLE omnivore.article_saving_request
    DROP COLUMN task_name;

COMMIT;
