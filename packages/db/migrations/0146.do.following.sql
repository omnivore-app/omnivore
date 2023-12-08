-- Type: DO
-- Name: following
-- Description: Create tables for following feature

BEGIN;

ALTER TABLE omnivore.subscriptions
    ADD COLUMN is_private boolean,
    ADD COLUMN auto_add_to_library boolean;

ALTER TABLE omnivore.library_item
    ADD COLUMN links jsonb,
    ADD COLUMN preview_content text,
    ADD COLUMN preview_content_type text,
    ADD COLUMN folder text NOT NULL DEFAULT 'inbox';

CREATE POLICY library_item_admin_policy on omnivore.library_item
    FOR ALL
    TO omnivore_admin
    USING (true);

COMMIT;
