-- Type: UNDO
-- Name: update_label_library_internal
-- Description: Update labels table and change labels with name library to internal

BEGIN;

UPDATE omnivore.labels SET internal = false WHERE LOWER(name) = 'library';

COMMIT;
