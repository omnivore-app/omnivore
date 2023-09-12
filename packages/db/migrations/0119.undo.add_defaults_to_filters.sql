-- Type: UNDO
-- Name: add_defaults_to_filters
-- Description: Add Defaults to Filters
BEGIN;

ALTER TABLE omnivore.filters
    DROP COLUMN default,
    DROP COLUMN visible;

COMMIT;
