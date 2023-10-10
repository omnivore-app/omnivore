import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm'
import { Profile } from '../../entity/profile'
import { createDefaultFiltersForUser } from '../../services/create_user'
import { addPopularReadsForNewUser } from '../../services/popular_reads'

@EventSubscriber()
export class AddPopularReadsToNewUser
  implements EntitySubscriberInterface<Profile>
{
  listenTo() {
    return Profile
  }

  async afterInsert(event: InsertEvent<Profile>): Promise<void> {
    await addPopularReadsForNewUser(event.entity.user.id, event.manager)
  }
}

@EventSubscriber()
export class AddDefaultFiltersToNewUser
  implements EntitySubscriberInterface<Profile>
{
  listenTo() {
    return Profile
  }

  async afterInsert(event: InsertEvent<Profile>): Promise<void> {
    await createDefaultFiltersForUser(event.manager)(event.entity.user.id)
  }
}
