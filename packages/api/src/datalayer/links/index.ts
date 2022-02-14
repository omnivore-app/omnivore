/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  CreateSet,
  keys as modelKeys,
  ParametersSet,
  UpdateSet,
  UserArticleData,
  UserFeedArticleData,
} from './model'
import DataModel, { MAX_RECORDS_LIMIT } from '../model'
import Knex from 'knex'
import { Table } from '../../utils/dictionary'
import {
  Article,
  PageType,
  SortOrder,
  SortParams,
} from '../../generated/graphql'
import { ENABLE_DB_REQUEST_LOGGING, globalCounter, logMethod } from '../helpers'
import DataLoader from 'dataloader'
import { ArticleData } from '../article/model'
import { InFilter, ReadFilter } from '../../utils/search'

type PartialArticle = Omit<
  Article,
  'updatedAt' | 'readingProgressPercent' | 'readingProgressAnchorIndex'
>

type UserArticleStats = {
  highlightsCount: string
  annotationsCount: string
}

const LINK_COLS = [
  'omnivore.links.userId',
  'omnivore.links.slug',
  'omnivore.links.article_url as url',
  'omnivore.links.createdAt',
  'omnivore.links.sharedAt',
  'omnivore.links.savedAt',
  'omnivore.links.sharedComment',
  'omnivore.links.articleReadingProgress',
  'omnivore.links.articleReadingProgressAnchorIndex',
  'omnivore.pages.id',
  'omnivore.pages.pageType',
  'omnivore.pages.url as originalArticleUrl',
  'omnivore.pages.title',
  'omnivore.pages.description',
  'omnivore.pages.hash',
  'omnivore.pages.author',
  'omnivore.pages.image',
  'omnivore.pages.pageType',
  'omnivore.pages.publishedAt',
]

// When fetching the library list we don't need to
// pull all the content out of the database into
// memory just to discard it later
const linkColsWithoutContent = (tx: Knex) => {
  return [
    tx.raw(`
      CASE
        WHEN omnivore.links.article_reading_progress < 98 THEN 'UNREAD'
        ELSE 'READ'
      END
      as read_status
    `),
    tx.raw(`
    CASE
      WHEN omnivore.links.archived_at is null THEN false
      ELSE true
    END
    as is_archived
    `),
    ...LINK_COLS,
  ]
}

const linkCols = (tx: Knex) => {
  return [
    'omnivore.pages.content',
    'omnivore.pages.originalHtml',
    ...linkColsWithoutContent(tx),
  ]
}


const readFilterQuery = (filter: ReadFilter) => {
  switch (filter) {
    case ReadFilter.ALL:
      return 'true'
    case ReadFilter.UNREAD:
      return 'omnivore.links.article_reading_progress < 98'
    case ReadFilter.READ:
      return 'omnivore.links.article_reading_progress >= 98'
  }
}

class UserArticleModel extends DataModel<
  UserArticleData,
  CreateSet,
  UpdateSet
