-- Type: DO
-- Name: add_discovery
-- Description: Add Discovery Tables, including counts.

BEGIN;

ALTER TABLE omnivore.user_personalization ADD COLUMN fields json;

COMMIT;
