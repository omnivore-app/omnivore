-- Type: DO
-- Name: create_index_for_foreign_key
-- Description: Create index for foreign keys on entity_label and highlight tables

BEGIN;

CREATE INDEX IF NOT EXISTS entity_labels_library_item_id_idx ON omnivore.entity_labels(library_item_id)
CREATE INDEX IF NOT EXISTS entity_labels_highlight_id_idx ON omnivore.entity_labels(highlight_id);

CREATE INDEX IF NOT EXISTS highlight_library_item_id_idx ON omnivore.highlight (library_item_id);

COMMIT;
