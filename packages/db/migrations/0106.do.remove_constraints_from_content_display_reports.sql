-- Type: DO
-- Name: remove_constraints_from_content_display_reports
-- Description: Remove constraints from CD reports as they should not be deleted

BEGIN;

ALTER TABLE omnivore.content_display_report DROP CONSTRAINT content_display_report_page_id_fkey;
ALTER TABLE omnivore.content_display_report DROP CONSTRAINT content_display_report_user_id_fkey;

COMMIT;
