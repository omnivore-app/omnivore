-- Type: UNDO
-- Name: remove_constraints_from_content_display_reports
-- Description: Remove constraints from CD reports as they should not be deleted

BEGIN;

ALTER TABLE omnivore.content_display_report
    ADD CONSTRAINT content_display_report_user_id_fkey FOREIGN KEY (user_id) REFERENCES omnivore."user"(id);

ALTER TABLE omnivore.content_display_report
    ADD CONSTRAINT content_display_report_page_id_fkey FOREIGN KEY (page_id) REFERENCES omnivore.pages(id);

COMMIT;
