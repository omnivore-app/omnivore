-- Type: UNDO
-- Name: user_full_names
-- Description: Move from first + last name to fullnames in the user database

BEGIN;

-- Remove the fullname column from the user table
ALTER TABLE omnivore.user DROP COLUMN full_name;

COMMIT;
