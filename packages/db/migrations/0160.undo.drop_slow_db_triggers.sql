-- Type: UNDO
-- Name: drop_slow_db_triggers
-- Description: Drop some db triggers which are slow and have cascading effect

BEGIN;

CREATE TRIGGER label_names_update
AFTER UPDATE ON omnivore.labels
FOR EACH ROW
WHEN (OLD.name <> NEW.name)
EXECUTE FUNCTION update_label_names();

CREATE TRIGGER library_item_highlight_annotations_update
AFTER INSERT OR UPDATE OR DELETE ON omnivore.highlight
FOR EACH ROW
EXECUTE FUNCTION update_library_item_highlight_annotations();

CREATE TRIGGER library_item_labels_update
AFTER INSERT OR UPDATE OR DELETE ON omnivore.entity_labels
FOR EACH ROW
EXECUTE FUNCTION update_library_item_labels();

COMMIT;
