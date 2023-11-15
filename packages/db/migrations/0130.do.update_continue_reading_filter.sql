-- Type: DO
-- Name: update_continue_reading_filter
-- Description: Update the filter value in the Continue Reading filter

BEGIN;

UPDATE omnivore.filters 
    SET filter = 'in:inbox sort:read-desc is:reading' 
    WHERE name = 'Continue Reading' AND default_filter = true;

COMMIT;
