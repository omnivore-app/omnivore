-- Type: UNDO
-- Name: update_continue_reading_filter
-- Description: Update the filter value in the Continue Reading filter

BEGIN;

UPDATE omnivore.filters 
    SET filter = 'in:inbox sort:read-desc is:unread' 
    WHERE name = 'Continue Reading' AND default_filter = true;

COMMIT;
