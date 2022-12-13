-- Type: UNDO
-- Name: add_description_to_group
-- Description: Add description, topics, only_admin_can_post, only_admin_can_see_members to group table

BEGIN;

ALTER TABLE omnivore."group"
    DROP COLUMN IF EXISTS description,
    DROP COLUMN IF EXISTS topics,
    DROP COLUMN IF EXISTS only_admin_can_post,
    DROP COLUMN IF EXISTS only_admin_can_see_members;

COMMIT;
