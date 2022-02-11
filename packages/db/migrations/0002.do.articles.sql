-- Type: DO
-- Name: articles
-- Description: articles model

BEGIN;

CREATE TABLE omnivore.article (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT current_timestamp,
  url text NOT NULL,
  hash text NOT NULL,
  original_html text, -- original content that has taken by the URL
  content text NOT NULL, -- stringified version of the DOM parsed by the library
  author text,
  image text,
  UNIQUE (url, hash)
);

ALTER TABLE omnivore.article ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_article on omnivore.article
  FOR SELECT TO omnivore_user
  USING (true);

CREATE POLICY create_article on omnivore.article
  FOR INSERT TO omnivore_user
  WITH CHECK (true);

GRANT SELECT, INSERT ON omnivore.article TO omnivore_user;

COMMIT;
