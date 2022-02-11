-- Type: DO
-- Name: user_personalization_library_sort_order
-- Description: Add "library_sort_order" field to the user_personalization table

BEGIN;

ALTER TABLE omnivore.user_personalization 
    ADD column library_sort_order text;

COMMIT;
