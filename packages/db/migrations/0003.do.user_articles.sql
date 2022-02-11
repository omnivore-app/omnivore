-- Type: DO
-- Name: user_articles
-- Description: user to article map model

BEGIN;

CREATE TABLE omnivore.user_articles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES omnivore.article ON DELETE CASCADE,
  article_url text NOT NULL,
  article_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT current_timestamp,
  updated_at timestamptz NOT NULL DEFAULT current_timestamp,
  shared_at timestamptz DEFAULT NULL,
  shared_comment text DEFAULT NULL,
  article_reading_progress SMALLINT NOT NULL DEFAULT 0,
  UNIQUE (user_id, article_id)
);

CREATE TRIGGER update_user_articles_modtime BEFORE UPDATE ON omnivore.user_articles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE omnivore.user_articles 
  ADD CONSTRAINT check_article_reading_progress 
  CHECK (article_reading_progress >= 0 and article_reading_progress <= 100 );

ALTER TABLE omnivore.user_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_user_articles on omnivore.user_articles
  FOR SELECT TO omnivore_user
  USING (true);

CREATE POLICY create_user_articles on omnivore.user_articles
  FOR INSERT TO omnivore_user
  WITH CHECK (true);

CREATE POLICY update_user_articles on omnivore.user_articles
  FOR UPDATE TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

CREATE POLICY delete_user_articles on omnivore.user_articles
  FOR DELETE TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.user_articles TO omnivore_user;

COMMIT;
