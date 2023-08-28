import { errors } from '@elastic/elasticsearch'
import { BuiltQuery, ESBuilder, esBuilder } from 'elastic-ts'
import { BulkActionType } from '../generated/graphql'
import { EntityType } from '../pubsub'
import { wordsCount } from '../utils/helpers'
import {
  DateFilter,
  FieldFilter,
  HasFilter,
  InFilter,
  LabelFilter,
  LabelFilterType,
  NoFilter,
  ReadFilter,
  SortBy,
  SortOrder,
} from '../utils/search'
import { client, INDEX_ALIAS, logger } from './index'
import {
  ArticleSavingRequestStatus,
  Label,
  Page,
  PageContext,
  PageSearchArgs,
  PageType,
  ParamSet,
  SearchResponse,
} from './types'

const MAX_CONTENT_LENGTH = 5 * 1024 * 1024 // 5MB and 10MB for both content and originalHtml
const CONTENT_LENGTH_ERROR = 'Your page content is too large to be saved.'

const appendQuery = (builder: ESBuilder, query: string): ESBuilder => {
  interface Field {
    field: string
    boost: number
  }

  const wildcardQuery = (field: Field) => {
    return {
      [field.field]: {
        value: query,
        case_insensitive: true,
        boost: field.boost,
      },
    }
  }

  // add boost to the field name like title^3
  const fieldWithBoost = (field: Field) =>
    `${field.field}${field.boost > 1 ? `^${field.boost}` : ''}`

  // get the parent field name like highlights from highlights.annotation
  const getParentField = (nestedField: string) => nestedField.split('.')[0]

  const nonNestedFields: Field[] = [
    { field: 'title', boost: 3 },
    { field: 'content', boost: 1 },
    { field: 'author', boost: 1 },
    { field: 'description', boost: 1 },
    { field: 'siteName', boost: 2 },
  ]
  const nestedFields: Field[] = [{ field: 'highlights.annotation', boost: 2 }]

  // minimum_should_match: 1 means that at least one of the queries must match
  builder = builder.queryMinimumShouldMatch(1)

  // wildcard query
  if (query.includes('*')) {
    nonNestedFields.forEach((field) => {
      builder = builder.orQuery('wildcard', wildcardQuery(field))
    })

    nestedFields.forEach((nestedField) => {
      builder = builder.orQuery('nested', {
        path: getParentField(nestedField.field),
        query: {
          wildcard: wildcardQuery(nestedField),
        },
      })
    })

    return builder
  }

  // match query
  builder = builder.orQuery('multi_match', {
    query,
    fields: nonNestedFields.map((field) => fieldWithBoost(field)),
    type: 'best_fields',
    tie_breaker: 0.3,
    operator: 'and',
  })

  nestedFields.forEach((nestedField) => {
    builder = builder.orQuery('nested', {
      path: getParentField(nestedField.field),
      query: {
        match: {
          [nestedField.field]: {
            query,
            boost: nestedField.boost,
          },
        },
      },
    })
  })

  return builder
}

const appendTypeFilter = (builder: ESBuilder, filter: PageType): ESBuilder => {
  return builder.query('term', { pageType: filter })
}

const appendReadFilter = (
  builder: ESBuilder,
  filter: ReadFilter
): ESBuilder => {
  switch (filter) {
    case ReadFilter.UNREAD:
      return builder.query('range', {
        readingProgressPercent: {
          lt: 98,
        },
      })
    case ReadFilter.READ:
      return builder.query('range', {
        readingProgressPercent: {
          gte: 98,
        },
      })
  }
  return builder
}

const appendInFilter = (builder: ESBuilder, filter: InFilter): ESBuilder => {
  switch (filter) {
    case InFilter.ARCHIVE:
      return builder.query('exists', { field: 'archivedAt' })
    case InFilter.INBOX:
      return builder.notQuery('exists', { field: 'archivedAt' })
    case InFilter.TRASH:
      // return only deleted pages within 14 days
      return builder
        .query('term', {
          state: ArticleSavingRequestStatus.Deleted,
        })
        .andQuery('range', {
          updatedAt: {
            gte: 'now-14d',
          },
        })
    case InFilter.LIBRARY:
      return builder
        .query('bool', {
          should: [
            {
              nested: {
                path: 'labels',
                query: {
                  term: {
                    'labels.name': 'library',
                  },
                },
              },
            },
            {
              bool: {
                must_not: [
                  {
                    nested: {
                      path: 'labels',
                      query: {
                        terms: {
                          'labels.name': ['newsletter', 'rss'],
                        },
                      },
                    },
                  },
                ],
                should: [],
              },
            },
          ],
          minimum_should_match: 1,
        })
        .notQuery('exists', { field: 'archivedAt' })
    case InFilter.SUBSCRIPTION:
      return builder
        .andQuery('nested', {
          path: 'labels',
          query: {
            terms: {
              'labels.name': ['newsletter', 'rss'],
            },
          },
        })
        .notQuery('nested', {
          path: 'labels',
          query: {
            term: {
              'labels.name': 'library',
            },
          },
        })
        .notQuery('exists', { field: 'archivedAt' })
    default:
      return builder
  }
}

