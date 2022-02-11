-- Type: DO
-- Name: highlight_replies
-- Description: Create omnivore.highlight_reply table

BEGIN;

CREATE TABLE omnivore.highlight_reply (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    highlight_id uuid NOT NULL REFERENCES omnivore.highlight ON DELETE CASCADE,
    text text NOT NULL,
    created_at timestamptz NOT NULL default current_timestamp,
    updated_at timestamptz
);

CREATE TRIGGER update_highlight_reply_modtime BEFORE UPDATE ON omnivore.highlight_reply FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE omnivore.highlight_reply ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_highlight_reply on omnivore.highlight_reply
  FOR SELECT TO omnivore_user
  USING (true);

CREATE POLICY create_highlight_reply on omnivore.highlight_reply
  FOR INSERT TO omnivore_user
  WITH CHECK (true);

CREATE POLICY update_highlight_reply on omnivore.highlight_reply
  FOR UPDATE TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, UPDATE ON omnivore.highlight_reply TO omnivore_user;

COMMIT;
