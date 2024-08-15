-- Type: DO
-- Name: labels_index_on_library_item
-- Description: Add index on labels columns to library_item tables for better performance

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_library_item_state_label_names ON omnivore.library_item USING GIN (lower(array_cat(label_names, highlight_labels)::text));
