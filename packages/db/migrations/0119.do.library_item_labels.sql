-- Type: DO
-- Name: library_item_labels
-- Description: Create table library_item_labels

BEGIN;

CREATE TABLE omnivore.library_item_labels (
    library_item_id uuid NOT NULL REFERENCES omnivore.library_item(id) ON DELETE CASCADE,
    label_id uuid NOT NULL REFERENCES omnivore.labels(id) ON DELETE CASCADE,
    PRIMARY KEY (library_item_id, label_id)
);

COMMIT;
