import { diff_match_patch } from 'diff-match-patch'
import { DeepPartial } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { Highlight } from '../entity/highlight'
import { homePageURL } from '../env'
import { createPubSubClient, EntityType } from '../pubsub'
import { authTrx } from '../repository'
import { highlightRepository } from '../repository/highlight'

type HighlightEvent = { id: string; pageId: string }
type CreateHighlightEvent = DeepPartial<Highlight> & HighlightEvent
type UpdateHighlightEvent = QueryDeepPartialEntity<Highlight> & HighlightEvent

export const getHighlightLocation = (patch: string): number | undefined => {
  const dmp = new diff_match_patch()
  const patches = dmp.patch_fromText(patch)
  return patches[0].start1 || undefined
}

export const getHighlightUrl = (slug: string, highlightId: string): string =>
  `${homePageURL()}/me/${slug}#${highlightId}`

export const createHighlights = async (
  highlights: DeepPartial<Highlight>[],
  libraryItemId: string,
  userId: string,
  pubsub = createPubSubClient()
) => {
  const newHighlights = await authTrx(
    async (tx) =>
      tx.withRepository(highlightRepository).createAndSaves(highlights),
    undefined,
    userId
  )

  await pubsub.entityCreated<CreateHighlightEvent[]>(
    EntityType.HIGHLIGHT,
    newHighlights.map((highlight) => ({
      ...highlight,
      pageId: libraryItemId,
    })),
    userId
  )

  return newHighlights
}

export const createHighlight = async (
  highlight: DeepPartial<Highlight>,
  libraryItemId: string,
  userId: string,
  pubsub = createPubSubClient()
) => {
  const newHighlight = await authTrx(
    async (tx) =>
      tx.withRepository(highlightRepository).createAndSave(highlight),
    undefined,
    userId
  )

  await pubsub.entityCreated<CreateHighlightEvent>(
    EntityType.HIGHLIGHT,
    { ...newHighlight, pageId: libraryItemId },
    userId
  )

  return newHighlight
}

export const mergeHighlights = async (
  highlightsToRemove: string[],
  highlightToAdd: DeepPartial<Highlight>,
  libraryItemId: string,
  userId: string,
  pubsub = createPubSubClient()
) => {
  const newHighlight = await authTrx(async (tx) => {
    const highlightRepo = tx.withRepository(highlightRepository)

    await highlightRepo.delete(highlightsToRemove)

    return highlightRepo.createAndSave(highlightToAdd)
  })

  await pubsub.entityCreated<CreateHighlightEvent>(
    EntityType.HIGHLIGHT,
    { ...newHighlight, pageId: libraryItemId },
    userId
  )

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
      },
    })
  })

  await pubsub.entityUpdated<UpdateHighlightEvent>(
    EntityType.HIGHLIGHT,
    { ...highlight, id: highlightId, pageId: updatedHighlight.libraryItem.id },
    userId
  )

  return updatedHighlight
}

export const deleteHighlightById = async (highlightId: string) => {
  return authTrx(async (tx) => {
    const highlightRepo = tx.withRepository(highlightRepository)
    const highlight = await highlightRepo.findOneByOrFail({
      id: highlightId,
    })

    await highlightRepo.delete(highlightId)
    return highlight
  })
}

export const findHighlightById = async (
  highlightId: string,
  userId: string
) => {
  return authTrx(
    async (tx) => {
      const highlightRepo = tx.withRepository(highlightRepository)
      return highlightRepo.findOneByOrFail({
        id: highlightId,
      })
    },
    undefined,
    userId
  )
}
