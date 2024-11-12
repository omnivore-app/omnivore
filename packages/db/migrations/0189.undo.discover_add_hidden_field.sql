-- Type: UNDO
-- Name: discover_add_hidden_field
-- Description: Adds the ability to hide a link from discover

BEGIN;
DROP INDEX user_to_hide_idx;
DROP TABLE IF EXISTS omnivore.discover_feed_hide_link;
COMMIT;