const appendHasFilters = (
  builder: ESBuilder,
  filters: HasFilter[]
): ESBuilder => {
  filters.forEach((filter) => {
    switch (filter) {
      case HasFilter.HIGHLIGHTS:
        builder = builder.query('nested', {
          path: 'highlights',
          query: {
            exists: {
              field: 'highlights',
            },
          },
        })
        break
      case HasFilter.LABELS:
        builder = builder.query('nested', {
          path: 'labels',
          query: {
            exists: {
              field: 'labels',
            },
          },
        })
        break
    }
  })
  return builder
}

const appendExcludeLabelFilter = (
  builder: ESBuilder,
  filters: LabelFilter[]
): ESBuilder => {
  const labels = filters.map((filter) => filter.labels).flat()
  return builder.notQuery('nested', {
    path: 'labels',
    query: {
      terms: {
        'labels.name': labels,
      },
    },
  })
}

const appendIncludeLabelFilter = (
  builder: ESBuilder,
  filters: LabelFilter[]
): ESBuilder => {
  filters.forEach((filter) => {
    builder = builder.query('nested', {
      path: 'labels',
      query: {
        bool: {
          should: filter.labels.map((label) => {
            if (label.includes('*')) {
              // Wildcard query
              return {
                wildcard: {
                  'labels.name': {
                    value: label,
                  },
                },
              }
            }
            return {
              term: {
                'labels.name': label,
              },
            }
          }),
          minimum_should_match: 1,
        },
      },
    })
  })
  return builder
}

const appendDateFilters = (
  builder: ESBuilder,
  filters: DateFilter[]
): ESBuilder => {
  filters.forEach((filter) => {
    builder = builder.query('range', {
      [filter.field]: {
        gt: filter.startDate?.getTime(),
        lt: filter.endDate?.getTime(),
      },
    })
  })
  return builder
}

const appendTermFilters = (
  builder: ESBuilder,
  filters: FieldFilter[]
): ESBuilder => {
  filters.forEach((filter) => {
    builder = builder.query('term', {
      [filter.field]: filter.value,
    })
  })
  return builder
}

const appendMatchFilters = (
  builder: ESBuilder,
  filters: FieldFilter[]
): ESBuilder => {
  filters.forEach((filter) => {
    if (filter.nested) {
      // nested query
      builder = builder.query('nested', {
        path: filter.field.split('.')[0], // get the nested field name
        query: {
          match: {
            [filter.field]: filter.value,
          },
        },
      })
      return
    }

    builder = builder.query('match', {
      [filter.field]: filter.value,
    })
  })
  return builder
}

const appendIdsFilter = (builder: ESBuilder, ids: string[]): ESBuilder => {
  return builder.query('terms', {
    _id: ids,
  })
}

const appendRecommendedBy = (
  builder: ESBuilder,
  recommendedBy: string
): ESBuilder => {
  const query =
    recommendedBy === '*'
      ? {
          exists: {
            field: 'recommendations',
          },
        }
      : {
          term: {
            'recommendations.name': recommendedBy,
          },
        }
  return builder.query('nested', {
    path: 'recommendations',
    query,
  })
}

const appendNoFilters = (
  builder: ESBuilder,
  noFilters: NoFilter[]
): ESBuilder => {
  noFilters.forEach((filter) => {
    builder = builder.notQuery('nested', {
      path: filter.field,
      query: {
        exists: {
          field: filter.field,
        },
      },
    })
  })
  return builder
}

const appendSiteNameFilter = (
  builder: ESBuilder,
  siteName: string
): ESBuilder => {
  return builder.query('bool', {
    should: [
      {
        match: {
          siteName,
        },
      },
      {
        wildcard: {
          // siteName is a domain name, so we need to wildcard the end
          url: `*${siteName}*`,
        },
      },
    ],
    minimum_should_match: 1,
  })
}

