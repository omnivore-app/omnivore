-- Type: UNDO
-- Name: remove_content_report_constraints
-- Description: Remove unneeded constraints from the content_report table

BEGIN;

ALTER TABLE omnivore.content_display_report
    ADD CONSTRAINT content_display_report_user_id_fkey FOREIGN KEY (user_id) REFERENCES omnivore."user"(id);

ALTER TABLE omnivore.content_display_report
    ADD CONSTRAINT content_display_report_page_id_fkey FOREIGN KEY (page_id) REFERENCES omnivore.pages(id);


COMMIT;
