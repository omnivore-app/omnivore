-- Type: UNDO
-- Name: library_item_preview
-- Description: Create library_item_preview table

BEGIN;

DROP TRIGGER update_library_item_preview_modtime;

DROP TABLE omnivore.library_item_preview;

COMMIT;