export const createPage = async (
  page: Page,
  ctx: PageContext
): Promise<string | undefined> => {
  try {
    if (page.content.length > MAX_CONTENT_LENGTH) {
      logger.info('page content is too large', {
        pageId: page.id,
        contentLength: page.content.length,
      })

      page.content = CONTENT_LENGTH_ERROR
    }

    const { body } = await client.index({
      id: page.id || undefined,
      index: INDEX_ALIAS,
      body: {
        ...page,
        updatedAt: new Date(),
        savedAt: page.savedAt || new Date(),
        wordsCount: page.wordsCount ?? wordsCount(page.content),
      },
      refresh: 'wait_for', // wait for the index to be refreshed before returning
    })

    page.id = body._id as string

    const shouldPublish = ctx.shouldPublish ?? true
    // only publish a pubsub event if we should
    if (shouldPublish) {
      await ctx.pubsub?.entityCreated<Page>(EntityType.PAGE, page, ctx.uid)
    }

    return page.id
  } catch (e) {
    logger.error('failed to create a page in elastic', e)
    return undefined
  }
}

export const updatePage = async (
  id: string,
  page: Partial<Page>,
  ctx: PageContext
): Promise<boolean> => {
  try {
    if (page.content && page.content.length > MAX_CONTENT_LENGTH) {
      logger.info('page content is too large', {
        pageId: page.id,
        contentLength: page.content.length,
      })

      page.content = CONTENT_LENGTH_ERROR
    }

    await client.update({
      index: INDEX_ALIAS,
      id,
      body: {
        doc: {
          ...page,
          updatedAt: new Date(),
        },
      },
      refresh: ctx.refresh,
      retry_on_conflict: 3,
    })

    if (page.state === ArticleSavingRequestStatus.Deleted) {
      await ctx.pubsub.entityDeleted(EntityType.PAGE, id, ctx.uid)
      return true
    }

    await ctx.pubsub.entityUpdated<Partial<Page>>(
      EntityType.PAGE,
      { ...page, id },
      ctx.uid
    )
    return true
  } catch (e) {
    if (
      e instanceof errors.ResponseError &&
      e.message === 'document_missing_exception'
    ) {
      logger.info('page has been deleted', id)
      return false
    }
    logger.error('failed to update a page in elastic', e)
    return false
  }
}

export const deletePage = async (
  id: string,
  ctx: PageContext
): Promise<boolean> => {
  try {
    const { body } = await client.delete({
      index: INDEX_ALIAS,
      id,
      refresh: ctx.refresh,
    })

    return body.deleted !== 0
  } catch (e) {
    if (
      e instanceof errors.ResponseError &&
      e.message === 'document_missing_exception'
    ) {
      logger.info('page has been deleted', id)
      return false
    }
    logger.error('failed to delete a page in elastic', e)
    return false
  }
}

export const getPageByParam = async <K extends keyof ParamSet>(
  params: Record<K, ParamSet[K] | ParamSet[K][]>,
  includeOriginalHtml = false
): Promise<Page | undefined> => {
  try {
    let builder = esBuilder()
      .size(1)
      .rawOption('_source', {
        excludes: includeOriginalHtml ? [] : ['originalHtml'],
      })
    // filter out undefined and null values and empty arrays
    // and build the query
    Object.entries<ParamSet[K] | ParamSet[K][]>(params)
      .filter(
        ([, value]) =>
          value != null && !(Array.isArray(value) && value.length === 0)
      )
      .forEach(([key, value]) => {
        Array.isArray(value)
          ? (builder = builder.query('terms', key, value))
          : (builder = builder.query('term', key, value))
      })
    const { body } = await client.search<SearchResponse<Page>>({
      index: INDEX_ALIAS,
      body: builder.build(),
      track_total_hits: true,
    })

    if (body.hits.total.value === 0) {
      return undefined
    }

    return {
      ...body.hits.hits[0]._source,
      id: body.hits.hits[0]._id,
    } as Page
  } catch (e) {
    logger.error('failed to get page by param in elastic', e)
    return undefined
  }
}

export const getPageById = async (id: string): Promise<Page | undefined> => {
  try {
    if (!id) return undefined

    const { body } = await client.get({
      index: INDEX_ALIAS,
      id,
    })

    return {
      ...body._source,
      id: body._id as string,
    } as Page
  } catch (e) {
    if (e instanceof errors.ResponseError && e.statusCode === 404) {
      logger.info('page has been deleted', id)
      return undefined
    }
    logger.error('failed to get page by id in elastic', e)
    return undefined
  }
}

