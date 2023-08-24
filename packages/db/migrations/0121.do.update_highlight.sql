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
    ADD COLUMN highlight_position_percent real NOT NULL DEFAULT 0,
    ADD COLUMN highlight_position_anchor_index integer NOT NULL DEFAULT 0,
    ADD COLUMN highlight_type highlight_type NOT NULL DEFAULT 'HIGHLIGHT',
    ADD COLUMN color text,
    ADD COLUMN html text;

COMMIT;
