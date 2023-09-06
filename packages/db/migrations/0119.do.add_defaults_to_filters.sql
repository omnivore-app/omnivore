-- Type: DO
-- Name: add_defaults_to_filters
-- Description: Add Defaults to Filters

BEGIN;

ALTER TABLE omnivore.filters
    ADD COLUMN default_filter boolean NOT NULL DEFAULT false,
    ADD COLUMN visible boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION update_filter_position()
    RETURNS TRIGGER AS $$
DECLARE
    new_position INTEGER;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        UPDATE omnivore.filters SET position = position - 1 WHERE user_id = OLD.user_id AND position > OLD.position;
        RETURN OLD;
    ELSIF (TG_OP = 'INSERT' and NEW.position is null) THEN
        SELECT COALESCE(MAX(position), 0) + 1 INTO new_position FROM omnivore.filters WHERE user_id = NEW.user_id AND name < NEW.name;
        UPDATE omnivore.filters SET position = position + 1 WHERE user_id = NEW.user_id AND position >= new_position;
        NEW.position = new_position;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

INSERT INTO omnivore.filters (user_id, category, name,  filter, position, default_filter)
SELECT id, 'Search', 'Inbox', 'in:inbox', 0, true
FROM omnivore.user
ON CONFLICT DO NOTHING;

INSERT INTO omnivore.filters (user_id, category, name,  filter, position, default_filter)
SELECT id, 'Search','Continue Reading', 'in:inbox sort:read-desc is:unread', 1, true
FROM omnivore.user
ON CONFLICT DO NOTHING;

INSERT INTO omnivore.filters (user_id, category, name,  filter, position, default_filter)
SELECT id, 'Search', 'Non-Feed Items', 'in:library', 2, true
FROM omnivore.user
ON CONFLICT DO NOTHING;

INSERT INTO omnivore.filters (user_id, category, name,  filter, position, default_filter)
SELECT id, 'Search', 'Highlights', 'has:highlights mode:highlights', 3, true
FROM omnivore.user
ON CONFLICT DO NOTHING;

INSERT INTO omnivore.filters (user_id, category, name,  filter, position, default_filter)
SELECT id, 'Search','Unlabeled', 'no:label', 4, true
FROM omnivore.user
ON CONFLICT DO NOTHING;

INSERT INTO omnivore.filters (user_id, category, name,  filter, position, default_filter)
SELECT id, 'Search','Oldest First', 'sort:saved-asc', 5, true
FROM omnivore.user
    ON CONFLICT DO NOTHING;

INSERT INTO omnivore.filters (user_id, category, name,  filter, position, default_filter)
SELECT id, 'Search','Files', 'type:file', 6, true
FROM omnivore.user
    ON CONFLICT DO NOTHING;

INSERT INTO omnivore.filters (user_id, category, name,  filter, position, default_filter)
SELECT id, 'Search', 'Archived', 'in:archive', 7, true
FROM omnivore.user
ON CONFLICT DO NOTHING;

COMMIT;
