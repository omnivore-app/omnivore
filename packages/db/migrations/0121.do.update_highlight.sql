-- Type: DO
-- Name: update_highlight
-- Description: Add fields to highlight table

BEGIN;

CREATE TYPE highlight_type AS ENUM (
    'HIGHLIGHT',
    'REDACTION',
    'NOTE'
);

ALTER TABLE omnivore.highlight 
    ADD COLUMN library_item_id uuid NOT NULL REFERENCES omnivore.library_item ON DELETE CASCADE,
    ADD COLUMN highlight_position_percent real NOT NULL DEFAULT 0,
    ADD COLUMN highlight_position_anchor_index integer NOT NULL DEFAULT 0,
    ADD COLUMN highlight_type highlight_type NOT NULL DEFAULT 'HIGHLIGHT',
    ADD COLUMN color text,
    ADD COLUMN html text,
    DROP COLUMN article_id,
    DROP COLUMN elastic_page_id;

CREATE OR REPLACE FUNCTION update_library_item_highlight_annotations()
RETURNS TRIGGER AS $$
DECLARE
    current_library_item_id uuid;
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        current_library_item_id = NEW.library_item_id;
    ELSE
        current_library_item_id = OLD.library_item_id;
    END IF;

    WITH highlight_agg AS (
        SELECT array_agg(coalesce(annotation, '')) AS annotation_agg
        FROM omnivore.highlight
        WHERE library_item_id = current_library_item_id
    )
    UPDATE omnivore.library_item li
    SET highlight_annotations = h.annotation_agg
    FROM highlight_agg h
    WHERE li.id = current_library_item_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER library_item_highlight_annotations_update
AFTER INSERT OR UPDATE OR DELETE ON omnivore.highlight
FOR EACH ROW
EXECUTE FUNCTION update_library_item_highlight_annotations();

COMMIT;
