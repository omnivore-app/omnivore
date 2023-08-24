-- Type: DO
-- Name: recommendation
-- Description: Create recommendation table

BEGIN;

CREATE TABLE omnivore.recommendation (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    library_item_id uuid NOT NULL REFERENCES omnivore.library_item ON DELETE CASCADE,
    recommender_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    note text,
    created_at timestamptz NOT NULL DEFAULT current_timestamp
);

COMMIT;
