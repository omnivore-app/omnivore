-- Type: UNDO
-- Name: add_shortcuts_to_user_personalization
-- Description: Add a new shortcuts column to the user personalization table

BEGIN;

ALTER TABLE omnivore.user_personalization DROP COLUMN shortcuts ;

COMMIT;
