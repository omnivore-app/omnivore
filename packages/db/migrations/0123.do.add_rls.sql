-- Type: DO
-- Name: add_rls
-- Description: Add RLS to the tables

BEGIN;

ALTER TABLE omnivore.features ENABLE ROW LEVEL SECURITY;
CREATE POLICY features_policy on omnivore.features
  USING (user_id = omnivore.get_current_user_id())
  WITH CHECK (user_id = omnivore.get_current_user_id());
GRANT SELECT, INSERT, UPDATE ON omnivore.features TO omnivore_user;

ALTER TABLE omnivore.filters ENABLE ROW LEVEL SECURITY;
CREATE POLICY filters_policy on omnivore.filters
  USING (user_id = omnivore.get_current_user_id())
  WITH CHECK (user_id = omnivore.get_current_user_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.filters TO omnivore_user;

ALTER TABLE omnivore.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY integrations_policy on omnivore.integrations
  USING (user_id = omnivore.get_current_user_id())
  WITH CHECK (user_id = omnivore.get_current_user_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.integrations TO omnivore_user;

ALTER TABLE omnivore.newsletter_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY newsletter_emails_policy on omnivore.newsletter_emails
  USING (user_id = omnivore.get_current_user_id())
  WITH CHECK (user_id = omnivore.get_current_user_id());
GRANT SELECT, INSERT, DELETE ON omnivore.newsletter_emails TO omnivore_user;

CREATE POLICY labels_policy on omnivore.labels
  USING (user_id = omnivore.get_current_user_id())
  WITH CHECK (user_id = omnivore.get_current_user_id());

ALTER TABLE omnivore.received_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY received_emails_policy on omnivore.received_emails
  USING (user_id = omnivore.get_current_user_id())
  WITH CHECK (user_id = omnivore.get_current_user_id());
GRANT SELECT, INSERT, UPDATE ON omnivore.received_emails TO omnivore_user;

ALTER TABLE omnivore.rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY rules_policy on omnivore.rules
  USING (user_id = omnivore.get_current_user_id())
  WITH CHECK (user_id = omnivore.get_current_user_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.rules TO omnivore_user;

ALTER TABLE omnivore.webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhooks_policy on omnivore.webhooks
  USING (user_id = omnivore.get_current_user_id())
  WITH CHECK (user_id = omnivore.get_current_user_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.webhooks TO omnivore_user;

CREATE POLICY user_device_tokens_policy on omnivore.user_device_tokens
  USING (user_id = omnivore.get_current_user_id())
  WITH CHECK (user_id = omnivore.get_current_user_id());
GRANT SELECT, INSERT, DELETE ON omnivore.user_device_tokens TO omnivore_user;

ALTER TABLE omnivore.search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY search_history_policy on omnivore.search_history
  USING (user_id = omnivore.get_current_user_id())
  WITH CHECK (user_id = omnivore.get_current_user_id());
GRANT SELECT, INSERT, DELETE ON omnivore.search_history TO omnivore_user;

ALTER TABLE omnivore.abuse_report DROP COLUMN page_id;
ALTER TABLE omnivore.abuse_report RENAME COLUMN elastic_page_id TO library_item_id;
ALTER TABLE omnivore.content_display_report DROP COLUMN page_id;
ALTER TABLE omnivore.content_display_report RENAME COLUMN elastic_page_id TO library_item_id;

COMMIT;
