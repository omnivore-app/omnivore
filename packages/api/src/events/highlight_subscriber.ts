import {
  EntityManager,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  ObjectLiteral,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm'
import { Highlight } from '../entity/highlight'
import { Label } from '../entity/label'
import { LibraryItem } from '../entity/library_item'
import { createPubSubClient, EntityType } from '../pubsub'

@EventSubscriber()
export class HighlightSubscriber
  implements EntitySubscriberInterface<Highlight>
{
  private readonly pubsubClient = createPubSubClient()

  async updateLibraryItem(manager: EntityManager, libraryItemId: string) {
    // get all the highlights belonging to the library_item
    const highlights = await manager.getRepository(Highlight).find({
      where: { libraryItem: { id: libraryItemId } },
      relations: {
        labels: true,
      },
    })

    const highlightLabels: string[] = []
    const highlightAnnotations: string[] = []

    // for each highlight, add the lowercased label names to highlight_labels
    // and the annotation to highlight_annotations
    highlights.forEach((highlight) => {
      highlight.labels &&
        highlightLabels.push(
          ...highlight.labels.map((label) => label.name.toLowerCase())
        )
      highlightAnnotations.push(highlight.annotation || '')
    })

    // update highlight_labels and highlight_annotations on library_item
    await manager.update(LibraryItem, libraryItemId, {
      highlightAnnotations,
      highlightLabels,
    })
  }

  listenTo() {
    return Highlight
  }

  async afterInsert(event: InsertEvent<Highlight>): Promise<void> {
    await this.updateLibraryItem(event.manager, event.entity.libraryItem.id)

    await this.pubsubClient.entityCreated<Highlight>(
      EntityType.HIGHLIGHT,
      event.entity,
      event.entity.libraryItem.user.id
    )
  }

  async afterUpdate(event: UpdateEvent<Highlight>): Promise<void> {
    if (event.entity) {
      await this.updateLibraryItem(
        event.manager,
        event.databaseEntity.libraryItem.id
      )

      // publish update event
      await this.pubsubClient.entityUpdated<ObjectLiteral>(
        EntityType.HIGHLIGHT,
        { ...event.entity, libraryItem: event.databaseEntity.libraryItem },
        event.databaseEntity.libraryItem.user.id
      )

      // publish label added event if a label was added
      if (event.entity.labels) {
        await this.pubsubClient.entityCreated<Label>(
          EntityType.LABEL,
          event.entity.labels,
          event.entity.libraryItem.user.id
        )
      }
    }
  }

  async afterRemove(event: RemoveEvent<Highlight>): Promise<void> {
    if (event.entityId) {
      await this.updateLibraryItem(
        event.manager,
        event.databaseEntity.libraryItem.id
      )

      await this.pubsubClient.entityDeleted(
        EntityType.HIGHLIGHT,
        event.entityId,
        event.databaseEntity.libraryItem.user.id
      )
    }
  }
}
