-- Type: UNDO
-- Name: create_index_for_foreign_key
-- Description: Create index for foreign keys on entity_label and highlight tables

BEGIN;

DROP INDEX IF EXISTS highlight_library_item_id_idx;

DROP INDEX IF EXISTS entity_labels_highlight_id_idx;
DROP INDEX IF EXISTS entity_labels_library_item_id_idx;

COMMIT;
