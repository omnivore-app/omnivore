import { DeepPartial } from 'typeorm'
import { LibraryItem, LibraryItemState } from '../entity/library_item'
import { Recommendation } from '../entity/recommendation'
import { logger } from '../utils/logger'
import {
  createLibraryItem,
  findLibraryItemByUrl,
  updateLibraryItem,
} from './library_item'

export const addRecommendation = async (
  item: LibraryItem,
  recommendation: Recommendation,
  userId: string,
  highlightIds?: string[]
) => {
  try {
    const highlights = item.highlights?.filter((highlight) =>
      highlightIds?.includes(highlight.id)
    )

    // check if the item is already recommended to the group
    const existingItem = await findLibraryItemByUrl(item.originalUrl, userId)
    if (existingItem) {
      const existingHighlights = existingItem.highlights || []

      // remove duplicates
      const newHighlights =
        highlights?.filter(
          (highlight) =>
            !existingHighlights.find(
              (existingHighlight) => existingHighlight.quote === highlight.quote
            )
        ) || []

      const existingRecommendations = existingItem.recommendations || []
      const isRecommended = existingRecommendations.some(
        (existingRecommendation) =>
          existingRecommendation.id === recommendation.id
      )
      if (isRecommended && newHighlights.length === 0) {
        return existingItem
      }

      // update recommendations in the existing item
      const recommendations = isRecommended
        ? undefined
        : existingRecommendations.concat(recommendation)

      await updateLibraryItem(
        existingItem.id,
        {
          recommendations,
          highlights: existingHighlights.concat(newHighlights),
        },
        userId
      )

      return existingItem
    }

    // create a new item
    const newItem: DeepPartial<LibraryItem> = {
      ...item,
      id: '',
      recommendations: [recommendation],
      user: { id: userId },
      readingProgressTopPercent: 0,
      readingProgressBottomPercent: 0,
      highlights,
      readAt: null,
      labels: [],
      archivedAt: null,
      state: LibraryItemState.Succeeded,
    }

    return createLibraryItem(newItem, userId)
  } catch (err) {
    logger.error('Error adding recommendation', err)
    return null
  }
}
