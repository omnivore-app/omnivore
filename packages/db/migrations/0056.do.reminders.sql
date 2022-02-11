-- Type: DO
-- Name: reminders
-- Description: Add reminders table

BEGIN;

CREATE TABLE omnivore.reminders (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    article_saving_request_id uuid REFERENCES omnivore.article_saving_request ON DELETE CASCADE,
    link_id uuid REFERENCES omnivore.links ON DELETE CASCADE
);

ALTER TABLE omnivore.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_reminders on omnivore.reminders
  FOR SELECT TO omnivore_user
  USING (true);

CREATE POLICY create_reminders on omnivore.reminders
  FOR INSERT TO omnivore_user
  WITH CHECK (true);

CREATE POLICY update_reminders on omnivore.reminders
  FOR UPDATE TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

CREATE POLICY delete_reminders on omnivore.reminders
  FOR DELETE TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.reminders TO omnivore_user;

COMMIT;
