-- Type: UNDO
-- Name: library_item
-- Description: Create library_item table

BEGIN;

DROP TRIGGER library_item_tsv_update ON omnivore.library_item;
DROP FUNCTION update_library_item_tsv();

DROP INDEX omnivore.library_item_note_tsv_idx;
DROP INDEX omnivore.library_item_search_tsv_idx;
DROP INDEX omnivore.library_item_description_tsv_idx;
DROP INDEX omnivore.library_item_author_tsv_idx;
DROP INDEX omnivore.library_item_title_tsv_idx;
DROP INDEX omnivore.library_item_site_tsv_idx;
DROP INDEX omnivore.library_item_content_tsv_idx;

DROP TRIGGER update_library_item_modtime ON omnivore.library_item;
DROP TABLE omnivore.library_item;
DROP TYPE directionality_type;
DROP TYPE content_reader_type;
DROP TYPE library_item_state;

DROP EXTENSION vector;

COMMIT;
