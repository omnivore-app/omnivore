-- Type: DO
-- Name: update_category_in_filters
-- Description: Update category column in filters table

BEGIN;

UPDATE omnivore.filters SET category = 'inbox' WHERE category = 'Search';

COMMIT;
