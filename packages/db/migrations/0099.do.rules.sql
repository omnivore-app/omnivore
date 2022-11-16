-- Type: DO
-- Name: rules
-- Description: Create rules table which contains user defines rules and actions

BEGIN;

CREATE TABLE omnivore.rules (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    query text NOT NULL,
    actions text NOT NULL,
    enabled boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,
);

COMMIT;
