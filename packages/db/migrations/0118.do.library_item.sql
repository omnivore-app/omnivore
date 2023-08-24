-- Type: DO
-- Name: library_item
-- Description: Create library_item table

BEGIN;

CREATE EXTENSION vector;

CREATE TYPE library_item_state AS ENUM ('SUCCEEDED', 'FAILED', 'PROCESSING', 'ARCHIVED', 'DELETED');
CREATE TYPE content_reader_type AS ENUM ('WEB', 'PDF', 'EPUB');
CREATE TYPE library_item_type AS ENUM ('ARTICLE', 'BOOK', 'FILE', 'PROFILE', 'WEBSITE', 'TWEET', 'VIDEO', 'IMAGE', 'UNKNOWN');
CREATE TYPE directionality_type AS ENUM ('LTR', 'RTL');

CREATE TABLE omnivore.library_item (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    state library_item_state NOT NULL DEFAULT 'SUCCEEDED',
    original_url text NOT NULL,
    download_url text,
    slug text NOT NULL,
    title text NOT NULL,
    author text,
    description text,
    saved_at timestamptz NOT NULL DEFAULT current_timestamp,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    published_at timestamptz,
    archived_at timestamptz,
    deleted_at timestamptz,
    read_at timestamptz,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,
    item_language text,
    word_count integer,
    site_name text,
    site_icon text,
    metadata JSON,
    reading_progress_last_read_anchor integer NOT NULL DEFAULT 0,
    reading_progress_highest_read_anchor integer NOT NULL DEFAULT 0,
    reading_progress_top_percent real NOT NULL DEFAULT 0,
    reading_progress_bottom_percent real NOT NULL DEFAULT 0,
    thumbnail text,
    item_type library_item_type NOT NULL DEFAULT 'UNKNOWN',
    upload_file_id uuid REFERENCES omnivore.upload_files ON DELETE CASCADE,
    content_reader content_reader_type NOT NULL DEFAULT 'WEB',
    original_content text,
    readable_content text NOT NULL DEFAULT '',
    content_tsv tsvector,
    site_tsv tsvector,
    title_tsv tsvector,
    author_tsv tsvector,
    description_tsv tsvector,
    search_tsv tsvector,
    model_name text,
    embedding vector(768),
    text_content_hash text,
    gcs_archive_id text,
    directionality directionality_type NOT NULL DEFAULT 'LTR',
    subscription_id uuid REFERENCES omnivore.subscriptions ON DELETE CASCADE,
    UNIQUE (user_id, original_url)
);

CREATE TRIGGER update_library_item_modtime BEFORE UPDATE ON omnivore.library_item FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX library_item_content_tsv_idx ON omnivore.library_item USING GIN (content_tsv);
CREATE INDEX library_item_site_tsv_idx ON omnivore.library_item USING GIN (site_tsv);
CREATE INDEX library_item_title_tsv_idx ON omnivore.library_item USING GIN (title_tsv);
CREATE INDEX library_item_author_tsv_idx ON omnivore.library_item USING GIN (author_tsv);
CREATE INDEX library_item_description_tsv_idx ON omnivore.library_item USING GIN (description_tsv);
CREATE INDEX library_item_search_tsv_idx ON omnivore.library_item USING GIN (search_tsv);

CREATE OR REPLACE FUNCTION update_library_item_tsv() RETURNS trigger AS $$
begin
    new.content_tsv := to_tsvector('pg_catalog.english', coalesce(new.readable_content, ''));
    new.site_tsv := to_tsvector('pg_catalog.english', coalesce(new.site_name, ''));
    new.title_tsv := to_tsvector('pg_catalog.english', coalesce(new.title, ''));
    new.author_tsv := to_tsvector('pg_catalog.english', coalesce(new.author, ''));
    new.description_tsv := to_tsvector('pg_catalog.english', coalesce(new.description, ''));
    new.search_tsv := 
        setweight(new.title_tsv, 'A') || 
        setweight(new.author_tsv, 'A') || 
        setweight(new.site_tsv, 'A') || 
        setweight(new.description_tsv, 'A') || 
        -- full hostname (eg www.omnivore.app)
        setweight(to_tsvector('pg_catalog.english', coalesce(regexp_replace(new.url, '^((http[s]?):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$', '\3'), '')), 'A') || 
        -- secondary hostname (eg omnivore)
        setweight(to_tsvector('pg_catalog.english', coalesce(regexp_replace(new.url, '^((http[s]?):\/)?\/?(.*\.)?([^:\/\s]+)(\..*)((\/+)*\/)?([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$', '\4'), '')), 'A') || 
        setweight(new.content_tsv, 'B');
    return new;
end
$$ LANGUAGE plpgsql;

CREATE TRIGGER library_item_tsv_update BEFORE INSERT OR UPDATE
    ON omnivore.library_item FOR EACH ROW EXECUTE PROCEDURE update_library_item_tsv();

COMMIT;
