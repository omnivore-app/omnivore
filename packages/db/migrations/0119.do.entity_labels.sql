-- Type: DO
-- Name: entity_labels
-- Description: Create table entity_labels

BEGIN;

CREATE TABLE omnivore.entity_labels (
    library_item_id uuid REFERENCES omnivore.library_item(id) ON DELETE CASCADE,
    highlight_id uuid REFERENCES omnivore.highlight(id) ON DELETE CASCADE,
    label_id uuid NOT NULL REFERENCES omnivore.labels(id) ON DELETE CASCADE,
    PRIMARY KEY (library_item_id, highlight_id, label_id)
);

COMMIT;
