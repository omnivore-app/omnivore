-- Type: DO
-- Name: add_digest_config_to_user_personalization
-- Description: Add digest_config json column to the user_personalization table

BEGIN;

ALTER TABLE omnivore.user_personalization ADD COLUMN digest_config jsonb;

COMMIT;
