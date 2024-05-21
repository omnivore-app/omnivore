-- Type: UNDO
-- Name: public_item
-- Description: Create a table for public items

BEGIN;

DROP TABLE omnivore.public_item_interactions;
DROP TABLE omnivore.public_item_stats;
DROP TABLE omnivore.public_item_features;
DROP TABLE omnivore.public_item;
DROP TABLE omnivore.public_item_source;

COMMIT;
