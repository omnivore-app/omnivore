-- Type: DO
-- Name: add_library_item_search_indexes
-- Description: Add performance indexes for library item search and filtering operations

BEGIN;

-- Enable pg_trgm extension for fast ILIKE queries (trigram matching)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Composite index for the most common query pattern:
-- Filter by user + folder + state, then sort by saved_at
-- This covers folder tabs, state filters, and default date sorting
CREATE INDEX IF NOT EXISTS idx_library_item_user_folder_state_saved
ON omnivore.library_item (user_id, folder, state, saved_at DESC);

-- GIN indexes for trigram matching (enables fast ILIKE queries on text fields)
-- These dramatically improve full-text search performance
CREATE INDEX IF NOT EXISTS idx_library_item_title_trgm
ON omnivore.library_item USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_library_item_author_trgm
ON omnivore.library_item USING GIN (author gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_library_item_description_trgm
ON omnivore.library_item USING GIN (description gin_trgm_ops);

-- Individual indexes for sort fields
-- These enable fast sorting by different criteria
CREATE INDEX IF NOT EXISTS idx_library_item_updated_at
ON omnivore.library_item (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_library_item_published_at
ON omnivore.library_item (published_at DESC);

-- Index for state-based filtering
CREATE INDEX IF NOT EXISTS idx_library_item_state
ON omnivore.library_item (state);

-- GIN index for array operations on label_names
-- This will speed up label-based searches in the future
CREATE INDEX IF NOT EXISTS idx_library_item_label_names
ON omnivore.library_item USING GIN (label_names);

-- Add comments for documentation
COMMENT ON INDEX omnivore.idx_library_item_user_folder_state_saved IS
'Composite index for common query pattern: user + folder + state + date. Added for NestJS search optimization.';

COMMENT ON INDEX omnivore.idx_library_item_title_trgm IS
'Trigram index for fast ILIKE text search on titles. Added for NestJS search optimization.';

COMMENT ON INDEX omnivore.idx_library_item_author_trgm IS
'Trigram index for fast ILIKE text search on authors. Added for NestJS search optimization.';

COMMENT ON INDEX omnivore.idx_library_item_description_trgm IS
'Trigram index for fast ILIKE text search on descriptions. Added for NestJS search optimization.';

COMMIT;
