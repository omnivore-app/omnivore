-- Type: UNDO
-- Name: user_personalization_library_layout_type
-- Description: Add "library_layout_type" field to the user_personalization table

BEGIN;

ALTER TABLE omnivore.user_personalization
    DROP column library_layout_type;

COMMIT;
