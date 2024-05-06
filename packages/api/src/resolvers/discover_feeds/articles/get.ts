import { appDataSource } from '../../../data_source'
import {
  GetDiscoverFeedArticleError,
  GetDiscoverFeedArticleErrorCode,
  GetDiscoverFeedArticleSuccess,
  QueryGetDiscoverFeedArticlesArgs,
} from '../../../generated/graphql'
import { searchAndCountLibraryItems } from '../../../services/library_item'
import { findTopicByName } from '../../../services/topic'
import { authorized } from '../../../utils/gql-utils'

const COMMUNITY_FEED_ID = '8217d320-aa5a-11ee-bbfe-a7cde356f524'

type DiscoverFeedArticleDBRows = {
  rows: {
    id: string
    feed: string
    title: string
    slug: string
    url: string
    author: string
    image: string
    published_at: Date
    description: string
    saves: number
    article_save_id: string | undefined
    article_save_url: string | undefined
  }[]
}

const getPopularTopics = (
  uid: string,
  after: string,
  amt: number,
  feedId: string | null = null
): Promise<DiscoverFeedArticleDBRows> => {
  const params = [uid, amt + 1, after]
  if (feedId) {
    params.push(feedId)
  }
  return appDataSource.query(
    `
      SELECT id, title, feed_id as feed, slug, description, url, author, image, published_at, COALESCE(sl.count / (EXTRACT(EPOCH FROM (NOW() - published_at)) / 3600 / 24), 0) as popularity_score, article_save_id, article_save_url
      FROM omnivore.discover_feed_articles 
      LEFT JOIN (SELECT discover_article_id as article_id, count(*) as count FROM omnivore.discover_feed_save_link group by discover_article_id) sl on id=sl.article_id
      LEFT JOIN (SELECT discover_article_id, article_save_id, article_save_url FROM omnivore.discover_feed_save_link WHERE user_id=$1 and deleted = false) su on id=su.discover_article_id
      WHERE COALESCE(sl.count / (EXTRACT(EPOCH FROM (NOW() - published_at)) / 3600 / 24), 0)  > 0.0
      AND (feed_id in (SELECT feed_id FROM omnivore.discover_feed_subscription WHERE user_id = $1) OR feed_id = '${COMMUNITY_FEED_ID}')       ${
      feedId != null ? `AND feed_id = $4` : ''
    }
      ORDER BY popularity_score DESC
      LIMIT $2 OFFSET $3
      `,
    params
  ) as Promise<DiscoverFeedArticleDBRows>
}

const getAllTopics = (
  uid: string,
  after: string,
  amt: number,
  feedId: string | null = null
): Promise<DiscoverFeedArticleDBRows> => {
  const params = [uid, amt + 1, after]
  if (feedId) {
    params.push(feedId)
  }
  return appDataSource.query(
    `
      SELECT id, title, feed_id as feed, slug, description, url, author, image, published_at, article_save_id, article_save_url
      FROM omnivore.discover_feed_articles 
      LEFT JOIN (SELECT discover_article_id, article_save_id, article_save_url FROM omnivore.discover_feed_save_link WHERE user_id=$1 and deleted = false) su on id=su.discover_article_id
      WHERE (feed_id in (SELECT feed_id FROM omnivore.discover_feed_subscription WHERE user_id = $1) OR feed_id = '${COMMUNITY_FEED_ID}') 
      ${feedId != null ? `AND feed_id = $4` : ''}
      ORDER BY published_at DESC
      LIMIT $2 OFFSET $3
      `,
    params
  ) as Promise<DiscoverFeedArticleDBRows>
}

const getTopicInformation = (
  discoverTopicId: string,
  uid: string,
  after: string,
  amt: number,
  feedId: string | null = null
): Promise<DiscoverFeedArticleDBRows> => {
  const params = [uid, discoverTopicId, amt + 1, Number(after)]
  if (feedId) {
    params.push(feedId)
  }
  return appDataSource.query(
    `SELECT id, title, feed_id as feed, slug, description, url, author, image, published_at, article_save_id, article_save_url 
     FROM omnivore.discover_feed_articles
     INNER JOIN (SELECT discover_feed_article_id FROM omnivore.discover_feed_article_topic_link WHERE discover_topic_name=$2) topic on topic.discover_feed_article_id=id
     LEFT JOIN (SELECT discover_article_id, article_save_id, article_save_url FROM omnivore.discover_feed_save_link WHERE user_id=$1 and deleted = false) su on id=su.discover_article_id
     WHERE (feed_id in (SELECT feed_id FROM omnivore.discover_feed_subscription WHERE user_id = $1) OR feed_id = '${COMMUNITY_FEED_ID}')  
     ${feedId != null ? `AND feed_id = $5` : ''}
     ORDER BY published_at DESC
     LIMIT $3 OFFSET $4
     `,
    params
  ) as Promise<DiscoverFeedArticleDBRows>
}

export const getDiscoverFeedArticlesResolver = authorized<
  GetDiscoverFeedArticleSuccess,
  GetDiscoverFeedArticleError,
  QueryGetDiscoverFeedArticlesArgs
>(async (_, { first, after, discoverTopicId }, { authTrx, uid }) => {
  const startCursor: string = after || ''
  first = Math.min(first || 10, 100) // limit to 100 items

  let topicEmbedding = '*'
  if (discoverTopicId !== 'All') {
    const topic = await authTrx(
      async (tx) => await findTopicByName(discoverTopicId, tx)
    )

    if (!topic || !topic.embedding) {
      return {
        __typename: 'GetDiscoverFeedArticleError',
        errorCodes: [GetDiscoverFeedArticleErrorCode.Unauthorized],
      }
    }

    topicEmbedding = topic.embedding.toString()
  }

  const { libraryItems, count } = await searchAndCountLibraryItems(
    {
      from: Number(startCursor),
      size: first + 1, // fetch one more item to get next cursor
      includeShared: true,
      query: `topic:${topicEmbedding}`,
    },
    uid
  )

  const start =
    startCursor && !isNaN(Number(startCursor)) ? Number(startCursor) : 0
  const hasNextPage = libraryItems.length > first
  const endCursor = String(start + libraryItems.length - (hasNextPage ? 1 : 0))

  if (hasNextPage) {
    // remove an extra if exists
    libraryItems.pop()
  }

  return {
    __typename: 'GetDiscoverFeedArticleSuccess',
    discoverArticles: libraryItems.map((it) => ({
      description: it.description || '',
      feed: it.subscription || '',
      id: it.id,
      slug: it.slug,
      title: it.title,
      url: it.originalUrl,
      __typename: 'DiscoverFeedArticle',
    })),
    pageInfo: {
      hasPreviousPage: false,
      startCursor,
      hasNextPage,
      endCursor,
      totalCount: count,
    },
  }
})
