-- Type: DO
-- Name: rules
-- Description: Create rules table which contains user defines rules and actions

BEGIN;

CREATE TABLE omnivore.rules (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    description text,
    query text NOT NULL,
    actions json NOT NULL, -- array of actions of type {type: 'action_type', params: [action_params]}
    enabled boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp
);

CREATE TRIGGER rules_modtime BEFORE UPDATE ON omnivore.rules
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.rules TO omnivore_user;

COMMIT;
