-- Type: UNDO
-- Name: api_key_index
-- Description: Create an index for checking key in api_key table

BEGIN;

DROP INDEX IF EXISTS omnivore.api_key_key_idx;

COMMIT;
