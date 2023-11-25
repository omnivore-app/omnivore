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
  userId: string,
) => {
  return authTrx(
    async (tx) =>
      tx.withRepository(highlightRepository).createAndSaves(highlights),
    undefined,
    userId,
  )
}

export const createHighlight = async (
  highlight: DeepPartial<Highlight>,
  libraryItemId: string,
  userId: string,
  pubsub = createPubSubClient(),
) => {
  const newHighlight = await authTrx(
    async (tx) => {
      const repo = tx.withRepository(highlightRepository)
      const newHighlight = await repo.createAndSave(highlight)
      return repo.findOneOrFail({
        where: { id: newHighlight.id },
        relations: {
          user: true,
        },
      })
    },
    undefined,
    userId,
  )

  await pubsub.entityCreated<CreateHighlightEvent>(
    EntityType.HIGHLIGHT,
    { ...newHighlight, pageId: libraryItemId },
    userId,
  )

  return newHighlight
}

export const mergeHighlights = async (
  highlightsToRemove: string[],
  highlightToAdd: DeepPartial<Highlight>,
  libraryItemId: string,
  userId: string,
  pubsub = createPubSubClient(),
) => {
  const newHighlight = await authTrx(async (tx) => {
    const highlightRepo = tx.withRepository(highlightRepository)

    await highlightRepo.delete(highlightsToRemove)

    const newHighlight = await highlightRepo.createAndSave(highlightToAdd)
    return highlightRepo.findOneOrFail({
      where: { id: newHighlight.id },
      relations: {
        user: true,
      },
    })
  })

  await pubsub.entityCreated<CreateHighlightEvent>(
    EntityType.HIGHLIGHT,
    { ...newHighlight, pageId: libraryItemId },
    userId,
  )

  return newHighlight
}

export const updateHighlight = async (
  highlightId: string,
  highlight: QueryDeepPartialEntity<Highlight>,
  userId: string,
  pubsub = createPubSubClient(),
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

  await pubsub.entityUpdated<UpdateHighlightEvent>(
    EntityType.HIGHLIGHT,
    { ...highlight, id: highlightId, pageId: updatedHighlight.libraryItem.id },
    userId,
  )

  return updatedHighlight
}

export const deleteHighlightById = async (highlightId: string) => {
  return authTrx(async (tx) => {
    const highlightRepo = tx.withRepository(highlightRepository)
    const highlight = await highlightRepo.findOneOrFail({
      where: { id: highlightId },
      relations: {
        user: true,
      },
    })

    await highlightRepo.delete(highlightId)
    return highlight
  })
}

export const findHighlightById = async (
  highlightId: string,
  userId: string,
) => {
  return authTrx(
    async (tx) => {
      const highlightRepo = tx.withRepository(highlightRepository)
      return highlightRepo.findOneByOrFail({
        id: highlightId,
      })
    },
    undefined,
    userId,
  )
}

export const findHighlightsByLibraryItemId = async (
  libraryItemId: string,
  userId: string,
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
    userId,
  )
}
