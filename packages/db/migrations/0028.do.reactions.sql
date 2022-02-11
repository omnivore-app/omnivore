-- Type: DO
-- Name: reactions
-- Description: Create omnivore.reaction table

BEGIN;

CREATE TABLE omnivore.reaction (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    highlight_id uuid REFERENCES omnivore.highlight ON DELETE CASCADE,
    user_article_id uuid REFERENCES omnivore.user_articles ON DELETE CASCADE,
    highlight_reply_id uuid REFERENCES omnivore.highlight_reply ON DELETE CASCADE,
    code varchar(50) NOT NULL,
    deleted boolean NOT NULL default false,
    created_at timestamptz NOT NULL default current_timestamp,
    updated_at timestamptz
);

CREATE TRIGGER update_reaction_modtime BEFORE UPDATE ON omnivore.reaction FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE omnivore.reaction ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_reaction on omnivore.reaction
  FOR SELECT TO omnivore_user
  USING (true);

CREATE POLICY create_reaction on omnivore.reaction
  FOR INSERT TO omnivore_user
  WITH CHECK (true);

CREATE POLICY update_reaction on omnivore.reaction
  FOR UPDATE TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, UPDATE ON omnivore.reaction TO omnivore_user;

COMMIT;
