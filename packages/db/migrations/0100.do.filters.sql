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
    position integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,
    UNIQUE (user_id, name)
);

CREATE OR REPLACE FUNCTION update_filter_position()
    RETURNS TRIGGER AS $$
DECLARE
    new_position INTEGER;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        UPDATE omnivore.filters SET position = position - 1 WHERE user_id = OLD.user_id AND position > OLD.position;
        RETURN OLD;
    ELSIF (TG_OP = 'INSERT') THEN
        SELECT COALESCE(MAX(position), 0) + 1 INTO new_position FROM omnivore.filters WHERE user_id = NEW.user_id AND name < NEW.name;
        UPDATE omnivore.filters SET position = position + 1 WHERE user_id = NEW.user_id AND position >= new_position;
        NEW.position = new_position;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_filter_modtime BEFORE UPDATE ON omnivore.filters
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER increment_filter_position
    BEFORE INSERT ON omnivore.filters
    FOR EACH ROW
EXECUTE FUNCTION update_filter_position();

CREATE TRIGGER decrement_filter_position
    AFTER DELETE ON omnivore.filters
    FOR EACH ROW
EXECUTE FUNCTION update_filter_position();

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.filters TO omnivore_user;

COMMIT;
