-- Type: UNDO
-- Name: revert_rls
-- Description: Revert rls on rows

BEGIN;

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

DROP POLICY read_labels ON omnivore.labels;
DROP POLICY create_labels ON omnivore.labels;
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

DROP POLICY read_user_device_tokens ON omnivore.user_device_tokens;
DROP POLICY create_user_device_tokens ON omnivore.user_device_tokens;
CREATE POLICY user_device_tokens_policy on omnivore.user_device_tokens
  USING (user_id = omnivore.get_current_user_id())
  WITH CHECK (user_id = omnivore.get_current_user_id());
GRANT SELECT, INSERT, DELETE ON omnivore.user_device_tokens TO omnivore_user;

COMMIT;
