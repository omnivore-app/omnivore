-- Type: UNDO
-- Name: update_highlight
-- Description: Add fields to highlight table

BEGIN;

ALTER TABLE omnivore.highlight 
    ADD COLUMN article_id uuid,
    ADD COLUMN elastic_page_id uuid,
    DROP COLUMN library_item_id,
    DROP COLUMN html,
    DROP COLUMN color,
    DROP COLUMN highlight_type,
    DROP COLUMN highlight_position_anchor_index,
    DROP COLUMN highlight_position_percent;

DROP TYPE highlight_type;

COMMIT;
