-- Type: DO
-- Name: update_highlights_saved_search
-- Description: Update highlights saved search to use all instead of inbox

BEGIN;

UPDATE omnivore.filters 
  SET filter = 'in:all has:highlights mode:highlights' 
  WHERE name = 'Highlights' 
  AND filter = 'has:highlights mode:highlights' ;

COMMIT;
