import {
  findLibraryItemById,
  updateLibraryItem,
} from '../services/library_item'
import { Feature, getScores } from '../services/score'
import { enqueueUpdateHomeJob } from '../utils/createTask'
import { lanaugeToCode } from '../utils/helpers'
import { logger } from '../utils/logger'

export const SCORE_LIBRARY_ITEM_JOB = 'SCORE_LIBRARY_ITEM_JOB'

export interface ScoreLibraryItemJobData {
  userId: string
  libraryItemId: string
}

export const scoreLibraryItem = async (
  data: ScoreLibraryItemJobData
): Promise<void> => {
  logger.info('Scoring library item', data)

  const { userId, libraryItemId } = data

  const libraryItem = await findLibraryItemById(libraryItemId, userId, {
    select: [
      'id',
      'title',
      'thumbnail',
      'siteIcon',
      'savedAt',
      'siteName',
      'directionality',
      'folder',
      'author',
      'itemLanguage',
      'wordCount',
    ],
  })
  if (!libraryItem) {
    logger.error('Library item not found', data)
    return
  }

  const itemFeatures = {
    [libraryItem.id]: {
      library_item_id: libraryItem.id,
      title: libraryItem.title,
      has_thumbnail: !!libraryItem.thumbnail,
      has_site_icon: !!libraryItem.siteIcon,
      saved_at: libraryItem.savedAt,
      site: libraryItem.siteName,
      directionality: libraryItem.directionality,
      folder: libraryItem.folder,
      subscription_type: 'library',
      author: libraryItem.author,
      language: lanaugeToCode(libraryItem.itemLanguage || 'English'),
      word_count: libraryItem.wordCount,
      published_at: libraryItem.publishedAt,
      subscription: libraryItem.subscription,
    } as Feature,
  }

  const scores = await getScores({
    user_id: userId,
    items: itemFeatures,
  })

  logger.info('Scores', scores)
  const score = scores[libraryItem.id]['score']
  if (!score) {
    logger.error('Failed to score library item', data)
    throw new Error('Failed to score library item')
  }

  await updateLibraryItem(
    libraryItem.id,
    {
      score,
    },
    userId,
    undefined,
    true
  )
  logger.info('Library item scored', data)

  try {
    await enqueueUpdateHomeJob({
      userId,
    })
  } catch (error) {
    logger.error('Failed to enqueue update home job', error)
  }
}
