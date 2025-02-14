import { DeepPartial, FindOptionsWhere, In } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { EntityLabel, LabelSource } from '../entity/entity_label'
import { Label } from '../entity/label'
import {
  createPubSubClient,
  EntityEvent,
  EntityType,
  PubsubClient,
} from '../pubsub'
import { authTrx } from '../repository'
import { CreateLabelInput, labelRepository } from '../repository/label'
import { Merge } from '../util'
import { bulkEnqueueUpdateLabels } from '../utils/createTask'
import { deepDelete } from '../utils/helpers'
import { findLibraryItemIdsByLabelId, ItemEvent } from './library_item'

const columnsToDelete = ['description', 'createdAt'] as const
type ColumnsToDeleteType = (typeof columnsToDelete)[number]
export type LabelEvent = Merge<
  Omit<DeepPartial<Label>, ColumnsToDeleteType>,
  EntityEvent
>

export const batchGetLabelsFromLibraryItemIds = async (
  libraryItemIds: readonly string[]
): Promise<Label[][]> => {
  const labels = await authTrx(
    async (tx) =>
      tx.getRepository(EntityLabel).find({
        where: { libraryItemId: In(libraryItemIds as string[]) },
        relations: ['label'],
      }),
    {
      replicationMode: 'replica',
    }
  )

  return libraryItemIds.map((libraryItemId) =>
    labels
      .filter((label) => label.libraryItemId === libraryItemId)
      .map((label) => label.label)
  )
}

export const batchGetLabelsFromHighlightIds = async (
  highlightIds: readonly string[]
): Promise<Label[][]> => {
  const labels = await authTrx(
    async (tx) =>
      tx.getRepository(EntityLabel).find({
        where: { highlightId: In(highlightIds as string[]) },
        relations: ['label'],
      }),
    {
      replicationMode: 'replica',
    }
  )

  return highlightIds.map((highlightId) =>
    labels
      .filter((label) => label.highlightId === highlightId)
      .map((label) => label.label)
  )
}

export const findOrCreateLabels = async (
  labels: CreateLabelInput[],
  userId: string
): Promise<Label[]> => {
  return authTrx(
    async (tx) => {
      const repo = tx.withRepository(labelRepository)
      // create labels if not exist
      await repo.createLabels(labels, userId)

      // find labels by names
      return repo.findBy({
        name: In(labels.map((l) => l.name)),
        user: { id: userId },
      })
    },
    {
      uid: userId,
    }
  )
}

export const createAndAddLabelsToLibraryItem = async (
  libraryItemId: string,
  userId: string,
  labels?: CreateLabelInput[] | null,
  rssFeedUrl?: string | null,
  source?: LabelSource
) => {
  if (rssFeedUrl) {
    // add rss label to labels
    labels = (labels || []).concat({ name: 'RSS' })
    source = 'system'
  }

  // save labels in item
  if (labels && labels.length > 0) {
    const newLabels = await findOrCreateLabels(labels, userId)

    await addLabelsToLibraryItem(
      newLabels.map((l) => l.id),
      libraryItemId,
      userId,
      source,
      false
    )
  }
}

export const createAndSaveLabelsInLibraryItem = async (
  libraryItemId: string,
  userId: string,
  labels?: CreateLabelInput[] | null,
  rssFeedUrl?: string | null,
  source?: LabelSource,
  pubsub?: PubsubClient
) => {
  if (rssFeedUrl) {
    // add rss label to labels
    labels = (labels || []).concat({ name: 'RSS' })
    source = 'system'
  }

  // save labels in item
  if (labels && labels.length > 0) {
    const newLabels = await findOrCreateLabels(labels, userId)

    await saveLabelsInLibraryItem(
      newLabels,
      libraryItemId,
      userId,
      source,
      pubsub
    )
  }
}

export const saveLabelsInLibraryItem = async (
  labels: Label[],
  libraryItemId: string,
  userId: string,
  source: LabelSource = 'user',
  pubsub = createPubSubClient()
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
          source,
        }))
      )
    },
    {
      uid: userId,
    }
  )

  if (source === 'user') {
    // create pubsub event
    await pubsub.entityCreated<ItemEvent>(
      EntityType.LABEL,
      {
        id: libraryItemId,
        labels: labels.map((l) => deepDelete(l, columnsToDelete)),
        labelNames: labels.map((l) => l.name),
      },
      userId
    )
  }

  // update labels in library item
  return bulkEnqueueUpdateLabels([{ libraryItemId, userId }])
}

