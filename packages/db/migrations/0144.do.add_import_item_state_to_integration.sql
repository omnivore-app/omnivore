-- Type: DO
-- Name: add_import_item_state_to_integration
-- Description: Add import_item_state column to integration table

BEGIN;

CREATE type import_item_state_type AS ENUM (
    'UNREAD',
    'UNARCHIVED',
    'ARCHIVED',
    'ALL'
);

ALTER TABLE omnivore.integrations ADD COLUMN import_item_state import_item_state_type;

COMMIT;
