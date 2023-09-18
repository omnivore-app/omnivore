-- Type: UNDO
-- Name: update_highlight
-- Description: Add fields to highlight table

BEGIN;

DROP TRIGGER IF EXISTS library_item_highlight_annotations_update ON omnivore.highlight;
DROP FUNCTION IF EXISTS update_library_item_highlight_annotations();

DROP POLICY delete_highlight on omnivore.highlight;
REVOKE DELETE ON omnivore.highlight FROM omnivore_user;

ALTER TABLE omnivore.highlight 
    ADD COLUMN deleted boolean DEFAULT false,
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
