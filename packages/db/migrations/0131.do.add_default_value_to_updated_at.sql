-- Type: DO
-- Name: add_default_value_to_updated_at
-- Description: Add default = now() to updated_at field in profile, labels and highlight table

BEGIN;

UPDATE omnivore.user_profile SET updated_at = created_at WHERE updated_at IS NULL;
ALTER TABLE omnivore.user_profile 
    ALTER COLUMN updated_at SET DEFAULT current_timestamp,
    ALTER COLUMN updated_at SET NOT NULL;

UPDATE omnivore.labels SET updated_at = created_at WHERE updated_at IS NULL;
ALTER TABLE omnivore.labels
    ALTER COLUMN updated_at SET DEFAULT current_timestamp,
    ALTER COLUMN updated_at SET NOT NULL;

UPDATE omnivore.highlight SET updated_at = created_at WHERE updated_at IS NULL;
ALTER TABLE omnivore.highlight
    ALTER COLUMN updated_at SET DEFAULT current_timestamp,
    ALTER COLUMN updated_at SET NOT NULL;

COMMIT;