export const addLabelsToLibraryItem = async (
  labelIds: string[],
  libraryItemId: string,
  userId: string,
  source: LabelSource = 'user',
  updateLibraryItem = true
) => {
  await authTrx(
    async (tx) => {
      // assign new labels if not exist to the item owner by user
      await tx.query(
        `INSERT INTO omnivore.entity_labels (label_id, library_item_id, source)
          SELECT 
              lbl.id, 
              $1, 
              $2 
          FROM 
              omnivore.labels lbl
          LEFT JOIN 
              omnivore.entity_labels el 
          ON 
              el.label_id = lbl.id 
              AND el.library_item_id = $1
          INNER JOIN 
              omnivore.library_item li 
          ON 
              li.id = $1
          WHERE 
              lbl.id = ANY($3)
              AND el.label_id IS NULL;`,
        [libraryItemId, source, labelIds]
      )
    },
    {
      uid: userId,
    }
  )

  if (updateLibraryItem) {
    // update labels in library item
    await bulkEnqueueUpdateLabels([{ libraryItemId, userId }])
  }
}

export const saveLabelsInHighlight = async (
  labels: Label[],
  highlightId: string
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
    {
      uid: userId,
      replicationMode: 'replica',
    }
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
    {
      uid: userId,
    }
  )
}

export const deleteLabels = async (
  criteria: string[] | FindOptionsWhere<Label>,
  userId: string
) => {
  return authTrx(
    async (t) => t.withRepository(labelRepository).delete(criteria),
    {
      uid: userId,
    }
  )
}

export const deleteLabelsByLibraryItemId = async (
  userId: string,
  libraryItemId: string
) => {
  return authTrx(
    async (t) =>
      t.getRepository(EntityLabel).delete({
        libraryItemId,
      }),
    {
      uid: userId,
    }
  )
}

export const deleteLabelById = async (labelId: string, userId: string) => {
  const libraryItemIds = await findLibraryItemIdsByLabelId(labelId, userId)

  const deleteResult = await authTrx(async (tx) => {
    return tx.withRepository(labelRepository).deleteById(labelId)
  })

  if (!deleteResult.affected) {
    return false
  }

  const data = libraryItemIds.map((libraryItemId) => ({
    libraryItemId,
    userId,
  }))
  await bulkEnqueueUpdateLabels(data)

  return true
}

export const updateLabel = async (
  id: string,
  label: QueryDeepPartialEntity<Label>,
  userId: string
) => {
  const updatedLabel = await authTrx(
    async (t) => {
      const repo = t.withRepository(labelRepository)
      await repo.updateLabel(id, label)

      return repo.findOneByOrFail({ id })
    },
    {
      uid: userId,
    }
  )

  const libraryItemIds = await findLibraryItemIdsByLabelId(id, userId)

  const data = libraryItemIds.map((libraryItemId) => ({
    libraryItemId,
    userId,
  }))
  await bulkEnqueueUpdateLabels(data)

  return updatedLabel
}

export const findLabelsByUserId = async (userId: string): Promise<Label[]> => {
  return authTrx(
    async (tx) =>
      tx.withRepository(labelRepository).find({
        where: { user: { id: userId } },
        order: { position: 'ASC' },
      }),
    {
      uid: userId,
      replicationMode: 'replica',
    }
  )
}

export const findLabelById = async (id: string, userId: string) => {
  return authTrx(
    async (tx) =>
      tx
        .withRepository(labelRepository)
        .findOneBy({ id, user: { id: userId } }),
    {
      uid: userId,
      replicationMode: 'replica',
    }
  )
}

export const findLabelsByLibraryItemId = async (
  libraryItemId: string,
  userId: string
): Promise<(Label & { source: string })[]> => {
  return authTrx(
    async (tx) => {
      const entityLabels = await tx.getRepository(EntityLabel).find({
        where: { libraryItemId },
        relations: ['label'],
      })

      return entityLabels.map((el) => ({
        ...el.label,
        source: el.source,
      }))
    },
    {
      uid: userId,
    }
  )
}
