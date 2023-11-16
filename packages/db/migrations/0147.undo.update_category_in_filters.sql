-- Type: UNDO
-- Name: update_category_in_filters
-- Description: Update category column in filters table

BEGIN;

UPDATE omnivore.filters SET category = 'Search' WHERE category = 'inbox';

COMMIT;
