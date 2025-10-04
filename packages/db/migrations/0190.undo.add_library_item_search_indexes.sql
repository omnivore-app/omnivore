-- Type: UNDO
-- Name: add_library_item_search_indexes
-- Description: Remove library item search performance indexes

BEGIN;

-- Drop all indexes created in the DO migration
DROP INDEX IF EXISTS omnivore.idx_library_item_user_folder_state_saved;
DROP INDEX IF EXISTS omnivore.idx_library_item_title_trgm;
DROP INDEX IF EXISTS omnivore.idx_library_item_author_trgm;
DROP INDEX IF EXISTS omnivore.idx_library_item_description_trgm;
DROP INDEX IF EXISTS omnivore.idx_library_item_updated_at;
DROP INDEX IF EXISTS omnivore.idx_library_item_published_at;
DROP INDEX IF EXISTS omnivore.idx_library_item_state;
DROP INDEX IF EXISTS omnivore.idx_library_item_label_names;

COMMIT;
