import { appDataSource } from '../../../data_source'
import {
  GetDiscoverFeedArticleError,
  GetDiscoverFeedArticleErrorCode,
  GetDiscoverFeedArticleSuccess,
  QueryGetDiscoverFeedArticlesArgs,
} from '../../../generated/graphql'
import { authorized } from '../../../utils/gql-utils'

const COMMUNITY_FEED_ID = '8217d320-aa5a-11ee-bbfe-a7cde356f524'

type DiscoverFeedArticleDBRows = {
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
  hidden: boolean | undefined
}[]

const getPopularTopics = (
  uid: string,
  after: string,
  amt: number,
  feedId: string | null = null,
  showHidden = false
): Promise<DiscoverFeedArticleDBRows> => {
  const params = [uid, amt + 1, after]
  if (feedId) {
    params.push(feedId)
  }
  return appDataSource.query(
    `
      SELECT id, title, feed_id as feed, slug, description, url, author, image, published_at, COALESCE(sl.count / (EXTRACT(EPOCH FROM (NOW() - published_at)) / 3600 / 24), 0) as popularity_score, article_save_id, article_save_url, case when sh.discover_article_id is NULL then false else true end as hidden 
      FROM omnivore.discover_feed_articles 
      LEFT JOIN (SELECT discover_article_id as article_id, count(*) as count FROM omnivore.discover_feed_save_link group by discover_article_id) sl on id=sl.article_id
      LEFT JOIN (SELECT discover_article_id, article_save_id, article_save_url FROM omnivore.discover_feed_save_link WHERE user_id=$1 and deleted = false) su on id=su.discover_article_id
      LEFT JOIN (SELECT discover_article_id FROM omnivore.discover_feed_hide_link WHERE user_id=$1) sh on id=sh.discover_article_id
      WHERE COALESCE(sl.count / (EXTRACT(EPOCH FROM (NOW() - published_at)) / 3600 / 24), 0)  > 0.0
      AND (feed_id in (SELECT feed_id FROM omnivore.discover_feed_subscription WHERE user_id = $1) OR feed_id = '${COMMUNITY_FEED_ID}')
      ${feedId != null ? `AND feed_id = $4` : ''}
      ${!showHidden ? `AND sh.discover_article_id is NULL` : ''}
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
  feedId: string | null = null,
  showHidden = true
): Promise<DiscoverFeedArticleDBRows> => {
  const params = [uid, amt + 1, after]
  if (feedId) {
    params.push(feedId)
  }
  return appDataSource.query(
    `
      SELECT id, title, feed_id as feed, slug, description, url, author, image, published_at, article_save_id, article_save_url, case when sh.discover_article_id is NULL then false else true end as hidden
      FROM omnivore.discover_feed_articles 
      LEFT JOIN (SELECT discover_article_id, article_save_id, article_save_url FROM omnivore.discover_feed_save_link WHERE user_id=$1 and deleted = false) su on id=su.discover_article_id
      LEFT JOIN (SELECT discover_article_id FROM omnivore.discover_feed_hide_link WHERE user_id=$1) sh on id=sh.discover_article_id
      WHERE (feed_id in (SELECT feed_id FROM omnivore.discover_feed_subscription WHERE user_id = $1) OR feed_id = '${COMMUNITY_FEED_ID}') 
      ${feedId != null ? `AND feed_id = $4` : ''}
      ${!showHidden ? `AND sh.discover_article_id is NULL` : ''}
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
  feedId: string | null = null,
  showHidden = true
): Promise<DiscoverFeedArticleDBRows> => {
  const params = [uid, discoverTopicId, amt + 1, Number(after)]
  if (feedId) {
    params.push(feedId)
  }
  return appDataSource.query(
    `SELECT id, title, feed_id as feed, slug, description, url, author, image, published_at, article_save_id, article_save_url, case when sh.discover_article_id is NULL then false else true end as hidden
     FROM omnivore.discover_feed_articles
     INNER JOIN (SELECT discover_feed_article_id FROM omnivore.discover_feed_article_topic_link WHERE discover_topic_name=$2) topic on topic.discover_feed_article_id=id
     LEFT JOIN (SELECT discover_article_id, article_save_id, article_save_url FROM omnivore.discover_feed_save_link WHERE user_id=$1 and deleted = false) su on id=su.discover_article_id
     LEFT JOIN (SELECT discover_article_id FROM omnivore.discover_feed_hide_link WHERE user_id=$1) sh on id=sh.discover_article_id
     WHERE (feed_id in (SELECT feed_id FROM omnivore.discover_feed_subscription WHERE user_id = $1) OR feed_id = '${COMMUNITY_FEED_ID}')  
     ${feedId != null ? `AND feed_id = $5` : ''}
     ${!showHidden ? `AND sh.discover_article_id is NULL` : ''}
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
>(
  async (
    _,
    { discoverTopicId, feedId, first, after, showHidden },
    { uid, log }
  ) => {
    try {
      const startCursor: string = after || ''
      const firstAmnt = Math.min(first || 10, 100) // limit to 100 items

      const topics = (await appDataSource.query(
        `SELECT * FROM omnivore.discover_topics WHERE name = $1`,
        [discoverTopicId]
      )) as { name: string }[]

      if (topics.length == 0) {
        return {
          __typename: 'GetDiscoverFeedArticleError',
          errorCodes: [GetDiscoverFeedArticleErrorCode.Unauthorized], // TODO - no.
        }
      }

      let discoverArticles: DiscoverFeedArticleDBRows = []
      if (discoverTopicId === 'Popular') {
        discoverArticles = await getPopularTopics(
          uid,
          startCursor,
          firstAmnt,
          feedId ?? null,
          !!showHidden
        )
      } else if (discoverTopicId === 'All') {
        discoverArticles = await getAllTopics(
          uid,
          startCursor,
          firstAmnt,
          feedId ?? null,
          !!showHidden
        )
      } else {
        discoverArticles = await getTopicInformation(
          discoverTopicId,
          uid,
          startCursor,
          firstAmnt,
          feedId ?? null,
          !!showHidden
        )
      }

      return {
        __typename: 'GetDiscoverFeedArticleSuccess',
        discoverArticles: discoverArticles.slice(0, firstAmnt).map((it) => ({
          author: it.author,
          id: it.id,
          feed: it.feed,
          slug: it.slug,
          publishedDate: it.published_at,
          description: it.description,
          url: it.url,
          title: it.title,
          image: it.image,
          saves: it.saves,
          savedLinkUrl: it.article_save_url,
          savedId: it.article_save_id,
          __typename: 'DiscoverFeedArticle',
          siteName: it.url,
          hidden: !!it.hidden,
        })),
        pageInfo: {
          endCursor: `${
            Number(startCursor) + Math.min(discoverArticles.length, firstAmnt)
          }`,
          hasNextPage: discoverArticles.length > firstAmnt,
          hasPreviousPage: Number(startCursor) != 0,
          startCursor: Number(startCursor).toString(),
          totalCount: Math.min(discoverArticles.length, firstAmnt),
        },
      }
    } catch (error) {
      log.error('Error Getting Discover Feed Articles', error)

      return {
        __typename: 'GetDiscoverFeedArticleError',
        errorCodes: [GetDiscoverFeedArticleErrorCode.Unauthorized],
      }
    }
  }
)
