-- Type: DO
-- Name: api_key_index
-- Description: Create an index for checking key in api_key table

CREATE INDEX CONCURRENTLY IF NOT EXISTS api_key_key_idx ON omnivore.api_key (key);
