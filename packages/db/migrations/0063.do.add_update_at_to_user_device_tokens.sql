-- Type: DO
-- Name: add_update_at_to_user_device_tokens
-- Description: Add update_at field to user_device_tokens table

BEGIN;

ALTER TABLE omnivore.user_device_tokens
    ADD COLUMN updated_at timestamptz NOT NULL default current_timestamp,
    ADD CONSTRAINT token_unique UNIQUE (token);

CREATE TRIGGER user_device_tokens_modtime BEFORE UPDATE ON omnivore.user_device_tokens FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMIT;
