-- Type: UNDO
-- Name: add_import_item_state_to_integration
-- Description: Add import_item_state column to integration table

BEGIN;

ALTER TABLE omnivore.integrations DROP COLUMN IF EXISTS import_item_state;

DROP TYPE IF EXISTS import_item_state_type;

COMMIT;
