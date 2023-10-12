-- Type: DO
-- Name: remove_highlight_position_not_nulls
-- Description: Remove not null on position info for highlights

BEGIN;

ALTER TABLE omnivore.highlight
    ALTER COLUMN highlight_position_percent DROP NOT NULL;

ALTER TABLE omnivore.highlight
    ALTER COLUMN highlight_position_anchor_index DROP NOT NULL;


ALTER TABLE omnivore.highlight
    ALTER COLUMN highlight_position_percent SET DEFAULT NULL;

ALTER TABLE omnivore.highlight
    ALTER COLUMN highlight_position_anchor_index SET DEFAULT NULL;

COMMIT;
