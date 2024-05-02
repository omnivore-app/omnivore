-- Type: UNDO
-- Name: policy_for_select_shared_item
-- Description: Create a policy to select library_item when shared_at is not null

BEGIN;

DROP POLICY policy_for_select_shared_item ON omnivore.library_item;

COMMIT;