> {
  public tableName = Table.LINKS
  protected modelKeys = modelKeys
  protected userAndArticleLoader: DataLoader<
    { userId: string; articleId: string },
    UserArticleData
  >
  protected userArticleStatsLoader: DataLoader<string, UserArticleStats>
  getStats: DataLoader<string, UserArticleStats>['load']

  constructor(kx: Knex, cache = true) {
    super(kx, cache)
    this.userAndArticleLoader = new DataLoader(
      async (keys) => {
        if (ENABLE_DB_REQUEST_LOGGING) {
          globalCounter.log(
            this.tableName,
            'userId_articleId_load',
            JSON.stringify(keys)
          )
        }
        try {
          const rows: UserArticleData[] = await this.kx(this.tableName)
            .select(this.modelKeys)
            .whereIn(
              ['articleId', 'userId'],
              keys.map((key) => [key.articleId, key.userId])
            )
            .limit(MAX_RECORDS_LIMIT)

          const keyMap: Map<string, UserArticleData> = new Map()
          for (const row of rows) {
            const hash = `${row.userId}.${row.articleId}`
            if (keyMap.has(hash)) continue
            keyMap.set(hash, row)
          }

          const result = keys.map(({ userId, articleId }) =>
            keyMap.get(`${userId}.${articleId}`)
          ) as UserArticleData[]
          // logger.debug('\n\n\n\n\nResult for userId_articleId_load', { keys, result });

          if (result.length !== keys.length) {
            console.error('DataModel error: count mismatch ', keys, result)
          }
          return result
        } catch (e) {
          console.error('DataModel error: ', e)
          throw e
        }
      },
      { cache }
    )

    this.userArticleStatsLoader = new DataLoader(
      async (keys) => {
        if (ENABLE_DB_REQUEST_LOGGING) {
          globalCounter.log(
            this.tableName,
            'userArticleId_stats_load',
            JSON.stringify(keys)
          )
        }
        try {
          const rows: ({ id: string } & UserArticleStats)[] = await this.kx(
            `${this.tableName} as ua`
          )
            .select([
              'ua.id',
              this.kx.raw('count(h2.id) as highlights_count'),
              this.kx.raw('count(h2.annotation) as annotations_count'),
            ])
            .leftJoin(`${Table.HIGHLIGHT} as h2`, function () {
              this.on('h2.article_id', '=', 'ua.article_id')
              this.andOn('h2.user_id', '=', 'ua.user_id')
              this.andOn('h2.deleted', '=', kx.raw('FALSE'))
            })
            .whereIn('ua.id', keys)
            .groupBy(['ua.id'])
            .limit(MAX_RECORDS_LIMIT)

          const keyMap: Map<string, UserArticleStats> = new Map()
          for (const row of rows) {
            if (keyMap.has(row.id)) continue
            keyMap.set(row.id, row)
          }

          const result = keys.map((id) => {
            const stats = keyMap.get(id)
            if (!stats)
              throw new Error('User article stats data loader state missmatch!')
            return stats
          })

          // logger.debug('\n\n\n\n\nResult for userArticleId_stats_load', { keys, result });

          if (result.length !== keys.length) {
            console.error('DataModel error: count mismatch ', keys, result)
          }
          return result
        } catch (e) {
          console.error('DataModel error: ', e)
          throw e
        }
      },
      { cache }
    )

    this.getStats = this.userArticleStatsLoader.load.bind(
      this.userArticleStatsLoader
    )
  }

  @logMethod
  async getByParameters<K extends keyof ParametersSet>(
    userId: UserArticleData['userId'],
    params: Record<K, UserArticleData[K]>,
    tx = this.kx
  ): Promise<UserArticleData | null> {
    const row: UserArticleData | null = await tx(this.tableName)
      .select(this.modelKeys)
      .where({ userId })
      .andWhere(params)
      .orderBy('created_at', 'desc')
      .first()
    if (!row) return null
    this.loader.prime(row.id, row)
    return row
  }

  @logMethod
  async articlesForUser<K extends keyof ParametersSet>(
    userId: UserArticleData['userId'],
    tx = this.kx
  ): Promise<UserArticleData[] | null> {
    const rows: UserArticleData[] | null = await tx(this.tableName)
      .select(this.modelKeys)
      .where({ userId })
      .orderBy('saved_at', 'desc')
      .limit(MAX_RECORDS_LIMIT)
    if (!rows || !rows.length) {
      return null
    }
    rows.forEach((r) => this.loader.prime(r.id, r))
    return rows
  }

  // @logMethod
  async getByArticleId(
    userId: UserArticleData['userId'],
    articleId: UserArticleData['articleId'],
    _tx = this.kx
  ): Promise<UserArticleData | null> {
    return this.userAndArticleLoader.load({ userId, articleId })
  }

  /* TODO: move to separate dataloader for checking list of articles have been saved or not */
  @logMethod
  async getCountByParameters<K extends keyof ParametersSet>(
    userId: UserArticleData['userId'],
    params: Record<K, UserArticleData[K]>,
    tx = this.kx
  ): Promise<number> {
    const [{ rowCount }] = await tx(this.tableName)
      .count('id as rowCount')
      .where({ userId })
      .andWhere(params)
    return rowCount as number
  }

  @logMethod
  async updateByArticleId<K extends keyof UpdateSet>(
    userId: UserArticleData['userId'],
    articleId: UserArticleData['articleId'],
    params: Record<K, UserArticleData[K]>,
    tx = this.kx
  ): Promise<UserArticleData | null> {
    const rows: UserArticleData[] | null = await tx(this.tableName)
      .update(params)
      .where({ articleId, userId })
      .returning(this.modelKeys)

    if (!rows) return null

    for (const row of rows) {
      this.loader.prime(row.id, row)
    }

    return rows[0] || null
  }

  @logMethod
  async updateByIds<K extends keyof UpdateSet>(
    ids: UserArticleData['id'][],
    params: Record<K, UserArticleData[K]>,
    tx = this.kx
  ): Promise<UserArticleData | null> {
    const rows: UserArticleData[] | null = await tx(this.tableName)
      .update(params)
      .whereIn('id', ids)
      .returning(this.modelKeys)

    if (!rows) return null

    for (const row of rows) {
      this.loader.prime(row.id, row)
    }

    return rows[0] || null
  }

  /**
   * @deprecated
   */
  async getUserFeedArticlesLegacy(
    userId: string,
    tx = this.kx
  ): Promise<UserFeedArticleData[] | null> {
    const rows = await tx(this.tableName)
      .select([
        'omnivore.links.id',
        'omnivore.links.user_id',
        'omnivore.links.article_id',
        'omnivore.links.shared_at',
        'omnivore.links.saved_at',
        'omnivore.links.shared_comment',
      ])
      .leftJoin('omnivore.user_friends', function () {
        this.on(
          tx.raw('omnivore.user_friends.user_id::text = ?', [userId])
        ).andOn(
          'omnivore.user_friends.friend_user_id',
          '=',
          'omnivore.links.user_id'
        )
      })
      .whereNotNull('omnivore.links.shared_at')
      .andWhere(function () {
        this.whereRaw('omnivore.links.user_id::text = ?', [
          userId,
        ]).orWhereNotNull('omnivore.user_friends.id')
      })
      .orderBy('omnivore.links.shared_at', 'DESC')
      .limit(MAX_RECORDS_LIMIT)

    for (const row of rows) {
      this.loader.prime(row.id, row)
    }
    return rows
  }

  @logMethod
  async getSharedArticlesCount(
    userId: string,
    tx = this.kx
  ): Promise<UserFeedArticleData[] | null> {
    const rows = await tx(this.tableName)
      .select([tx.raw('count(omnivore.links.id) as shared_articles_count')])
      .whereNotNull('omnivore.links.shared_at')
      .andWhere('omnivore.links.user_id', userId)

    for (const row of rows) {
      this.loader.prime(row.id, row)
    }
    return rows[0]?.sharedArticlesCount || 0
  }

  async getUserSharedArticles(
    userId: string,
    tx = this.kx
  ): Promise<UserFeedArticleData[] | null> {
    const rows = await tx(this.tableName)
      .select([
        'omnivore.links.id',
        'omnivore.links.user_id',
        'omnivore.links.article_id',
        'omnivore.links.shared_at',
        'omnivore.links.saved_at',
        'omnivore.links.shared_comment',
      ])
      .whereNotNull('omnivore.links.shared_at')
      .andWhere('omnivore.links.user_id', userId)
      .orderBy('omnivore.links.shared_at', 'DESC')
      .limit(MAX_RECORDS_LIMIT)
    for (const row of rows) {
      this.loader.prime(row.id, row)
    }
    return rows
  }

  @logMethod
  async getPaginated(
    args: {
      cursor: string
      first: number
      sort?: SortParams
      query?: string
      inFilter: InFilter
      readFilter: ReadFilter
      typeFilter: PageType | undefined
    },
    userId: string,
    tx = this.kx,
    notNullField: string | null = null
  ): Promise<[PartialArticle[], number] | null> {
    const { cursor, first, sort, query, readFilter } = args

    const sortOrder = sort?.order === SortOrder.Ascending ? 'ASC' : 'DESC'
    const whereOperator = sort?.order === SortOrder.Ascending ? '>=' : '<='

    const queryPromise = tx(this.tableName)
      .select(linkColsWithoutContent(tx))
      .innerJoin(Table.PAGES, 'pages.id', 'links.article_id')
      .where({ 'links.user_id': userId })
      .where(tx.raw(readFilterQuery(readFilter)))

    if (query) {
      const searchQuery = tx.raw(`tsv @@ websearch_to_tsquery(?)`, query)
      queryPromise.where(searchQuery)
    }

    if (args.typeFilter) {
      queryPromise.where(
        tx.raw(`omnivore.pages.page_type = ?`, args.typeFilter)
      )
    }

    if (args.inFilter !== InFilter.ALL) {
      switch (args.inFilter) {
        case InFilter.INBOX:
          queryPromise.whereNull('links.archivedAt')
          break
        case InFilter.ARCHIVE:
          queryPromise.whereNotNull('links.archivedAt')
          break
      }
    }

    if (notNullField) {
      queryPromise.whereNotNull(notNullField)
    }

    const [{ count: totalCount }] =
      (await tx(queryPromise.clone().as('subq')).count()) || '0'

    // This is a temp hack as we move from time based cursors to
    // using offset, this will be replaced when we change the
    // storage backend.
    if (cursor && Number(cursor) > 1546300800000) {
      queryPromise.where(
        `omnivore.links.saved_at`,
        whereOperator,
        new Date(parseInt(cursor) + (sortOrder === 'ASC' ? -1 : 1)) //Time Comparison Bias
      )
    } else if (cursor && Number(cursor) <= 1546300800000) {
      queryPromise.offset(Number(cursor))
    }

    // If first is greater than 100 set it to 100
    const limit = first > 100 ? 100 : first
    queryPromise
      .orderBy('omnivore.links.saved_at', sortOrder)
      .orderBy('omnivore.links.created_at', sortOrder)
      .orderBy('omnivore.links.id', sortOrder)
      .limit(limit)

    // console.log('query', queryPromise.toString())
    const rows = await queryPromise

    for (const row of rows) {
      this.loader.prime(row.id, row)
    }
    return [rows, parseInt(totalCount as string)]
  }

  @logMethod
  async getUserFeedArticlesPaginatedWithHighlights(
    args: { cursor: string; first: number; sharedByUser?: string | null },
    userId: string,
    tx = this.kx
  ): Promise<
    | (UserFeedArticleData & {
        highlightsCount: number
        annotationsCount: number
      })[]
    | null
  > {
    const { cursor, first, sharedByUser } = args

    // let userArticlesListQuery;

    // Getting the list of friends user ids
    const friendsListQuery = sharedByUser
      ? ([] as never)
      : tx(Table.USER_FRIEND).select('friendUserId').where('userId', userId)

    // Getting the links ids list that applies to the "My feed" page
    const userArticlesListQuery = tx(this.tableName)
      .select('id')
      .where(function () {
        this.whereIn('userId', friendsListQuery)
        this.orWhere('userId', sharedByUser || userId)
      })
      .whereNotNull('sharedAt')

    // Collecting the highlights and annotations stats for the links records
    const userArticlesStatsQuery = tx(`${this.tableName} as ua`)
      .select([
        'ua.article_id',
        'ua.user_id',
        tx.raw('count(h2.id) as highlights_count'),
        tx.raw(
          `count(case when h2.annotation is not null and h2.annotation <> '' then 1 else null end) as annotations_count`
        ),
      ])
      .leftJoin(`${Table.HIGHLIGHT} as h2`, function () {
        this.on('h2.article_id', '=', 'ua.article_id')
        this.andOn('h2.user_id', '=', 'ua.user_id')
        this.andOn('h2.deleted', '=', tx.raw('FALSE'))
      })
      // TODO: Check if using the join isntead could be more efficient approach here
      // (https://github.com/omnivore-app/omnivore/pull/1053#discussion_r604914773)
      .whereIn('ua.id', userArticlesListQuery)
      .where('ua.shared_with_highlights', 'TRUE')
      .groupBy(['ua.article_id', 'ua.user_id'])

    // Combining required link columns with the stats calculated
    const userArticlesQuery = tx(`${this.tableName} as ua`)
      .select([
        'ua.id',
        'ua.article_id',
        tx.raw('null as highlight_id'),
        'ua.user_id',
        'uas.highlights_count',
        'uas.annotations_count',
        'ua.shared_at',
        'ua.saved_at',
        'ua.shared_comment',
        'ua.shared_with_highlights',
      ])
      .leftJoin(userArticlesStatsQuery.as('uas'), function () {
        this.on('uas.article_id', '=', 'ua.article_id')
        this.andOn('uas.user_id', '=', 'ua.user_id')
      })
      .whereIn('ua.id', userArticlesListQuery)

    // Getting the shared highlights
    const highlightsQuery = tx(`${Table.HIGHLIGHT} as hi`)
      .select([
        'id',
        'article_id',
        'id as highlight_id',
        'user_id',
        tx.raw('0 as highlights_count'),
        tx.raw('0 as annotations_count'),
        'shared_at',
        tx.raw('null as saved_at'),
        tx.raw('null as shared_comment'),
        tx.raw('null as shared_with_highlights'),
      ])
      .where(function () {
        this.whereIn('userId', friendsListQuery)
        this.orWhere('userId', sharedByUser || userId)
      })
      .where(tx.raw('deleted is not true'))
      .andWhere(tx.raw('shared_at is not null'))

    if (sharedByUser) {
      highlightsQuery.andWhere('user_id', sharedByUser)
    }

    // Merging links record with the shared highlights
    // NOTE: Number of columns and order should match in both queries
    const feedItemsQuery = tx
      .union([userArticlesQuery, highlightsQuery])
      .orderBy('shared_at', 'DESC')

    // Appending resulting query with a cursor if provided
    const resultQuery = cursor
      ? tx
          .select('*')
          .from(feedItemsQuery.as('r'))
          .where(
            `shared_at`,
            '<=',
            new Date(parseInt(cursor) + 1) //Time Comparison Bias
          )
      : feedItemsQuery

    resultQuery.limit(first)

    const rows = await resultQuery
    for (const row of rows) {
      this.loader.prime(row.id, row)
      this.userArticleStatsLoader.prime(row.id, {
        highlightsCount: row.highlightsCount,
        annotationsCount: row.annotationsCount,
      })
    }

    return rows
  }

  @logMethod
  async getForUser(
    userId: string,
    articleId: string,
    tx = this.kx
  ): Promise<(ArticleData & UserArticleData) | null> {
    const row = await tx(Table.LINKS)
      .select(linkCols(tx))
      .innerJoin(Table.PAGES, 'links.article_id', 'pages.id')
      .where('links.user_id', userId)
      .where('links.article_id', articleId)
      .first()

    if (!row) return null
    this.loader.prime(row.id, row)
    return row
  }

  @logMethod
  async getBySlug(
    username: string,
    slug: string,
    tx = this.kx
  ): Promise<(ArticleData & UserArticleData) | null> {
    const row = await tx(Table.LINKS)
      .select(linkCols(tx))
      .innerJoin(Table.PAGES, 'links.article_id', 'pages.id')
      .innerJoin(Table.USER_PROFILE, 'links.user_id', 'user_profile.user_id')
      .where('user_profile.username', username)
      .where('links.slug', slug)
      .first()

    if (!row) return null
    this.loader.prime(row.id, row)
    return row
  }

  async getByUserIdAndSlug(
    uid: string,
    slug: string,
    tx = this.kx
  ): Promise<(ArticleData & UserArticleData) | null> {
    const row = await tx(Table.LINKS)
      .select(linkCols(tx))
      .innerJoin(Table.PAGES, 'links.article_id', 'pages.id')
      .where('links.user_id', uid)
      .where('links.slug', slug)
      .first()

    if (!row) return null
    this.loader.prime(row.id, row)
    return row
  }

  @logMethod
  async setBookmarkOnMultiple(
    userId: string,
    articles: CreateSet[],
    tx = this.kx
  ): Promise<UserArticleData[] | null> {
    const rows = await tx(Table.LINKS)
      .insert(articles)
      .returning(this.modelKeys)

    if (!rows) return null
    rows.forEach((r) => this.loader.prime(r.id, r))
    return rows
  }
}

export default UserArticleModel
