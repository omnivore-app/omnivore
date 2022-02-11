-- Type: DO
-- Name: user_full_names
-- Description: Move from first + last name to fullnames in the user database

BEGIN;

-- Add a name column to the users table and migrate
-- from first + last name to name.
-- In a seperate migration later we will drop the 
-- first + last name columns.
ALTER TABLE omnivore.user ADD COLUMN name TEXT;
UPDATE omnivore.user SET name = concat(first_name, ' ', last_name);
ALTER TABLE omnivore.user ALTER COLUMN name SET NOT NULL;

COMMIT;
