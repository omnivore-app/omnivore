-- Type: DO
-- Name: add_rls
-- Description: Add RLS to the tables

BEGIN;

ALTER TABLE omnivore.api_key ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_api_key on omnivore.api_key
  FOR SELECT TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

CREATE POLICY create_api_key on omnivore.api_key
    FOR INSERT TO omnivore_user
    WITH CHECK (user_id = omnivore.get_current_user_id());

CREATE POLICY update_api_key on omnivore.api_key
    FOR UPDATE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

CREATE POLICY delete_api_key on omnivore.api_key
    FOR DELETE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.api_key TO omnivore_user;

ALTER TABLE omnivore.features ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_features on omnivore.features
  FOR SELECT TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

CREATE POLICY create_features on omnivore.features
    FOR INSERT TO omnivore_user
    WITH CHECK (user_id = omnivore.get_current_user_id());

CREATE POLICY update_features on omnivore.features
    FOR UPDATE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

CREATE POLICY delete_features on omnivore.features
    FOR DELETE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.features TO omnivore_user;

ALTER TABLE omnivore.filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_filters on omnivore.filters
  FOR SELECT TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

CREATE POLICY create_filters on omnivore.filters
    FOR INSERT TO omnivore_user
    WITH CHECK (user_id = omnivore.get_current_user_id());

CREATE POLICY update_filters on omnivore.filters
    FOR UPDATE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

CREATE POLICY delete_filters on omnivore.filters
    FOR DELETE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.filters TO omnivore_user;

ALTER TABLE omnivore.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_integrations on omnivore.integrations
  FOR SELECT TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

CREATE POLICY create_integrations on omnivore.integrations
    FOR INSERT TO omnivore_user
    WITH CHECK (user_id = omnivore.get_current_user_id());

CREATE POLICY update_integrations on omnivore.integrations
    FOR UPDATE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

CREATE POLICY delete_integrations on omnivore.integrations
    FOR DELETE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.integrations TO omnivore_user;

ALTER TABLE omnivore.newsletter_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_newsletter_emails on omnivore.newsletter_emails
  FOR SELECT TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

CREATE POLICY create_newsletter_emails on omnivore.newsletter_emails
  FOR INSERT TO omnivore_user
  WITH CHECK (user_id = omnivore.get_current_user_id());

CREATE POLICY delete_newsletter_emails on omnivore.newsletter_emails
  FOR DELETE TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, DELETE ON omnivore.newsletter_emails TO omnivore_user;

ALTER POLICY read_labels on omnivore.labels
    USING (user_id = omnivore.get_current_user_id());

ALTER POLICY create_labels on omnivore.labels
    WITH CHECK (user_id = omnivore.get_current_user_id());

ALTER TABLE omnivore.received_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_received_emails on omnivore.received_emails
  FOR SELECT TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

CREATE POLICY create_received_emails on omnivore.received_emails
    FOR INSERT TO omnivore_user
    WITH CHECK (user_id = omnivore.get_current_user_id());

CREATE POLICY update_received_emails on omnivore.received_emails
    FOR UPDATE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

CREATE POLICY delete_received_emails on omnivore.received_emails
    FOR DELETE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.received_emails TO omnivore_user;

ALTER TABLE omnivore.rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_rules on omnivore.rules
  FOR SELECT TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

CREATE POLICY create_rules on omnivore.rules
    FOR INSERT TO omnivore_user
    WITH CHECK (user_id = omnivore.get_current_user_id());

CREATE POLICY update_rules on omnivore.rules
    FOR UPDATE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

CREATE POLICY delete_rules on omnivore.rules
    FOR DELETE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.rules TO omnivore_user;

ALTER TABLE omnivore.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_subscriptions on omnivore.subscriptions
  FOR SELECT TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

CREATE POLICY create_subscriptions on omnivore.subscriptions
    FOR INSERT TO omnivore_user
    WITH CHECK (user_id = omnivore.get_current_user_id());

CREATE POLICY update_subscriptions on omnivore.subscriptions
    FOR UPDATE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

CREATE POLICY delete_subscriptions on omnivore.subscriptions
    FOR DELETE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.subscriptions TO omnivore_user;

ALTER TABLE omnivore.upload_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_upload_files on omnivore.upload_files
  FOR SELECT TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

CREATE POLICY create_upload_files on omnivore.upload_files
    FOR INSERT TO omnivore_user
    WITH CHECK (user_id = omnivore.get_current_user_id());

CREATE POLICY update_upload_files on omnivore.upload_files
    FOR UPDATE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

CREATE POLICY delete_upload_files on omnivore.upload_files
    FOR DELETE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.upload_files TO omnivore_user;

ALTER TABLE omnivore.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_webhooks on omnivore.webhooks
  FOR SELECT TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

CREATE POLICY create_webhooks on omnivore.webhooks
    FOR INSERT TO omnivore_user
    WITH CHECK (user_id = omnivore.get_current_user_id());

CREATE POLICY update_webhooks on omnivore.webhooks
    FOR UPDATE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

CREATE POLICY delete_webhooks on omnivore.webhooks
    FOR DELETE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.webhooks TO omnivore_user;

COMMIT;
