-- Type: DO
-- Name: service_usage
-- Description: Create table for tracking service usage and enforce limit

BEGIN;

ALTER TABLE omnivore.received_emails
    ADD COLUMN reply_to TEXT,
    ADD COLUMN reply TEXT;

CREATE TABLE omnivore.subscription_plan (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    max_emails_sent_per_day INT NOT NULL,
    created_at timestamptz NOT NULL default current_timestamp
);

INSERT INTO omnivore.subscription_plan (id, name, description, max_emails_sent_per_day)
VALUES (1, 'Basic', 'Basic plan', 3);

CREATE TABLE omnivore.service_usage (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user,
    action VARCHAR(255) NOT NULL,
    created_at timestamptz NOT NULL default current_timestamp
);

CREATE INDEX ON omnivore.service_usage (user_id);

ALTER TABLE omnivore.service_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_usage_policy on omnivore.service_usage
    USING (user_id = omnivore.get_current_user_id())
    WITH CHECK (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT ON omnivore.service_usage TO omnivore_user;

COMMIT;
