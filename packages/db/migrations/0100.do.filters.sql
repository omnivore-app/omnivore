-- Type: DO
-- Name: search_filters
-- Description: Create search_filters table

BEGIN;

CREATE TABLE omnivore.filters (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    name character varying(255) NOT NULL,
    description character varying(255),
    filter character varying(255) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,
    UNIQUE (user_id, name)
);

CREATE TRIGGER filters_modtime BEFORE UPDATE ON omnivore.filters
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.filters TO omnivore_user;

COMMIT;
