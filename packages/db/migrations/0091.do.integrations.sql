-- Type: DO
-- Name: integrations
-- Description: Create integrations table

BEGIN;

CREATE TYPE omnivore.integration_type AS ENUM ('READWISE');

CREATE TABLE omnivore.integrations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    "type" omnivore.integration_type NOT NULL,
    token varchar(255) NOT NULL,
    "enabled" boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,
    synced_at timestamptz,
    task_name text,
    UNIQUE (user_id, "type")
);

CREATE TRIGGER update_integration_modtime BEFORE UPDATE ON omnivore.integrations
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMIT;
