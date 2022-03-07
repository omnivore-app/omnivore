-- Type: DO
-- Name: add_elastic_page_id
-- Description: Add elastic_page_id to link/page related tables

BEGIN;

ALTER TABLE omnivore.article_saving_request ADD COLUMN elastic_page_id varchar(36);
ALTER TABLE omnivore.reaction ADD COLUMN elastic_page_id varchar(36);
ALTER TABLE omnivore.highlight ADD COLUMN elastic_page_id varchar(36);
ALTER TABLE omnivore.reminders ADD COLUMN elastic_page_id varchar(36);
ALTER TABLE omnivore.abuse_report ADD COLUMN elastic_page_id varchar(36);
ALTER TABLE omnivore.content_display_report ADD COLUMN elastic_page_id varchar(36);
ALTER TABLE omnivore.link_share_info ADD COLUMN elastic_page_id varchar(36);

COMMIT;
