import { diff_match_patch } from 'diff-match-patch'
import { DeepPartial } from 'typeorm'
import { Highlight } from '../entity/highlight'
import { homePageURL } from '../env'
import { createPubSubClient, EntityType } from '../pubsub'
import { authTrx } from '../repository'
import { highlightRepository } from '../repository/highlight'

type HighlightEvent = DeepPartial<Highlight> & { pageId: string }

export const getHighlightLocation = (patch: string): number | undefined => {
  const dmp = new diff_match_patch()
  const patches = dmp.patch_fromText(patch)
  return patches[0].start1 || undefined
}

export const getHighlightUrl = (slug: string, highlightId: string): string =>
  `${homePageURL()}/me/${slug}#${highlightId}`

export const createHighlight = async (
  highlight: DeepPartial<Highlight>,
  libraryItemId: string,
  userId: string,
  pubsub = createPubSubClient()
) => {
  const newHighlight = await authTrx(async (tx) => {
    return tx
      .withRepository(highlightRepository)
      .createAndSave(highlight, libraryItemId, userId)
  })

  await pubsub.entityCreated<HighlightEvent>(
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

    return highlightRepo.createAndSave(highlightToAdd, libraryItemId, userId)
  })

  await pubsub.entityCreated<HighlightEvent>(
    EntityType.HIGHLIGHT,
    { ...newHighlight, pageId: libraryItemId },
    userId
  )

  return newHighlight
}

export const updateHighlight = async (
  highlightId: string,
  highlight: DeepPartial<Highlight>,
  userId: string,
  pubsub = createPubSubClient()
) => {
  const updatedHighlight = await authTrx(async (tx) => {
    const highlightRepo = tx.withRepository(highlightRepository)
    await highlightRepo.save({
      ...highlight,
      id: highlightId,
    })

    return highlightRepo.findOneByOrFail({
      id: highlightId,
    })
  })

  await pubsub.entityUpdated<HighlightEvent>(
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
