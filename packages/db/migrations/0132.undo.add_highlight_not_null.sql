-- Type: UNDO
-- Name: add_highlight_not_null
-- Description: Add a not null clause to the highlight updated_at column

BEGIN;

ALTER TABLE omnivore.highlight
    ALTER COLUMN updated_at DROP NOT NULL;

COMMIT;
