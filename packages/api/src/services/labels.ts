import { DeepPartial, FindOptionsWhere, In } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { EntityLabel } from '../entity/entity_label'
import { Label } from '../entity/label'
import { LibraryItem } from '../entity/library_item'
import { createPubSubClient, EntityType, PubsubClient } from '../pubsub'
import { authTrx } from '../repository'
import { CreateLabelInput, labelRepository } from '../repository/label'
import { libraryItemRepository } from '../repository/library_item'

type AddLabelsToLibraryItemEvent = {
  pageId: string
  labels: DeepPartial<Label>[]
}
type AddLabelsToHighlightEvent = {
  highlightId: string
  labels: DeepPartial<Label>[]
}

// const batchGetLabelsFromLinkIds = async (
//   linkIds: readonly string[]
// ): Promise<Label[][]> => {
//   const links = await getRepository(Link).find({
//     where: { id: In(linkIds as string[]) },
//     relations: ['labels'],
//   })

//   return linkIds.map(
//     (linkId) => links.find((link) => link.id === linkId)?.labels || []
//   )
// }

// export const labelsLoader = new DataLoader(batchGetLabelsFromLinkIds)

export const findOrCreateLabels = async (
  labels: CreateLabelInput[],
  userId: string
): Promise<Label[]> => {
  return authTrx(
    async (tx) => {
      const labelRepo = tx.withRepository(labelRepository)
      // find existing labels
      const labelEntities = await labelRepo.findByNames(
        labels.map((l) => l.name),
        userId
      )

      const existingLabelsInLowerCase = labelEntities.map((l) =>
        l.name.toLowerCase()
      )
      const newLabels = labels.filter(
        (l) => !existingLabelsInLowerCase.includes(l.name.toLowerCase())
      )
      if (newLabels.length === 0) {
        return labelEntities
      }

      // create new labels
      const newLabelEntities = await labelRepo.createLabels(newLabels, userId)

      return [...labelEntities, ...newLabelEntities]
    },
    undefined,
    userId
  )
}

export const createAndSaveLabelsInLibraryItem = async (
  libraryItemId: string,
  userId: string,
  labels?: CreateLabelInput[] | null,
  rssFeedUrl?: string | null,
  pubsub?: PubsubClient,
  skipPubSub?: boolean
) => {
  if (rssFeedUrl) {
    // add rss label to labels
    labels = (labels || []).concat({ name: 'RSS' })
  }

  // save labels in item
  if (labels && labels.length > 0) {
    const newLabels = await findOrCreateLabels(labels, userId)

    await saveLabelsInLibraryItem(
      newLabels,
      libraryItemId,
      userId,
      pubsub,
      skipPubSub
    )
  }
}

export const saveLabelsInLibraryItem = async (
  labels: Label[],
  libraryItemId: string,
  userId: string,
  pubsub = createPubSubClient(),
  skipPubSub = false
) => {
  await authTrx(
    async (tx) => {
      const repo = tx.getRepository(EntityLabel)

      // delete existing labels
      await repo.delete({
        libraryItemId,
      })

      // save new labels
      await repo.save(
        labels.map((l) => ({
          labelId: l.id,
          libraryItemId,
        }))
      )
    },
    undefined,
    userId
  )

  if (skipPubSub) {
    return
  }

  // create pubsub event
  await pubsub.entityCreated<AddLabelsToLibraryItemEvent>(
    EntityType.LABEL,
    { pageId: libraryItemId, labels },
    userId
  )
}

export const addLabelsToLibraryItem = async (
  labels: Label[],
  libraryItemId: string,
  userId: string,
  pubsub = createPubSubClient(),
  skipPubSub = false
) => {
  await authTrx(
    async (tx) => {
      const libraryItem = await tx
        .withRepository(libraryItemRepository)
        .findOneByOrFail({ id: libraryItemId, user: { id: userId } })

      if (libraryItem.labels) {
        labels.push(...libraryItem.labels)
      }

      // save new labels
      await tx.getRepository(EntityLabel).save(
        labels.map((l) => ({
          labelId: l.id,
          libraryItemId,
        }))
      )
    },
    undefined,
    userId
  )

  if (skipPubSub) {
    return
  }

  // create pubsub event
  await pubsub.entityCreated<AddLabelsToLibraryItemEvent>(
    EntityType.LABEL,
    { pageId: libraryItemId, labels },
    userId
  )
}

export const saveLabelsInHighlight = async (
  labels: Label[],
  highlightId: string,
  userId: string,
  pubsub = createPubSubClient()
) => {
  await authTrx(async (tx) => {
    const repo = tx.getRepository(EntityLabel)

    // delete existing labels
    await repo.delete({
      highlightId,
    })

    // save new labels
    await repo.save(
      labels.map((l) => ({
        labelId: l.id,
        highlightId,
      }))
    )
  })

  // create pubsub event
  await pubsub.entityCreated<AddLabelsToHighlightEvent>(
    EntityType.LABEL,
    { highlightId, labels },
    userId
  )
}

export const findLabelsByIds = async (
  ids: string[],
  userId: string
): Promise<Label[]> => {
  return authTrx(
    async (tx) => {
      return tx.withRepository(labelRepository).findBy({
        id: In(ids),
        user: { id: userId },
      })
    },
    undefined,
    userId
  )
}

export const createLabel = async (
  name: string,
  color: string,
  userId: string
): Promise<Label> => {
  return authTrx(
    (t) =>
      t.withRepository(labelRepository).createLabel({ name, color }, userId),
    undefined,
    userId
  )
}

export const deleteLabels = async (
  criteria: string[] | FindOptionsWhere<Label>,
  userId: string
) => {
  return authTrx(
    async (t) => t.withRepository(labelRepository).delete(criteria),
    undefined,
    userId
  )
}

export const updateLabel = async (
  id: string,
  label: QueryDeepPartialEntity<Label>,
  userId: string
) => {
  return authTrx(
    async (t) => {
      const repo = t.withRepository(labelRepository)
      await repo.updateLabel(id, label)

      return repo.findOneByOrFail({ id })
    },
    undefined,
    userId
  )
}

export const findLabelsByUserId = async (userId: string): Promise<Label[]> => {
  return authTrx(
    async (tx) =>
      tx.withRepository(labelRepository).find({
        where: { user: { id: userId } },
        order: { position: 'ASC' },
      }),
    undefined,
    userId
  )
}

export const findLabelById = async (id: string, userId: string) => {
  return authTrx(
    async (tx) =>
      tx
        .withRepository(labelRepository)
        .findOneBy({ id, user: { id: userId } }),
    undefined,
    userId
  )
}

export const findLabelsByLibraryItemId = async (
  libraryItemId: string,
  userId: string
) => {
  return authTrx(
    async (tx) =>
      tx
        .createQueryBuilder(Label, 'label')
        .innerJoin(
          EntityLabel,
          'entityLabel',
          'entityLabel.label_id = label.id'
        )
        .innerJoin(
          LibraryItem,
          'LibraryItem',
          'LibraryItem.id = entityLabel.library_item_id'
        )
        .where('LibraryItem.id = :libraryItemId', { libraryItemId })
        .getMany(),
    undefined,
    userId
  )
}
