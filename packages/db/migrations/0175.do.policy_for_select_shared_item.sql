-- Type: DO
-- Name: policy_for_select_shared_item
-- Description: Create a policy to select library_item when shared_at is not null

BEGIN;

CREATE POLICY policy_for_select_shared_item
    ON omnivore.library_item
    FOR SELECT
    USING (shared_at IS NOT NULL);

COMMIT;
