-- Type: UNDO
-- Name: remove_highlight_position_not_nulls
-- Description: Remove not null on position info for highlights

BEGIN;

ALTER TABLE omnivore.highlight
    ALTER COLUMN highlight_position_percent SET DEFAULT 0;
UPDATE omnivore.highlight set highlight_position_percent = 0 where highlight_position_percent is null ;
ALTER TABLE omnivore.highlight
    ALTER COLUMN highlight_position_percent DROP NOT NULL;


ALTER TABLE omnivore.highlight
    ALTER COLUMN highlight_position_anchor_index SET DEFAULT 0;
UPDATE omnivore.highlight set highlight_position_anchor_index = 0 where highlight_position_anchor_index is null ;
ALTER TABLE omnivore.highlight
    ALTER COLUMN highlight_position_anchor_index DROP NOT NULL;

COMMIT;
