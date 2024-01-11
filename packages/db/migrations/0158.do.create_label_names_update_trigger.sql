-- Type: DO
-- Name: create_label_names_update_trigger
-- Description: Create label_names_update trigger in library_item table

BEGIN;

CREATE OR REPLACE FUNCTION update_label_names()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE omnivore.library_item
    SET label_names = array_replace(label_names, OLD.name, NEW.name)
    WHERE user_id = OLD.user_id AND OLD.name = ANY(label_names);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- triggers when label name is updated
CREATE TRIGGER label_names_update
AFTER UPDATE ON omnivore.labels
FOR EACH ROW
WHEN (OLD.name <> NEW.name)
EXECUTE FUNCTION update_label_names();

-- remove old trigger which is too slow
DROP TRIGGER IF EXISTS entity_labels_update ON omnivore.labels;

DROP FUNCTION IF EXISTS omnivore.update_entity_labels();

DROP INDEX IF EXISTS omnivore.library_item_saved_at_idx;
DROP INDEX IF EXISTS omnivore.library_item_updated_at_idx;
DROP INDEX IF EXISTS omnivore.library_item_read_at_idx;;

COMMIT;
