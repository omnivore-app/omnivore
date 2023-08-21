-- Type: UNDO
-- Name: library_item
-- Description: Create library_item table

BEGIN;

DROP TRIGGER update_library_item_modtime ON omnivore.library_item;

DROP TABLE omnivore.library_item;

DROP TYPE content_reader_type;

DROP TYPE library_item_state;

DROP EXTENSION vector;

COMMIT;
