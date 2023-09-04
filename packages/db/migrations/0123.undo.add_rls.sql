-- Type: UNDO
-- Name: add_rls
-- Description: Add RLS to the tables

BEGIN;

ALTER TABLE omnivore.features DISABLE ROW LEVEL SECURITY;
DROP POLICY features_policy on omnivore.features;

ALTER TABLE omnivore.filters DISABLE ROW LEVEL SECURITY;
DROP POLICY filters_policy on omnivore.filters;

ALTER TABLE omnivore.integrations DISABLE ROW LEVEL SECURITY;
DROP POLICY integrations_policy on omnivore.integrations;

ALTER TABLE omnivore.newsletter_emails DISABLE ROW LEVEL SECURITY;
DROP POLICY newsletter_emails_policy on omnivore.newsletter_emails;

DROP POLICY labels_policy on omnivore.labels;

ALTER TABLE omnivore.received_emails DISABLE ROW LEVEL SECURITY;
DROP POLICY received_emails_policy on omnivore.received_emails;

ALTER TABLE omnivore.rules DISABLE ROW LEVEL SECURITY;
DROP POLICY rules_policy on omnivore.rules;

ALTER TABLE omnivore.webhooks DISABLE ROW LEVEL SECURITY;
DROP POLICY webhooks_policy on omnivore.webhooks;

DROP POLICY user_device_tokens_policy on omnivore.user_device_tokens;

ALTER TABLE omnivore.search_history DISABLE ROW LEVEL SECURITY;
DROP POLICY search_history_policy on omnivore.search_history;

ALTER TABLE omnivore.abuse_report RENAME COLUMN library_item_id TO elastic_page_id;
ALTER TABLE omnivore.abuse_report ADD COLUMN page_id text;
ALTER TABLE omnivore.content_display_report RENAME COLUMN library_item_id TO elastic_page_id;
ALTER TABLE omnivore.content_display_report ADD COLUMN page_id text;

COMMIT;
