-- Type: DO
-- Name: add_position_to_labels
-- Description: Add position column to labels table

BEGIN;

ALTER TABLE omnivore.labels ADD COLUMN position INTEGER NOT NULL DEFAULT 0;

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

ALTER TABLE omnivore.labels ADD constraint labels_position_user_id_unique UNIQUE(user_id, position);

COMMIT;
