-- Type: DO
-- Name: search_history
-- Description: Create search_history table which contains searched keyword and timestamp

BEGIN;

CREATE TABLE omnivore.search_history (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    term VARCHAR(255) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp
);

CREATE TRIGGER search_history_modtime BEFORE UPDATE ON omnivore.search_history FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMIT;
