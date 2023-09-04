-- Type: UNDO
-- Name: add_rls
-- Description: Add RLS to the tables

BEGIN;

ALTER TABLE omnivore.api_key DISABLE ROW LEVEL SECURITY;
DROP POLICY read_api_key on omnivore.api_key;
DROP POLICY create_api_key on omnivore.api_key;
DROP POLICY update_api_key on omnivore.api_key;
DROP POLICY delete_api_key on omnivore.api_key;
REVOKE SELECT, INSERT, UPDATE, DELETE ON omnivore.api_key FROM omnivore_user;

ALTER TABLE omnivore.features DISABLE ROW LEVEL SECURITY;
DROP POLICY read_features on omnivore.features;
DROP POLICY create_features on omnivore.features;
DROP POLICY update_features on omnivore.features;
DROP POLICY delete_features on omnivore.features;
REVOKE SELECT, INSERT, UPDATE, DELETE ON omnivore.features FROM omnivore_user;

ALTER TABLE omnivore.filters DISABLE ROW LEVEL SECURITY;
DROP POLICY read_filters on omnivore.filters;
DROP POLICY create_filters on omnivore.filters;
DROP POLICY update_filters on omnivore.filters;
DROP POLICY delete_filters on omnivore.filters;
REVOKE SELECT, INSERT, UPDATE, DELETE ON omnivore.filters FROM omnivore_user;

ALTER TABLE omnivore.integrations DISABLE ROW LEVEL SECURITY;
DROP POLICY read_integrations on omnivore.integrations;
DROP POLICY create_integrations on omnivore.integrations;
DROP POLICY update_integrations on omnivore.integrations;
DROP POLICY delete_integrations on omnivore.integrations;
REVOKE SELECT, INSERT, UPDATE, DELETE ON omnivore.integrations FROM omnivore_user;

ALTER TABLE omnivore.newsletter_emails DISABLE ROW LEVEL SECURITY;
DROP POLICY read_newsletter_emails on omnivore.newsletter_emails;
DROP POLICY create_newsletter_emails on omnivore.newsletter_emails;
DROP POLICY delete_newsletter_emails on omnivore.newsletter_emails;
REVOKE SELECT, INSERT, DELETE ON omnivore.newsletter_emails FROM omnivore_user;

ALTER POLICY read_labels on omnivore.labels USING (true);
ALTER POLICY create_labels on omnivore.labels WITH CHECK (true);

ALTER TABLE omnivore.received_emails DISABLE ROW LEVEL SECURITY;
DROP POLICY read_received_emails on omnivore.received_emails;
DROP POLICY create_received_emails on omnivore.received_emails;
DROP POLICY update_received_emails on omnivore.received_emails;
DROP POLICY delete_received_emails on omnivore.received_emails;
REVOKE SELECT, INSERT, UPDATE, DELETE ON omnivore.received_emails FROM omnivore_user;

ALTER TABLE omnivore.rules DISABLE ROW LEVEL SECURITY;
DROP POLICY read_rules on omnivore.rules;
DROP POLICY create_rules on omnivore.rules;
DROP POLICY update_rules on omnivore.rules;
DROP POLICY delete_rules on omnivore.rules;
REVOKE SELECT, INSERT, UPDATE, DELETE ON omnivore.rules FROM omnivore_user;

ALTER TABLE omnivore.subscriptions DISABLE ROW LEVEL SECURITY;
DROP POLICY read_subscriptions on omnivore.subscriptions;
DROP POLICY create_subscriptions on omnivore.subscriptions;
DROP POLICY update_subscriptions on omnivore.subscriptions;
DROP POLICY delete_subscriptions on omnivore.subscriptions;
REVOKE SELECT, INSERT, UPDATE, DELETE ON omnivore.subscriptions FROM omnivore_user;

ALTER TABLE omnivore.upload_files DISABLE ROW LEVEL SECURITY;
DROP POLICY read_upload_files on omnivore.upload_files;
DROP POLICY create_upload_files on omnivore.upload_files;
DROP POLICY update_upload_files on omnivore.upload_files;
DROP POLICY delete_upload_files on omnivore.upload_files;
REVOKE SELECT, INSERT, UPDATE, DELETE ON omnivore.upload_files FROM omnivore_user;

ALTER TABLE omnivore.webhooks DISABLE ROW LEVEL SECURITY;
DROP POLICY read_webhooks on omnivore.webhooks;
DROP POLICY create_webhooks on omnivore.webhooks;
DROP POLICY update_webhooks on omnivore.webhooks;
DROP POLICY delete_webhooks on omnivore.webhooks;
REVOKE SELECT, INSERT, UPDATE, DELETE ON omnivore.webhooks FROM omnivore_user;

ALTER POLICY read_user_device_tokens on omnivore.user_device_tokens
    FOR SELECT FROM omnivore_user
    USING (true);

ALTER POLICY create_user_device_tokens on omnivore.user_device_tokens
    FOR INSERT FROM omnivore_user
    WITH CHECK (true);

ALTER TABLE omnivore.search_history DISABLE ROW LEVEL SECURITY;
DROP POLICY read_search_history on omnivore.search_history;
DROP POLICY create_search_history on omnivore.search_history;
DROP POLICY update_search_history on omnivore.search_history;
DROP POLICY delete_search_history on omnivore.search_history;

ALTER TABLE omnivore.abuse_report 
    ALTER COLUMN library_item_id RENAME TO elastic_page_id,
    ADD COLUMN page_id text;
ALTER TABLE omnivore.content_display_report 
    ALTER COLUMN library_item_id RENAME TO elastic_page_id,
    ADD COLUMN page_id text;

COMMIT;
