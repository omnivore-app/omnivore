-- Type: DO
-- Name: fix_labels_updated_at_default
-- Description: Add default value to labels.updated_at column

BEGIN;

-- Set default value for updated_at column
ALTER TABLE omnivore.labels
  ALTER COLUMN updated_at SET DEFAULT current_timestamp;

-- Update existing NULL values to created_at
UPDATE omnivore.labels
SET updated_at = created_at
WHERE updated_at IS NULL;

-- Make the column NOT NULL now that all values are set
ALTER TABLE omnivore.labels
  ALTER COLUMN updated_at SET NOT NULL;

COMMIT;
