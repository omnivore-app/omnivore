-- Type: DO
-- Name: add_event_types_to_rules
-- Description: Add event_types field to rules table

BEGIN;

ALTER TABLE omnivore.rules ADD COLUMN event_types text[] NOT NULL DEFAULT '{PAGE_CREATED,PAGE_UPDATED}';

-- Add event_types to existing rules
UPDATE omnivore.rules 
    SET 
        event_types = '{PAGE_CREATED}', filter = REPLACE (filter, 'event:created', '') 
    WHERE 
        filter LIKE '%event:created%';
UPDATE omnivore.rules 
    SET 
        event_types = '{PAGE_UPDATED}', filter = REPLACE (filter, 'event:updated', '') 
    WHERE 
        filter LIKE '%event:updated%';

COMMIT;
