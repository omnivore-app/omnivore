import { diff_match_patch } from 'diff-match-patch'
import { DeepPartial, In } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { EntityLabel } from '../entity/entity_label'
import { Highlight } from '../entity/highlight'
import { Label } from '../entity/label'
import { homePageURL } from '../env'
import { createPubSubClient, EntityEvent, EntityType } from '../pubsub'
import { authTrx } from '../repository'
import { highlightRepository } from '../repository/highlight'
import { Merge } from '../util'
import { enqueueUpdateHighlight } from '../utils/createTask'
import { deepDelete } from '../utils/helpers'
import { ItemEvent } from './library_item'

const columnsToDelete = ['user', 'sharedAt', 'libraryItem'] as const
type ColumnsToDeleteType = typeof columnsToDelete[number]
export type HighlightEvent = Merge<
  Omit<DeepPartial<Highlight>, ColumnsToDeleteType>,
  EntityEvent
>

export const batchGetHighlightsFromLibraryItemIds = async (
  libraryItemIds: readonly string[]
): Promise<Highlight[][]> => {
  const highlights = await authTrx(async (tx) =>
    tx.getRepository(Highlight).find({
      where: { libraryItem: { id: In(libraryItemIds as string[]) } },
    })
  )

  return libraryItemIds.map((libraryItemId) =>
    highlights.filter((highlight) => highlight.libraryItemId === libraryItemId)
  )
}

export const getHighlightLocation = (patch: string): number | undefined => {
  const dmp = new diff_match_patch()
  const patches = dmp.patch_fromText(patch)
  return patches[0].start1 || undefined
}

export const getHighlightUrl = (slug: string, highlightId: string): string =>
  `${homePageURL()}/me/${slug}#${highlightId}`

export const createHighlights = async (
  highlights: DeepPartial<Highlight>[],
  userId: string
) => {
  return authTrx(
    async (tx) =>
      tx.withRepository(highlightRepository).createAndSaves(highlights),
    undefined,
    userId
  )
}

export const createHighlight = async (
  highlight: DeepPartial<Highlight>,
  libraryItemId: string,
  userId: string,
  pubsub = createPubSubClient()
) => {
  const newHighlight = await authTrx(
    async (tx) => {
      const repo = tx.withRepository(highlightRepository)
      const newHighlight = await repo.createAndSave(highlight)
      return repo.findOneOrFail({
        where: { id: newHighlight.id },
        relations: {
          user: true,
          libraryItem: true,
        },
      })
    },
    undefined,
    userId
  )

  const data = deepDelete(newHighlight, columnsToDelete)
  await pubsub.entityCreated<ItemEvent>(
    EntityType.HIGHLIGHT,
    {
      id: libraryItemId,
      highlights: [data],
      // for Readwise
      originalUrl: newHighlight.libraryItem.originalUrl,
      title: newHighlight.libraryItem.title,
      author: newHighlight.libraryItem.author,
      thumbnail: newHighlight.libraryItem.thumbnail,
    },
    userId
  )

  await enqueueUpdateHighlight({
    libraryItemId,
    userId,
  })

  return newHighlight
}

export const mergeHighlights = async (
  highlightsToRemove: string[],
  highlightToAdd: DeepPartial<Highlight>,
  labels: Label[],
  libraryItemId: string,
  userId: string,
  pubsub = createPubSubClient()
) => {
  const newHighlight = await authTrx(async (tx) => {
    const highlightRepo = tx.withRepository(highlightRepository)

    await highlightRepo.delete(highlightsToRemove)

    const newHighlight = await highlightRepo.createAndSave(highlightToAdd)

    if (labels.length > 0) {
      // save new labels
      await tx.getRepository(EntityLabel).save(
        labels.map((l) => ({
          labelId: l.id,
          highlightId: newHighlight.id,
        }))
      )
    }

    return highlightRepo.findOneOrFail({
      where: { id: newHighlight.id },
      relations: {
        user: true,
        libraryItem: true,
      },
    })
  })

  await pubsub.entityCreated<ItemEvent>(
    EntityType.HIGHLIGHT,
    {
      id: libraryItemId,
      originalUrl: newHighlight.libraryItem.originalUrl,
      title: newHighlight.libraryItem.title,
      author: newHighlight.libraryItem.author,
      thumbnail: newHighlight.libraryItem.thumbnail,
      highlights: [newHighlight],
    },
    userId
  )

  await enqueueUpdateHighlight({
    libraryItemId,
    userId,
  })

  return newHighlight
}

