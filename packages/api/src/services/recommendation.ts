import { DeepPartial } from 'typeorm'
import { LibraryItem } from '../entity/library_item'
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

      // update recommendations in the existing item
      await updateLibraryItem(
        existingItem.id,
        {
          recommendations: existingRecommendations.concat(recommendation),
          highlights: existingHighlights.concat(newHighlights),
        },
        userId
      )

      return existingItem
    }

    // create a new item
    const newItem: DeepPartial<LibraryItem> = {
      recommendations: [recommendation],
      user: { id: userId },
      highlights,
      slug: item.slug,
      title: item.title,
      author: item.author,
      description: item.description,
      originalUrl: item.originalUrl,
      originalContent: item.originalContent,
      contentReader: item.contentReader,
      directionality: item.directionality,
      itemLanguage: item.itemLanguage,
      itemType: item.itemType,
      readableContent: item.readableContent,
      siteIcon: item.siteIcon,
      siteName: item.siteName,
      thumbnail: item.thumbnail,
      uploadFile: item.uploadFile,
      wordCount: item.wordCount,
    }

    return createLibraryItem(newItem, userId)
  } catch (err) {
    logger.error('Error adding recommendation', err)
    return null
  }
}
