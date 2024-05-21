-- Type: DO
-- Name: public_item
-- Description: Create a table for public items

BEGIN;

CREATE TABLE omnivore.public_item_source (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    name TEXT NOT NULL,
    topics TEXT[] NOT NULL,
    thumbnail TEXT NOT NULL,
    url TEXT NOT NULL,
    language_codes TEXT[] NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE omnivore.public_item (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    source_id uuid NOT NULL, -- user_id or public_item_source_id
    type TEXT NOT NULL, -- public feeds, newsletters, or user recommended
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    preview_content TEXT,
    language_code TEXT,
    author TEXT,
    dir TEXT,
    published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE omnivore.public_item_features (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    public_item_id uuid NOT NULL REFERENCES omnivore.public_item(id) ON DELETE CASCADE,
    classified_topic TEXT,
    sentiment_score FLOAT,
    writing_style TEXT,
    popularity_score FLOAT,
    embedding VECTOR(768),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX public_item_feature_public_item_id_idx ON omnivore.public_item_features(public_item_id);

CREATE TABLE omnivore.public_item_stats (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    public_item_id uuid NOT NULL REFERENCES omnivore.public_item(id) ON DELETE CASCADE,
    save_count INT NOT NULL DEFAULT 0,
    like_count INT NOT NULL DEFAULT 0,
    broadcast_count INT NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX public_item_stats_public_item_id_idx ON omnivore.public_item_stats(public_item_id);

CREATE TABLE omnivore.public_item_interactions (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user(id) ON DELETE CASCADE,
    public_item_id uuid NOT NULL REFERENCES omnivore.public_item(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- save, like, broadcast, comment, see
    action_data TEXT, -- for comment, the comment text
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX public_item_interaction_user_id_idx ON omnivore.public_item_interactions(user_id);
CREATE INDEX public_item_interaction_public_item_id_idx ON omnivore.public_item_interactions(public_item_id);

COMMIT;
