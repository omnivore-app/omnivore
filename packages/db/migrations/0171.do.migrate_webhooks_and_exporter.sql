-- Type: DO
-- Name: migrate_webhooks_and_exporter
-- Description: Migrate data from webhooks and exporters to rules

BEGIN;

-- Migrate webhooks to rules
INSERT INTO omnivore.rules (user_id, name, filter, actions, enabled, created_at, updated_at, event_types)
SELECT user_id, 'webhook', 'in:all', jsonb_build_array(jsonb_build_object('type', 'WEBHOOK', 'params', jsonb_build_array(url))), enabled, created_at, updated_at, event_types
FROM omnivore.webhooks;

-- Migrate exporters to rules
INSERT INTO omnivore.rules (user_id, name, filter, actions, enabled, created_at, updated_at, event_types)
SELECT user_id, 'export', 'in:all', jsonb_build_array(jsonb_build_object('type', 'EXPORT', 'params', jsonb_build_array(name))), enabled, created_at, updated_at, '{PAGE_CREATED,PAGE_UPDATED,HIGHLIGHT_CREATED,HIGHLIGHT_UPDATED,LABEL_CREATED}'
FROM omnivore.integrations
WHERE type = 'EXPORT';

COMMIT;
