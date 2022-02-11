-- Type: UNDO
-- Name: user_feed_and_friends
-- Description: user feed and user friends

BEGIN;

DROP POLICY delete_user_friends ON omnivore.user_friends;
DROP POLICY create_user_friends ON omnivore.user_friends;
DROP POLICY read_user_friends ON omnivore.user_friends;

DROP TABLE omnivore.user_friends;

COMMIT;
