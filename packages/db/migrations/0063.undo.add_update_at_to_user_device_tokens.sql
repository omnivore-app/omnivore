-- Type: UNDO
-- Name: add_update_at_to_user_device_tokens
-- Description: Add update_at field to user_device_tokens table

BEGIN;

ALTER TABLE omnivore.user_device_tokens
    DROP COLUMN updated_at,
    DROP CONSTRAINT token_unique;

DROP TRIGGER user_device_tokens_modtime ON omnivore.user_device_tokens;

COMMIT;
