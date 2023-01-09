-- Type: DO
-- Name: remove_content_report_constraints
-- Description: Remove unneeded constraints from the content_report table

BEGIN;

ALTER TABLE omnivore.content_display_report
    DROP CONSTRAINT content_display_report_page_id_fkey;

ALTER TABLE omnivore.content_display_report
    DROP CONSTRAINT content_display_report_user_id_fkey;

COMMIT;
