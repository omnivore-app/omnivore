-- Type: DO
-- Name: add_position_to_labels
-- Description: Add position column to labels table

BEGIN;

ALTER TABLE omnivore.labels ADD COLUMN position integer NOT NULL DEFAULT 0;

WITH positions AS (
    SELECT
        id, row_number() OVER (PARTITION BY user_id ORDER BY name) as row_num
    FROM
        omnivore.labels
) UPDATE
      omnivore.labels
  SET
      position = positions.row_num
  FROM
      positions
  WHERE
      omnivore.labels.id = positions.id;

CREATE OR REPLACE FUNCTION update_label_position()
    RETURNS TRIGGER AS $$
    DECLARE
        new_position INTEGER;
    BEGIN
        IF (TG_OP = 'DELETE') THEN
            UPDATE omnivore.labels SET position = position - 1 WHERE user_id = OLD.user_id AND position > OLD.position;
            RETURN OLD;
        ELSIF (TG_OP = 'INSERT') THEN
            SELECT COALESCE(MAX(position), 0) + 1 INTO new_position FROM omnivore.labels WHERE user_id = NEW.user_id;
            NEW.position = new_position;
            RETURN NEW;
        END IF;
    END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER increment_label_position
    BEFORE INSERT ON omnivore.labels
    FOR EACH ROW
    EXECUTE FUNCTION update_label_position();

CREATE TRIGGER decrement_label_position
    AFTER DELETE ON omnivore.labels
    FOR EACH ROW
EXECUTE FUNCTION update_label_position();

COMMIT;
