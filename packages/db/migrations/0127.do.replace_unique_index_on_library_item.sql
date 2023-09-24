-- Type: DO
-- Name: replace_unique_index_on_library_item
-- Description: Create a unique index of MD5 hashed url and userId on library item table

BEGIN;

ALTER TABLE omnivore.library_item DROP CONSTRAINT IF EXISTS library_item_user_id_original_url_key;
CREATE UNIQUE INDEX library_item_user_id_hashed_original_url_key ON omnivore.library_item (user_id, md5(original_url));

COMMIT;