const buildSearchBody = (userId: string, args: PageSearchArgs) => {
  const {
    query,
    readFilter = ReadFilter.ALL,
    typeFilter,
    labelFilters,
    inFilter = InFilter.ALL,
    hasFilters,
    dateFilters,
    termFilters,
    matchFilters,
    ids,
    noFilters,
    siteName,
  } = args

  const includeLabels = labelFilters?.filter(
    (filter) => filter.type === LabelFilterType.INCLUDE
  )
  const excludeLabels = labelFilters?.filter(
    (filter) => filter.type === LabelFilterType.EXCLUDE
  )

  // start building the query
  let builder = esBuilder().query('term', { userId })

  // append filters
  if (query) {
    builder = appendQuery(builder, query)
  }
  if (typeFilter) {
    builder = appendTypeFilter(builder, typeFilter)
  }
  if (inFilter !== InFilter.ALL) {
    builder = appendInFilter(builder, inFilter)
  }
  if (readFilter !== ReadFilter.ALL) {
    builder = appendReadFilter(builder, readFilter)
  }
  if (hasFilters && hasFilters.length > 0) {
    builder = appendHasFilters(builder, hasFilters)
  }
  if (includeLabels && includeLabels.length > 0) {
    builder = appendIncludeLabelFilter(builder, includeLabels)
  }
  if (excludeLabels && excludeLabels.length > 0) {
    builder = appendExcludeLabelFilter(builder, excludeLabels)
  }
  if (dateFilters && dateFilters.length > 0) {
    builder = appendDateFilters(builder, dateFilters)
  }
  if (termFilters) {
    builder = appendTermFilters(builder, termFilters)
  }
  if (matchFilters) {
    builder = appendMatchFilters(builder, matchFilters)
  }
  if (ids && ids.length > 0) {
    builder = appendIdsFilter(builder, ids)
  }
  if (args.recommendedBy) {
    builder = appendRecommendedBy(builder, args.recommendedBy)
  }
  if (!args.includePending) {
    builder = builder.notQuery('term', {
      state: ArticleSavingRequestStatus.Processing,
    })
  }
  if (!args.includeDeleted && inFilter !== InFilter.TRASH) {
    builder = builder.notQuery('term', {
      state: ArticleSavingRequestStatus.Deleted,
    })
  }
  if (noFilters) {
    builder = appendNoFilters(builder, noFilters)
  }
  if (siteName) {
    builder = appendSiteNameFilter(builder, siteName)
  }

  return builder
}

export const searchPages = async (
  args: PageSearchArgs,
  userId: string
): Promise<[Page[], number] | undefined> => {
  try {
    const { from = 0, size = 10, sort, includeContent } = args

    // default order is descending
    const sortOrder = sort?.order || SortOrder.DESCENDING
    // default sort by saved_at
    const sortField = sort?.by || SortBy.SAVED

    // build the query
    const builder = buildSearchBody(userId, args)
    const body = builder
      .sort('_score', 'desc') // sort by score first
      .sort(sortField, sortOrder)
      .from(from)
      .size(size)
      .rawOption('_source', {
        excludes: includeContent ? [] : ['originalHtml', 'content'],
      })
      .build()

    logger.info('searching pages in elastic', body)
    const response = await client.search<SearchResponse<Page>, BuiltQuery>({
      index: INDEX_ALIAS,
      body,
    })
    if (response.body.hits.total.value === 0) {
      return [[], 0]
    }

    return [
      response.body.hits.hits.map((hit: { _source: Page; _id: string }) => ({
        ...hit._source,
        content: includeContent ? hit._source.content : '',
        id: hit._id,
      })),
      response.body.hits.total.value,
    ]
  } catch (e) {
    if (e instanceof errors.ResponseError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      logger.error('failed to search pages in elastic', e.meta.body.error)
      return undefined
    }
    logger.error('failed to search pages in elastic', e)
    return undefined
  }
}

export const countByCreatedAt = async (
  userId: string,
  from?: number,
  to?: number
): Promise<number> => {
  try {
    const { body } = await client.count({
      index: INDEX_ALIAS,
      body: {
        query: {
          bool: {
            filter: [
              {
                term: {
                  userId,
                },
              },
              {
                range: {
                  createdAt: {
                    gte: from,
                    lte: to,
                  },
                },
              },
            ],
          },
        },
      },
    })

    return body.count as number
  } catch (e) {
    logger.error('failed to count pages in elastic', e)
    return 0
  }
}

