import { diff_match_patch } from 'diff-match-patch'
import { DeepPartial } from 'typeorm'
import { Highlight } from '../entity/highlight'
import { homePageURL } from '../env'
import { createPubSubClient, EntityType } from '../pubsub'
import { authTrx, setClaims } from '../repository'
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
    await setClaims(tx, userId)

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
    await tx.withRepository(highlightRepository).save({
      ...highlight,
      id: highlightId,
    })

    return tx.withRepository(highlightRepository).findById(highlightId)
  })

  if (!updatedHighlight) {
    throw new Error(`Highlight ${highlightId} not found`)
  }

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
    const highlight = await highlightRepo.findById(highlightId)
    if (!highlight) {
      throw new Error(`Highlight ${highlightId} not found`)
    }

    await highlightRepo.delete(highlightId)
    return highlight
  })
}
