-- Type: DO
-- Name: add_description_to_group
-- Description: Add description, topics, only_admin_can_post, only_admin_can_see_members to group table

BEGIN;

ALTER TABLE omnivore."group"
    ADD COLUMN description text,
    ADD COLUMN topics text,
    ADD COLUMN only_admin_can_post boolean NOT NULL DEFAULT false,
    ADD COLUMN only_admin_can_see_members boolean NOT NULL DEFAULT false;

COMMIT;
