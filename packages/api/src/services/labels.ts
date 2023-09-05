import { In } from 'typeorm'
import { Label } from '../entity/label'
import { LibraryItem } from '../entity/library_item'
import { createPubSubClient, EntityType } from '../pubsub'
import { authTrx } from '../repository'
import { highlightRepository } from '../repository/highlight'
import { CreateLabelInput, labelRepository } from '../repository/label'
import { libraryItemRepository } from '../repository/library_item'

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
  return authTrx(async (tx) => {
    const labelRepo = tx.withRepository(labelRepository)
    // find existing labels
    const labelEntities = await labelRepo.findByNames(labels.map((l) => l.name))

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
  })
}

export const saveLabelsInLibraryItem = async (
  labels: Label[],
  libraryItemId: string,
  userId: string,
  pubsub = createPubSubClient()
) => {
  await authTrx(async (tx) => {
    await tx
      .withRepository(libraryItemRepository)
      .save({ id: libraryItemId, labels })
  })

  // create pubsub event
  await pubsub.entityCreated<(Label & { pageId: string })[]>(
    EntityType.LABEL,
    labels.map((l) => ({ ...l, pageId: libraryItemId })),
    userId
  )
}

export const addLabelsToLibraryItem = async (
  labels: Label[],
  libraryItemId: string,
  userId: string,
  pubsub = createPubSubClient()
) => {
  await authTrx(async (tx) => {
    await tx
      .withRepository(libraryItemRepository)
      .createQueryBuilder()
      .relation(LibraryItem, 'labels')
      .of(libraryItemId)
      .add(labels)
  })

  // create pubsub event
  await pubsub.entityCreated<(Label & { pageId: string })[]>(
    EntityType.LABEL,
    labels.map((l) => ({ ...l, pageId: libraryItemId })),
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
    await tx
      .withRepository(highlightRepository)
      .save({ id: highlightId, labels })
  })

  // create pubsub event
  await pubsub.entityCreated<(Label & { highlightId: string })[]>(
    EntityType.LABEL,
    labels.map((l) => ({ ...l, highlightId })),
    userId
  )
}

export const findLabelsByIds = async (ids: string[]): Promise<Label[]> => {
  return authTrx(async (tx) => {
    return tx.withRepository(labelRepository).findBy({
      id: In(ids),
    })
  })
}
