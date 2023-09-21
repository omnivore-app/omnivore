-- Type: DO
-- Name: revert_rls
-- Description: Revert rls on rows

BEGIN;

ALTER TABLE omnivore.filters DISABLE ROW LEVEL SECURITY;
DROP POLICY filters_policy on omnivore.filters;

ALTER TABLE omnivore.integrations DISABLE ROW LEVEL SECURITY;
DROP POLICY integrations_policy on omnivore.integrations;

DROP POLICY labels_policy on omnivore.labels;
CREATE POLICY read_labels on omnivore.labels
    FOR SELECT TO omnivore_user
    USING (true);
CREATE POLICY create_labels on omnivore.labels
    FOR INSERT TO omnivore_user
    WITH CHECK (true);

ALTER TABLE omnivore.received_emails DISABLE ROW LEVEL SECURITY;
DROP POLICY received_emails_policy on omnivore.received_emails;

ALTER TABLE omnivore.rules DISABLE ROW LEVEL SECURITY;
DROP POLICY rules_policy on omnivore.rules;

ALTER TABLE omnivore.webhooks DISABLE ROW LEVEL SECURITY;
DROP POLICY webhooks_policy on omnivore.webhooks;

DROP POLICY user_device_tokens_policy on omnivore.user_device_tokens;
CREATE POLICY read_user_device_tokens on omnivore.user_device_tokens
    FOR SELECT TO omnivore_user
    USING (true);
CREATE POLICY create_user_device_tokens on omnivore.user_device_tokens
    FOR INSERT TO omnivore_user
    WITH CHECK (true);

COMMIT;
