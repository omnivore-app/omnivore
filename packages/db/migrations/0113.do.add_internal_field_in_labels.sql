-- Type: DO
-- Name: add_internal_field_in_labels
-- Description: Add a new boolean field internal in labels table and set it to true for newsletters and favorites

BEGIN;

ALTER TABLE omnivore.labels ADD COLUMN internal boolean NOT NULL DEFAULT false;

UPDATE omnivore.labels SET internal = true WHERE LOWER(name) = 'newsletters' OR LOWER(name) = 'favorites';

COMMIT;
