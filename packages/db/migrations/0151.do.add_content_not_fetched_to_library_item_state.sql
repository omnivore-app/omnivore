-- Type: DO
-- Name: add_content_not_fetched_to_library_item_state
-- Description: Add CONTENT_NOT_FETCHED to the library_item_state enum

BEGIN;

ALTER TYPE library_item_state ADD VALUE IF NOT EXISTS 'CONTENT_NOT_FETCHED';

COMMIT;
