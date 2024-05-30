-- Type: DO
-- Name: create_home_feedback
-- Description: Create a table for user feedback of the Home feed

BEGIN;

CREATE TYPE omnivore.feedback_type_enum AS ENUM ('MORE', 'LESS');

CREATE TABLE IF NOT EXISTS omnivore.home_feedback (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user(id) ON DELETE CASCADE,
    site TEXT,
    author TEXT,
    subscription TEXT,
    feedback_type omnivore.feedback_type_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, subscription, feedback_type),
    UNIQUE (user_id, author, feedback_type),
    UNIQUE (user_id, site, feedback_type)
);

CREATE POLICY home_feedback_policy on omnivore.home_feedback
    USING (user_id = omnivore.get_current_user_id())
    WITH CHECK (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT ON omnivore.home_feedback TO omnivore_user;


COMMIT;
