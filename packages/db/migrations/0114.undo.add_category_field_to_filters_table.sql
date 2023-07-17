-- Type: UNDO
-- Name: add_category_field_to_filters_table
-- Description: Add category field to filters table

BEGIN;

ALTER TABLE omnivore.filters DROP COLUMN IF EXISTS category;

COMMIT;
