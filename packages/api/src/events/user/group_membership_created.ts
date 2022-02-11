import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm'

import { GroupMembership } from '../../entity/groups/group_membership'

@EventSubscriber()
export class FollowAllGroupMembers
  implements EntitySubscriberInterface<GroupMembership>
{
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  listenTo() {
    return GroupMembership
  }

  async afterInsert(event: InsertEvent<GroupMembership>): Promise<void> {
    // Make all existing group members follow the new user
    await event.manager.query(
      `insert into omnivore.user_friends (user_id, friend_user_id)
      select user_id, $1 from omnivore.group_membership where group_id = $2 and user_id != $1
        `,
      [event.entity.user.id, event.entity.group.id]
    )

    // Make the new user follow all existing group members
    await event.manager.query(
      `insert into omnivore.user_friends (user_id, friend_user_id)
      select $1, user_id from omnivore.group_membership where group_id = $2 and user_id != $1
        `,
      [event.entity.user.id, event.entity.group.id]
    )
  }
}
