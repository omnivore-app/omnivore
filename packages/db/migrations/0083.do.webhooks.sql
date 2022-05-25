-- Type: DO
-- Name: webhooks
-- Description: webhooks model

BEGIN;

CREATE TABLE omnivore.webhooks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    url text NOT NULL,
    method text NOT NULL DEFAULT 'POST',
    content_type text NOT NULL DEFAULT 'application/json',
    active boolean NOT NULL DEFAULT true,
    event_types text[] NOT NULL,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,
    UNIQUE (user_id, event_types)
);

CREATE TRIGGER update_webhook_modtime BEFORE UPDATE ON omnivore.webhooks
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMIT;
