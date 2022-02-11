-- Type: DO
-- Name: user_device_tokens
-- Description: Create user_device_tokens table

BEGIN;

CREATE TABLE omnivore.user_device_tokens (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    token text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT current_timestamp
);

ALTER TABLE omnivore.user_device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_user_device_tokens on omnivore.user_device_tokens
    FOR SELECT TO omnivore_user
    USING (true);

CREATE POLICY create_user_device_tokens on omnivore.user_device_tokens
    FOR INSERT TO omnivore_user
    WITH CHECK (true);

CREATE POLICY delete_user_device_tokens on omnivore.user_device_tokens
    FOR DELETE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, DELETE ON omnivore.user_device_tokens TO omnivore_user;

COMMIT;
