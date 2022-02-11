-- Type: UNDO
-- Name: read_access_all_user_friends
-- Description: Grant read access to user_friends to app role

BEGIN;

DROP POLICY read_all_user_friends ON omnivore.user_friends;

CREATE POLICY read_user_friends ON omnivore.user_friends
  FOR SELECT TO omnivore_user
  USING (user_id = omnivore.get_current_user_id() OR friend_user_id = omnivore.get_current_user_id());

COMMIT;
