-- Type: DO
-- Name: library_item
-- Description: Create library_item table

BEGIN;

CREATE EXTENSION vector;

CREATE TYPE library_item_state AS ENUM ('SUCCEEDED', 'FAILED', 'PROCESSING', 'ARCHIVED', 'DELETED');

CREATE TYPE content_reader_type AS ENUM ('WEB', 'PDF', 'EPUB');

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
    language text,
    words_count integer,
    site_name text,
    site_icon text,
    metadata JSON,
    reading_progress_last_read_anchor integer,
    reading_progress_highest_read_anchor integer,
    reading_progress_top_percent real,
    reading_progress_bottom_percent real,
    thumbnail text,
    page_type text,
    upload_file_id uuid REFERENCES omnivore.upload_files ON DELETE CASCADE,
    content_reader content_reader_type,
    original_content text,
    readable_content text,
    content_tsv tsvector,
    site_tsv tsvector,
    title_tsv tsvector,
    author_tsv tsvector,
    description_tsv tsvector,
    search_tsv tsvector,
    model_name text,
    embedding vector(768),
    text_content_hash text,
    gcs_archive_id text
);

CREATE TRIGGER update_library_item_modtime BEFORE UPDATE ON omnivore.library_item FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMIT;
