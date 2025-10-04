-- Type: UNDO
-- Name: fix_labels_updated_at_default
-- Description: Remove default value from labels.updated_at column

BEGIN;

-- Remove NOT NULL constraint
ALTER TABLE omnivore.labels
  ALTER COLUMN updated_at DROP NOT NULL;

-- Remove default value
ALTER TABLE omnivore.labels
  ALTER COLUMN updated_at DROP DEFAULT;

COMMIT;
