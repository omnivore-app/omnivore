-- Type: DO
-- Name: user_personalization_library_layout_type
-- Description: Add "library_layout_type" field to the user_personalization table

BEGIN;

ALTER TABLE omnivore.user_personalization 
    ADD column library_layout_type text;

COMMIT;