export const updateHighlight = async (
  highlightId: string,
  highlight: QueryDeepPartialEntity<Highlight>,
  userId: string,
  pubsub = createPubSubClient()
) => {
  const updatedHighlight = await authTrx(async (tx) => {
    const highlightRepo = tx.withRepository(highlightRepository)
    await highlightRepo.updateAndSave(highlightId, highlight)

    return highlightRepo.findOneOrFail({
      where: { id: highlightId },
      relations: {
        libraryItem: true,
        user: true,
      },
    })
  })

  const libraryItemId = updatedHighlight.libraryItem.id
  await pubsub.entityUpdated<ItemEvent>(
    EntityType.HIGHLIGHT,
    {
      id: libraryItemId,
      originalUrl: updatedHighlight.libraryItem.originalUrl,
      title: updatedHighlight.libraryItem.title,
      author: updatedHighlight.libraryItem.author,
      thumbnail: updatedHighlight.libraryItem.thumbnail,
      highlights: [
        {
          ...highlight,
          id: highlightId,
          updatedAt: new Date(),
          quote: updatedHighlight.quote,
          highlightType: updatedHighlight.highlightType,
        },
      ],
    } as ItemEvent,
    userId
  )

  await enqueueUpdateHighlight({
    libraryItemId,
    userId,
  })

  return updatedHighlight
}

export const deleteHighlightById = async (
  highlightId: string,
  userId?: string
) => {
  const deletedHighlight = await authTrx(
    async (tx) => {
      const highlightRepo = tx.withRepository(highlightRepository)
      const highlight = await highlightRepo.findOneOrFail({
        where: { id: highlightId },
        relations: {
          user: true,
        },
      })

      await highlightRepo.delete(highlightId)
      return highlight
    },
    undefined,
    userId
  )

  await enqueueUpdateHighlight({
    libraryItemId: deletedHighlight.libraryItemId,
    userId: deletedHighlight.user.id,
  })

  return deletedHighlight
}

export const deleteHighlightsByIds = async (
  userId: string,
  highlightIds: string[]
) => {
  await authTrx(
    async (tx) => tx.getRepository(Highlight).delete(highlightIds),
    undefined,
    userId
  )
}

export const findHighlightById = async (
  highlightId: string,
  userId: string
) => {
  return authTrx(
    async (tx) => {
      const highlightRepo = tx.withRepository(highlightRepository)
      return highlightRepo.findOneBy({
        id: highlightId,
      })
    },
    undefined,
    userId
  )
}

export const findHighlightsByLibraryItemId = async (
  libraryItemId: string,
  userId: string
) => {
  return authTrx(
    async (tx) =>
      tx.withRepository(highlightRepository).find({
        where: { libraryItem: { id: libraryItemId } },
        relations: {
          user: true,
          labels: true,
        },
      }),
    undefined,
    userId
  )
}

export const searchHighlights = async (
  userId: string,
  query?: string,
  limit?: number,
  offset?: number
): Promise<Array<Highlight>> => {
  return authTrx(
    async (tx) => {
      const queryBuilder = tx
        .getRepository(Highlight)
        .createQueryBuilder('highlight')
        .innerJoin(
          'highlight.libraryItem',
          'libraryItem',
          'highlight.libraryItemId = libraryItem.id AND libraryItem.deletedAt IS NULL'
        )
        .andWhere('highlight.userId = :userId', { userId })
        .orderBy('highlight.updatedAt', 'DESC')
        .take(limit)
        .skip(offset)

      if (query) {
        // parse query and search by it
        const labelRegex = /label:"([^"]+)"/g
        const labels = Array.from(query.matchAll(labelRegex)).map(
          (match) => match[1]
        )

        labels.forEach((label, index) => {
          const alias = `label_${index}`
          queryBuilder.innerJoin(
            'highlight.labels',
            alias,
            `LOWER(${alias}.name) = LOWER(:${alias})`,
            {
              [alias]: label,
            }
          )
        })
      }

      return queryBuilder.getMany()
    },
    undefined,
    userId
  )
}
