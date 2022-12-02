-- Type: UNDO
-- Name: search_filters
-- Description: Create search_filters table

BEGIN;

DROP FUNCTION IF EXISTS update_filter_position;

DROP TABLE IF EXISTS omnivore.filters;

COMMIT;
