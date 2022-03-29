-- Type: DO
-- Name: drop_not_null_on_page_id
-- Description: Drop not null constraint on page_id in content_display_report table

BEGIN;

ALTER TABLE omnivore.content_display_report ALTER COLUMN page_id DROP NOT NULL;
ALTER TABLE omnivore.abuse_report ALTER COLUMN page_id DROP NOT NULL;

COMMIT;
