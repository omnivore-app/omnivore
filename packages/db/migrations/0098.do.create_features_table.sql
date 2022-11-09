-- Type: DO
-- Name: create_features_table
-- Description: Create features table to store opt-in features by users

BEGIN;

CREATE TABLE IF NOT EXISTS omnivore.features (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    name text NOT NULL,
    granted_at timestamptz,
    expires_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,
    UNIQUE (user_id, name)
);

CREATE TRIGGER features_modtime BEFORE UPDATE ON omnivore.features
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.features TO omnivore_user;

ALTER TABLE omnivore.user_personalization
    ADD COLUMN IF NOT EXISTS speech_secondary_voice text,
    ALTER COLUMN speech_rate TYPE text,
    ALTER COLUMN speech_volume TYPE text;

COMMIT;
