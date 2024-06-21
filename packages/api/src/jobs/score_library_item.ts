import { SubscriptionType } from '../entity/subscription'
import {
  findLibraryItemById,
  updateLibraryItem,
} from '../services/library_item'
import { Feature, scoreClient } from '../services/score'
import { findSubscriptionsByNames } from '../services/subscriptions'
import { enqueueUpdateHomeJob } from '../utils/createTask'
import { lanaugeToCode } from '../utils/helpers'
import { logger } from '../utils/logger'

export const SCORE_LIBRARY_ITEM_JOB = 'score-library-item'

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
      'subscription',
      'publishedAt',
    ],
  })
  if (!libraryItem) {
    logger.error('Library item not found', data)
    return
  }

  let subscription
  if (libraryItem.subscription) {
    const subscriptions = await findSubscriptionsByNames(userId, [
      libraryItem.subscription,
    ])

    if (subscriptions.length) {
      subscription = subscriptions[0]

      if (subscription.type === SubscriptionType.Rss) {
        logger.info('Skipping scoring for RSS subscription', {
          userId,
          libraryItemId,
        })

        return
      }
    }
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
      subscription: subscription?.name,
      inbox_folder: libraryItem.folder === 'inbox',
      is_feed: subscription?.type === SubscriptionType.Rss,
      is_newsletter: subscription?.type === SubscriptionType.Newsletter,
      is_subscription: !!subscription,
      item_word_count: libraryItem.wordCount,
      subscription_auto_add_to_library: subscription?.autoAddToLibrary,
      subscription_fetch_content: subscription?.fetchContent,
      subscription_count: 0,
    } as Feature,
  }

  const scores = await scoreClient.getScores({
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
