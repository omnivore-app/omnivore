-- Type: DO
-- Name: create_content_display_report
-- Description: Create a new table for the user reports of content display issues

BEGIN;

CREATE TABLE omnivore.content_display_report (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  user_id uuid NOT NULL REFERENCES omnivore.user(id),
  page_id uuid NOT NULL REFERENCES omnivore.article,

  content text,
  original_html text,
  original_url text NOT NULL,

  report_comment text,

  created_at timestamptz NOT NULL DEFAULT current_timestamp,
  updated_at timestamptz NOT NULL DEFAULT current_timestamp
);

CREATE TRIGGER update_content_display_report_modtime BEFORE UPDATE ON omnivore.content_display_report FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

GRANT SELECT, INSERT ON omnivore.content_display_report TO omnivore_user;


COMMIT;
