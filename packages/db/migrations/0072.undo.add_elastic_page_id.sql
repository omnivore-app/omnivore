-- Type: UNDO
-- Name: add_elastic_page_id
-- Description: Add elastic_page_id to link/page related tables

BEGIN;

ALTER TABLE omnivore.article_saving_request DROP COLUMN elastic_page_id;
ALTER TABLE omnivore.reaction DROP COLUMN elastic_page_id;
ALTER TABLE omnivore.highlight DROP COLUMN elastic_page_id;
ALTER TABLE omnivore.reminders DROP COLUMN elastic_page_id;
ALTER TABLE omnivore.abuse_report DROP COLUMN elastic_page_id;
ALTER TABLE omnivore.content_display_report DROP COLUMN elastic_page_id;
ALTER TABLE omnivore.link_share_info DROP COLUMN elastic_page_id;

COMMIT;
