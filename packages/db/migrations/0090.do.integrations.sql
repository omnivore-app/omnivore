-- Type: DO
-- Name: integrations
-- Description: Create integrations table

BEGIN;

CREATE TABLE omnivore.integrations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    name varchar(50) NOT NULL,
    token varchar(255) NOT NULL,
    enabled boolean NOT NULL DEFAULT true,
    description varchar(255),
    url varchar(255),
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,
    UNIQUE (user_id, name)
);

CREATE TRIGGER update_integration_modtime BEFORE UPDATE ON omnivore.integrations
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMIT;
