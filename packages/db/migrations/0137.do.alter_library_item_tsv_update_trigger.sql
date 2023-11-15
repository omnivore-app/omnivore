-- Type: DO
-- Name: alter_library_item_tsv_update_trigger
-- Description: Alter library_item_tsv_update trigger on omnivore.library_item table to add conditions

BEGIN;

DROP TRIGGER IF EXISTS library_item_tsv_update ON omnivore.library_item;

CREATE TRIGGER library_item_tsv_update
    BEFORE INSERT OR UPDATE OF readable_content, site_name, title, author, description, note, highlight_annotations
    ON omnivore.library_item
    FOR EACH ROW
    EXECUTE PROCEDURE update_library_item_tsv();

COMMIT;
