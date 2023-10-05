-- Type: UNDO
-- Name: add_recommender_names_to_library_item
-- Description: Add recommender names field to library item table

BEGIN;

DROP TRIGGER IF EXISTS library_item_recommenders_update ON omnivore.recommendation;
DROP FUNCTION IF EXISTS update_library_item_recommenders();

ALTER TABLE omnivore.library_item DROP COLUMN recommender_names;

COMMIT;
