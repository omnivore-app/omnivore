-- Type: DO
-- Name: add_category_field_to_filters_table
-- Description: Add category field to filters table

BEGIN;

ALTER TABLE omnivore.filters ADD COLUMN category VARCHAR(255) NOT NULL;

COMMIT;
