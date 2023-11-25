import { authorized } from '../../utils/helpers'
import {
  GetDiscoveryArticleSuccess,
  GetDiscoveryArticleError,
  GetDiscoveryArticleErrorCode,
  QueryGetDiscoveryArticlesArgs,
  SaveDiscoveryArticleSuccess,
  SaveDiscoveryArticleError,
  SaveDiscoveryArticleErrorCode,
  MutationSaveDiscoveryArticleArgs,
  InputMaybe,
  SaveSuccess,
  DeleteDiscoveryArticleSuccess,
  MutationDeleteDiscoveryArticleArgs,
  DeleteDiscoveryArticleError,
  DeleteDiscoveryArticleErrorCode,
} from '../../generated/graphql'
import { appDataSource } from '../../data_source'
import { QueryRunner } from 'typeorm'
import { saveUrl } from '../../services/save_url'
import { userRepository } from '../../repository/user'
import { v4 } from 'uuid'
import { updateLibraryItem } from '../../services/library_item'
import { LibraryItemState } from '../../entity/library_item'

type DiscoverArticleDBRows = {
  rows: {
    id: string
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
  queryRunner: QueryRunner,
  uid: string,
  after: string,
  amt: number,
): Promise<DiscoverArticleDBRows> => {
  return queryRunner.query(
    `
      SELECT id, title, slug, description, url, author, image, published_at, COALESCE(sl.count / (EXTRACT(EPOCH FROM (NOW() - published_at)) / 3600 / 24), 0) as popularity_score, article_save_id, article_save_url
      FROM omnivore.omnivore.discover_articles 
      LEFT JOIN (SELECT discover_article_id as article_id, count(*) as count FROM omnivore.discover_save_link group by discover_article_id) sl on id=sl.article_id
      LEFT JOIN ( SELECT discover_article_id, article_save_id, article_save_url FROM omnivore.discover_save_link WHERE user_id=$1 and deleted = false) su on id=su.discover_article_id
      WHERE COALESCE(sl.count / (EXTRACT(EPOCH FROM (NOW() - published_at)) / 3600 / 24), 0)  > 0.0
      ORDER BY popularity_score DESC
      LIMIT $2 OFFSET $3
      `,
    [uid, amt, after],
  ) as Promise<DiscoverArticleDBRows>
}

const getAllTopics = (
  queryRunner: QueryRunner,
  uid: string,
  after: string,
  amt: number,
): Promise<DiscoverArticleDBRows> => {
  return queryRunner.query(
    `
      SELECT id, title, slug, description, url, author, image, published_at, article_save_id, article_save_url
      FROM omnivore.omnivore.discover_articles 
      LEFT JOIN (SELECT discover_article_id as article_id, count(*) as count FROM omnivore.discover_save_link group by discover_article_id) sl on id=sl.article_id
      LEFT JOIN ( SELECT discover_article_id, article_save_id, article_save_url FROM omnivore.discover_save_link WHERE user_id=$1 and deleted = false) su on id=su.discover_article_id
      ORDER BY published_at DESC
      LIMIT $2 OFFSET $3
      `,
    [uid, amt, after],
  ) as Promise<DiscoverArticleDBRows>
}

const getTopicInformation = (
  queryRunner: QueryRunner,
  discoveryTopicId: string,
  uid: string,
  after: string,
  amt: number,
): Promise<DiscoverArticleDBRows> => {
  return queryRunner.query(
    `
      SELECT id, title, slug, description, url, author, image, published_at, COALESCE(sl.count, 0) as saves, article_save_id, article_save_url
      FROM omnivore.discover_article_topic_link 
      INNER JOIN omnivore.discover_articles on id=discover_article_id  
      LEFT JOIN (SELECT discover_article_id as article_id, count(*) as count FROM omnivore.discover_save_link group by discover_article_id) sl on id=sl.article_id
      LEFT JOIN ( SELECT discover_article_id, article_save_id, article_save_url FROM omnivore.discover_save_link WHERE user_id=$1 and deleted = false) su on id=su.discover_article_id
      WHERE discover_topic_name=$2
      ORDER BY published_at DESC
      LIMIT $3 OFFSET $4
      `,
    [uid, discoveryTopicId, amt + 1, Number(after)],
  ) as Promise<DiscoverArticleDBRows>
}

export const getDiscoveryArticlesResolver = authorized<
  GetDiscoveryArticleSuccess,
  GetDiscoveryArticleError,
  QueryGetDiscoveryArticlesArgs
>(async (_, { discoveryTopicId, first, after }, { uid, log }) => {
  try {
    const startCursor: string = after || ''
    const firstAmnt = Math.min(first || 10, 100) // limit to 100 items

    const queryRunner = (await appDataSource
      .createQueryRunner()
      .connect()) as QueryRunner

    const { rows: topics } = (await queryRunner.query(
      `SELECT * FROM "omnivore"."discover_topics" WHERE "name" = $1`,
      [discoveryTopicId],
    )) as { rows: unknown[] }

    if (topics.length == 0) {
      return {
        __typename: 'GetDiscoveryArticleError',
        errorCodes: [GetDiscoveryArticleErrorCode.Unauthorized], // TODO - no.
      }
    }

    log.info(discoveryTopicId)
    let discoverArticles: DiscoverArticleDBRows = { rows: [] }
    if (discoveryTopicId === 'Popular') {
      discoverArticles = await getPopularTopics(
        queryRunner,
        uid,
        startCursor,
        firstAmnt,
      )
    } else if (discoveryTopicId === 'All') {
      log.info(discoveryTopicId)
      discoverArticles = await getAllTopics(
        queryRunner,
        uid,
        startCursor,
        firstAmnt,
      )
      log.info(discoverArticles)
    } else {
      discoverArticles = await getTopicInformation(
        queryRunner,
        discoveryTopicId,
        uid,
        startCursor,
        firstAmnt,
      )
    }

    await queryRunner.release()

    return {
      __typename: 'GetDiscoveryArticleSuccess',
      discoverArticles: discoverArticles.rows.slice(0, firstAmnt).map((it) => ({
        author: it.author,
        id: it.id,
        slug: it.slug,
        publishedDate: it.published_at,
        description: it.description,
        url: it.url,
        title: it.title,
        image: it.image,
        saves: it.saves,
        savedLinkUrl: it.article_save_url,
        savedId: it.article_save_id,
        __typename: 'DiscoveryArticle',
        siteName: it.url,
      })),
      pageInfo: {
        endCursor: `${
          Number(startCursor) +
          Math.min(discoverArticles.rows.length, firstAmnt)
        }`,
        hasNextPage: discoverArticles.rows.length > firstAmnt,
        hasPreviousPage: Number(startCursor) != 0,
        startCursor: Number(startCursor).toString(),
        totalCount: Math.min(discoverArticles.rows.length, firstAmnt),
      },
    }
  } catch (error) {
    log.error('Error Getting Discovery Articles', error)

    return {
      __typename: 'GetDiscoveryArticleError',
      errorCodes: [GetDiscoveryArticleErrorCode.Unauthorized],
    }
  }
})

export const saveDiscoveryArticleResolver = authorized<
  SaveDiscoveryArticleSuccess,
  SaveDiscoveryArticleError,
  MutationSaveDiscoveryArticleArgs
>(
  async (
    _,
    { input: { discoveryArticleId, timezone, locale } },
    { uid, log },
  ) => {
    try {
      const queryRunner = (await appDataSource
        .createQueryRunner()
        .connect()) as QueryRunner

      const user = await userRepository.findById(uid)
      if (!user) {
        return {
          __typename: 'SaveDiscoveryArticleError',
          errorCodes: [SaveDiscoveryArticleErrorCode.Unauthorized],
        }
      }

      const { rows: discoverArticles } = (await queryRunner.query(
        `SELECT url FROM omnivore.discover_articles WHERE id=$1`,
        [discoveryArticleId],
      )) as {
        rows: {
          url: string
        }[]
      }

      if (discoverArticles.length != 1) {
        return {
          __typename: 'SaveDiscoveryArticleError',
          errorCodes: [SaveDiscoveryArticleErrorCode.NotFound],
        }
      }

      const url = discoverArticles[0].url
      const savedArticle = await saveUrl(
        {
          url,
          source: 'add-link',
          clientRequestId: v4(),
          locale: locale as InputMaybe<string>,
          timezone: timezone as InputMaybe<string>,
        },
        user,
      )

      if (savedArticle.__typename == 'SaveError') {
        return {
          __typename: 'SaveDiscoveryArticleError',
          errorCodes: [SaveDiscoveryArticleErrorCode.BadRequest],
        }
      }

      const saveSuccess = savedArticle as SaveSuccess

      await queryRunner.query(
        `insert into omnivore.discover_save_link (discover_article_id, user_id, article_save_id, article_save_url) VALUES ($1, $2, $3, $4) ON CONFLICT ON CONSTRAINT user_discovery_link DO UPDATE SET (article_save_id, article_save_url, deleted) = ($3, $4, false);`,
        [discoveryArticleId, uid, saveSuccess.clientRequestId, saveSuccess.url],
      )

      await queryRunner.release()

      return {
        __typename: 'SaveDiscoveryArticleSuccess',
        url: saveSuccess.url,
        saveId: saveSuccess.clientRequestId,
      }
    } catch (error) {
      log.error('Error Saving Article', error)

      return {
        __typename: 'SaveDiscoveryArticleError',
        errorCodes: [SaveDiscoveryArticleErrorCode.Unauthorized],
      }
    }
  },
)

export const deleteDiscoveryArticleResolver = authorized<
  DeleteDiscoveryArticleSuccess,
  DeleteDiscoveryArticleError,
  MutationDeleteDiscoveryArticleArgs
>(async (_, { input: { discoveryArticleId } }, { uid, log, pubsub }) => {
  try {
    const queryRunner = (await appDataSource
      .createQueryRunner()
      .connect()) as QueryRunner

    const user = await userRepository.findById(uid)
    if (!user) {
      return {
        __typename: 'DeleteDiscoveryArticleError',
        errorCodes: [DeleteDiscoveryArticleErrorCode.Unauthorized],
      }
    }

    const { rows: discoverArticles } = (await queryRunner.query(
      `SELECT article_save_id FROM omnivore.discover_save_link WHERE discover_article_id=$1 and user_id=$2`,
      [discoveryArticleId, uid],
    )) as {
      rows: { article_save_id: string }[]
    }

    if (discoverArticles.length != 1) {
      return {
        __typename: 'DeleteDiscoveryArticleError',
        errorCodes: [DeleteDiscoveryArticleErrorCode.NotFound],
      }
    }

    await queryRunner.query(
      `UPDATE omnivore.discover_save_link set deleted = true WHERE discover_article_id=$1 and user_id=$2`,
      [discoveryArticleId, uid],
    )

    await updateLibraryItem(
      discoverArticles[0].article_save_id,
      {
        state: LibraryItemState.Deleted,
        deletedAt: new Date(),
      },
      uid,
      pubsub,
    )

    await queryRunner.release()

    return {
      __typename: 'DeleteDiscoveryArticleSuccess',
      id: discoveryArticleId,
    }
  } catch (error) {
    log.error('Error Deleting Article', error)

    return {
      __typename: 'DeleteDiscoveryArticleError',
      errorCodes: [DeleteDiscoveryArticleErrorCode.Unauthorized],
    }
  }
})
