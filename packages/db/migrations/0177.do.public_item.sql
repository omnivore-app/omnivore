-- Type: DO
-- Name: public_item
-- Description: Create a table for public items

BEGIN;

CREATE TABLE omnivore.public_item_source (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- public feeds, newsletters, or user recommended
    topics TEXT[],
    icon TEXT,
    url TEXT,
    language_codes TEXT[],
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_public_item_source_modtime BEFORE UPDATE ON omnivore.public_item_source FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
GRANT SELECT ON omnivore.public_item_source TO omnivore_user;


CREATE TABLE omnivore.public_item (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    source_id uuid NOT NULL REFERENCES omnivore.public_item_source(id) ON DELETE CASCADE,
    site_icon TEXT,
    type TEXT NOT NULL, -- public feeds, newsletters, or user recommended
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    topic TEXT,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    thumbnail TEXT,
    preview_content TEXT,
    language_code TEXT,
    author TEXT,
    dir TEXT,
    published_at timestamptz,
    word_count INT,
    site_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_public_item_modtime BEFORE UPDATE ON omnivore.public_item FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
GRANT SELECT ON omnivore.public_item TO omnivore_user;


CREATE TABLE omnivore.public_item_stats (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    public_item_id uuid NOT NULL REFERENCES omnivore.public_item(id) ON DELETE CASCADE,
    save_count INT NOT NULL DEFAULT 0,
    like_count INT NOT NULL DEFAULT 0,
    broadcast_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX public_item_stats_public_item_id_idx ON omnivore.public_item_stats(public_item_id);
CREATE TRIGGER update_public_item_stats_modtime BEFORE UPDATE ON omnivore.public_item_stats FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
GRANT SELECT ON omnivore.public_item_stats TO omnivore_user;


CREATE TABLE omnivore.public_item_interactions (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user(id) ON DELETE CASCADE,
    public_item_id uuid NOT NULL REFERENCES omnivore.public_item(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ,
    liked_at TIMESTAMPTZ,
    broadcasted_at TIMESTAMPTZ,
    seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    digested_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX public_item_interaction_user_id_idx ON omnivore.public_item_interactions(user_id);
CREATE INDEX public_item_interaction_public_item_id_idx ON omnivore.public_item_interactions(public_item_id);
CREATE TRIGGER update_public_item_interactions_modtime BEFORE UPDATE ON omnivore.public_item_interactions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
GRANT SELECT, INSERT, UPDATE ON omnivore.public_item_interactions TO omnivore_user;

CREATE EXTENSION IF NOT EXISTS LTREE;

ALTER TABLE omnivore.library_item 
    ADD COLUMN seen_at TIMESTAMPTZ,
    ADD COLUMN digested_at TIMESTAMPTZ,
    ADD COLUMN topic LTREE,
    ADD COLUMN score FLOAT;

COMMIT;
