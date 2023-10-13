-- Type: UNDO
-- Name: Rename site to site_name
-- Description: Rename the site_tsv column to site_name_tsv to make it more consistent

BEGIN;

ALTER TABLE omnivore.library_item RENAME COLUMN site_name_tsv TO site_tsv ;

COMMIT;
