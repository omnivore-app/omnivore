-- Type: DO
-- Name: add_domain_to_search_index
-- Description: Add the site's domain to the search index

BEGIN;

CREATE OR REPLACE FUNCTION update_page_tsv() RETURNS trigger AS $$
begin
  new.tsv :=
    setweight(to_tsvector('pg_catalog.english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('pg_catalog.english', coalesce(new.author, '')), 'A') ||
    setweight(to_tsvector('pg_catalog.english', coalesce(new.description,'')), 'A') ||
    -- full hostname (eg www.omnivore.app)
    setweight(to_tsvector('pg_catalog.english', coalesce(regexp_replace(new.url, '^((http[s]?):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$', '\3'), '')), 'A') ||
    -- secondary hostname (eg omnivore)
    setweight(to_tsvector('pg_catalog.english', coalesce(regexp_replace(new.url, '^((http[s]?):\/)?\/?(.*\.)?([^:\/\s]+)(\..*)((\/+)*\/)?([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$', '\4'), '')), 'A') ||
    setweight(to_tsvector('pg_catalog.english', coalesce(new.content,'')), 'B');
  return new;
end
$$ LANGUAGE plpgsql;

CREATE article_tsv_update BEFORE INSERT OR UPDATE
    ON omnivore.pages FOR EACH ROW EXECUTE PROCEDURE update_page_tsv();

-- rename to page* since we aren't using Article naming anymore
ALTER TRIGGER article_tsv_update ON omnivore.pages RENAME TO page_tsv_update;

COMMIT;

BEGIN;
-- This will force all the text vectors to be 
-- recreated.
-- We need to do it in a separate transaction 
-- block though, otherwise the trigger wont be
-- executed on update.
UPDATE omnivore.pages SET updated_at = NOW();
COMMIT;