-- Type: UNDO
-- Name: add_event_types_to_rules
-- Description: Add event_types field to rules table

BEGIN;

UPDATE omnivore.rules 
    SET 
        filter = CONCAT ('event:created ', filter) 
    WHERE 
        'PAGE_CREATED' = ALL (event_types);
UPDATE omnivore.rules 
    SET 
        filter = CONCAT ('event:updated ', filter) 
    WHERE 
        'PAGE_UPDATED' = ALL (event_types);

ALTER TABLE omnivore.rules DROP COLUMN event_types;

COMMIT;
