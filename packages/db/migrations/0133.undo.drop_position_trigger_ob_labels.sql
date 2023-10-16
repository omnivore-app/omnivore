-- Type: UNDO
-- Name: drop_position_trigger_ob_labels
-- Description: Drop increment_label_position and decrement_label_position trigger on omnivore.labels table

BEGIN;

CREATE TRIGGER decrement_label_position
    AFTER DELETE ON omnivore.labels
    FOR EACH ROW
EXECUTE FUNCTION update_label_position();

CREATE TRIGGER increment_label_position
    BEFORE INSERT ON omnivore.labels
    FOR EACH ROW
    EXECUTE FUNCTION update_label_position();

COMMIT;
