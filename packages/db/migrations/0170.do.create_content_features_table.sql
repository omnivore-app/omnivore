-- Type: DO
-- Name: create_content_features_table
-- Description: Create a new table for storing content features

BEGIN;

CREATE TABLE omnivore.content_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  library_item_id uuid NOT NULL REFERENCES omnivore.library_item ON DELETE CASCADE,

  content_hash TEXT,
  content_type TEXT,
  topic TEXT,
  intent TEXT,
  audience TEXT,
  wk_topic TEXT,
  language TEXT,
  writing_quality REAL,
  reading_level INT,
  substantiality REAL,
  teaser TEXT,
  short_teaser TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT SELECT, INSERT, UPDATE ON omnivore.content_features TO omnivore_user;

COMMIT;
