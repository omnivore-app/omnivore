import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  ObjectLiteral,
  UpdateEvent,
} from 'typeorm'
import { Label } from '../entity/label'
import { LibraryItem, LibraryItemState } from '../entity/library_item'
import { createPubSubClient, EntityType } from '../pubsub'

@EventSubscriber()
export class LibraryItemSubscriber
  implements EntitySubscriberInterface<LibraryItem>
{
  private readonly pubsubClient = createPubSubClient()

  listenTo() {
    return LibraryItem
  }

  async afterInsert(event: InsertEvent<LibraryItem>): Promise<void> {
    // Only publish the event if the library item has been successfully created
    if (event.entity.state === LibraryItemState.Succeeded) {
      await this.pubsubClient.entityCreated<LibraryItem>(
        EntityType.PAGE,
        event.entity,
        event.entity.user.id
      )
    }
  }

  async afterUpdate(event: UpdateEvent<LibraryItem>): Promise<void> {
    if (event.entity) {
      // publish delete event if the library item has been deleted
      if (event.entity.state === LibraryItemState.Deleted) {
        return this.pubsubClient.entityDeleted(
          EntityType.PAGE,
          event.databaseEntity.id,
          event.databaseEntity.user.id
        )
      }

      // publish create event if the library item has finished processing
      if (
        event.databaseEntity.state === LibraryItemState.Processing &&
        event.entity.state === LibraryItemState.Succeeded
      ) {
        return this.pubsubClient.entityCreated<LibraryItem>(
          EntityType.PAGE,
          {
            ...event.databaseEntity,
            ...event.entity,
          },
          event.databaseEntity.user.id
        )
      }

      // publish update event for all other cases
      await this.pubsubClient.entityUpdated<ObjectLiteral>(
        EntityType.PAGE,
        event.entity,
        event.databaseEntity.user.id
      )

      // publish label added event if a label was added
      if (event.entity.labels) {
        const labels = event.entity.labels as Label[]
        await event.manager
          .getRepository(LibraryItem)
          .update(event.databaseEntity.id, {
            labelNames: labels.map((label) => label.name.toLowerCase()),
          })

        await this.pubsubClient.entityCreated<Label>(
          EntityType.LABEL,
          event.entity.labels,
          event.databaseEntity.user.id
        )
      }
    }
  }
}
