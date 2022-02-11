-- Type: DO
-- Name: highlights
-- Description: Create omnivore.highlight table

BEGIN;

CREATE TABLE omnivore.highlight (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    article_id uuid NOT NULL REFERENCES omnivore.article ON DELETE CASCADE,
    quote text NOT NULL,
    prefix varchar(5000),
    suffix varchar(5000),
    patch text NOT NULL,
    annotation varchar(400),
    deleted boolean NOT NULL default false,
    created_at timestamptz NOT NULL default current_timestamp,
    updated_at timestamptz,
    shared_at timestamptz
);

CREATE TRIGGER update_highlight_modtime BEFORE UPDATE ON omnivore.highlight FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE omnivore.highlight ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_highlight on omnivore.highlight
  FOR SELECT TO omnivore_user
  USING (true);

CREATE POLICY create_highlight on omnivore.highlight
  FOR INSERT TO omnivore_user
  WITH CHECK (true);

CREATE POLICY update_highlight on omnivore.highlight
  FOR UPDATE TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, UPDATE ON omnivore.highlight TO omnivore_user;

COMMIT;
