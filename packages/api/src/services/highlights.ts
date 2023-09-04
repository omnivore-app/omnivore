import { diff_match_patch } from 'diff-match-patch'
import { DeepPartial } from 'typeorm'
import { Highlight } from '../entity/highlight'
import { homePageURL } from '../env'
import { createPubSubClient, EntityType } from '../pubsub'
import { authTrx, setClaims } from '../repository'
import { highlightRepository } from '../repository/highlight'

type HighlightEvent = Highlight & { pageId: string }

export const getHighlightLocation = (patch: string): number | undefined => {
  const dmp = new diff_match_patch()
  const patches = dmp.patch_fromText(patch)
  return patches[0].start1 || undefined
}

export const getHighlightUrl = (slug: string, highlightId: string): string =>
  `${homePageURL()}/me/${slug}#${highlightId}`

export const saveHighlight = async (
  highlight: DeepPartial<Highlight>,
  userId: string,
  pubsub = createPubSubClient()
) => {
  const newHighlight = await authTrx(async (tx) => {
    await setClaims(tx, userId)

    return tx
      .withRepository(highlightRepository)
      .createAndSave(highlight, userId)
  })

  await pubsub.entityCreated<HighlightEvent>(
    EntityType.HIGHLIGHT,
    { ...newHighlight, pageId: newHighlight.libraryItem.id },
    userId
  )

  return newHighlight
}

export const mergeHighlights = async (
  highlightsToRemove: string[],
  highlightToAdd: DeepPartial<Highlight>,
  userId: string,
  pubsub = createPubSubClient()
) => {
  const newHighlight = await authTrx(async (tx) => {
    const highlightRepo = tx.withRepository(highlightRepository)

    await highlightRepo.delete(highlightsToRemove)

    return highlightRepo.createAndSave(highlightToAdd, userId)
  })

  await pubsub.entityCreated<HighlightEvent>(
    EntityType.HIGHLIGHT,
    { ...newHighlight, pageId: newHighlight.libraryItem.id },
    userId
  )

  return newHighlight
}

export const deleteHighlightById = async (highlightId: string) => {
  return authTrx(async (tx) => {
    const highlightRepo = tx.withRepository(highlightRepository)
    const highlight = await highlightRepo.findById(highlightId)
    if (!highlight) {
      throw new Error(`Highlight ${highlightId} not found`)
    }

    return highlightRepo.remove(highlight)
  })
}
