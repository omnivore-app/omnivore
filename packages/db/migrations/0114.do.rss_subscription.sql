-- Type: DO
-- Name: rss_subscription
-- Description: Create a table for RSS subscriptions

BEGIN;

CREATE TABLE omnivore.rss_subscription (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    title character varying(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    image_url TEXT,
    count integer NOT NULL DEFAULT 0,
    last_updated timestamptz,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,
);

COMMIT;
