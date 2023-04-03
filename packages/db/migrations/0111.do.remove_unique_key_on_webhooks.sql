-- Type: DO
-- Name: remove_unique_key_on_webhooks
-- Description: Remove unique constraint of user_id and event_types on webhooks table

BEGIN;

ALTER TABLE omnivore.webhooks DROP CONSTRAINT webhooks_user_id_event_types_key;

COMMIT;