export const deletePagesByParam = async <K extends keyof ParamSet>(
  param: Record<K, ParamSet[K]>,
  ctx: PageContext
): Promise<boolean> => {
  try {
    const params = {
      query: {
        bool: {
          filter: Object.keys(param).map((key) => {
            return {
              term: {
                [key]: param[key as K],
              },
            }
          }),
        },
      },
    }

    const { body } = await client.deleteByQuery({
      index: INDEX_ALIAS,
      body: params,
      conflicts: 'proceed',
    })

    if (body.deleted > 0) {
      // * means deleting all pages of the same user
      await ctx.pubsub.entityDeleted(EntityType.PAGE, '*', ctx.uid)

      return true
    }

    return false
  } catch (e) {
    logger.error('failed to delete pages by param in elastic', e)
    return false
  }
}

export const searchAsYouType = async (
  userId: string,
  query: string,
  size = 5
): Promise<Page[]> => {
  try {
    const { body } = await client.search<SearchResponse<Page>>({
      index: INDEX_ALIAS,
      body: {
        query: {
          bool: {
            filter: [
              {
                term: {
                  userId,
                },
              },
              {
                term: {
                  state: ArticleSavingRequestStatus.Succeeded,
                },
              },
              {
                multi_match: {
                  query,
                  type: 'bool_prefix',
                  fields: [
                    'title',
                    'title._2gram',
                    'title._3gram',
                    'siteName',
                    'siteName._2gram',
                    'siteName._3gram',
                  ],
                },
              },
            ],
          },
        },
        _source: ['title', 'slug', 'siteName', 'pageType'],
        size,
      },
    })

    if (body.hits.total.value === 0) {
      return []
    }

    return body.hits.hits.map((hit: { _source: Page; _id: string }) => ({
      ...hit._source,
      id: hit._id,
    }))
  } catch (e) {
    logger.error('failed to search as you type in elastic', e)

    return []
  }
}

export const updatePages = async (
  ctx: PageContext,
  action: BulkActionType,
  args: PageSearchArgs,
  maxDocs: number,
  async: boolean,
  labels?: Label[]
): Promise<string | null> => {
  // build the script
  let script = {
    source: '',
    params: {},
  }
  switch (action) {
    case BulkActionType.Archive:
      script = {
        source: `ctx._source.archivedAt = params.archivedAt;`,
        params: {
          archivedAt: new Date(),
        },
      }
      break
    case BulkActionType.Delete:
      script = {
        source: `ctx._source.state = params.state;`,
        params: {
          state: ArticleSavingRequestStatus.Deleted,
        },
      }
      break
    case BulkActionType.AddLabels:
      script = {
        source: `if (ctx._source.labels == null) {
          ctx._source.labels = params.labels
        } else {
          for (label in params.labels) {
            if (!ctx._source.labels.any(l -> l.name == label.name)) {
              ctx._source.labels.add(label)
            }
          }
        }`,
        params: {
          labels,
        },
      }
      break
    case BulkActionType.MarkAsRead:
      script = {
        source: `ctx._source.readAt = params.readAt;
        ctx._source.readingProgressPercent = params.readingProgressPercent;`,
        params: {
          readAt: new Date(),
          readingProgressPercent: 100,
        },
      }
      break
    default:
      throw new Error('Invalid bulk action')
  }

  // add updatedAt to the script
  const updatedScript = {
    source: `${script.source} ctx._source.updatedAt = params.updatedAt`,
    lang: 'painless',
    params: {
      ...script.params,
      updatedAt: new Date(),
    },
  }

  // build the query
  const searchBody = buildSearchBody(ctx.uid, args)
    .rawOption('script', updatedScript)
    .build()

  logger.info('updating pages in elastic', searchBody)

  try {
    const { body } = await client.updateByQuery({
      index: INDEX_ALIAS,
      conflicts: 'proceed',
      wait_for_completion: !async,
      body: searchBody,
      max_docs: maxDocs,
      requests_per_second: 500, // throttle the requests
      slices: 'auto', // parallelize the requests
      refresh: ctx.refresh,
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (body.failures && body.failures.length > 0) {
      logger.info('failed to update pages in elastic', body.failures)
      return null
    }

    // TODO: publish entityUpdated events for each page

    if (async) {
      logger.info('update pages task started', body.task)
      return body.task as string
    }

    logger.info('updated pages in elastic', body.updated)
    return body.updated as string
  } catch (e) {
    logger.info('failed to update pages in elastic', e)
    return null
  }
}
