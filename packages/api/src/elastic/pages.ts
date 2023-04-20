import { ResponseError } from '@elastic/elasticsearch/lib/errors'
import { BuiltQuery, ESBuilder, esBuilder } from 'elastic-ts'
import { EntityType } from '../datalayer/pubsub'
import { BulkActionType } from '../generated/graphql'
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
import { client, INDEX_ALIAS } from './index'
import {
  ArticleSavingRequestStatus,
  Page,
  PageContext,
  PageSearchArgs,
  PageType,
  ParamSet,
  SearchResponse,
} from './types'

const appendQuery = (builder: ESBuilder, query: string): ESBuilder => {
  return builder
    .orQuery('multi_match', {
      query,
      fields: ['title', 'content', 'author', 'description', 'siteName'],
      operator: 'and',
      type: 'cross_fields',
    })
    .queryMinimumShouldMatch(1)
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
  }
  return builder
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
      case HasFilter.SHARED_AT:
        builder = builder.query('exists', { field: 'sharedAt' })
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
        terms: {
          'labels.name': filter.labels,
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
    const { body } = await client.index({
      id: page.id || undefined,
      index: INDEX_ALIAS,
      body: {
        ...page,
        updatedAt: new Date(),
        savedAt: new Date(),
        wordsCount: page.wordsCount ?? wordsCount(page.content),
      },
      refresh: 'wait_for', // wait for the index to be refreshed before returning
    })

    page.id = body._id as string
    await ctx.pubsub.entityCreated<Page>(EntityType.PAGE, page, ctx.uid)

    return page.id
  } catch (e) {
    console.error('failed to create a page in elastic', JSON.stringify(e))
    return undefined
  }
}

export const updatePage = async (
  id: string,
  page: Partial<Page>,
  ctx: PageContext
): Promise<boolean> => {
  try {
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
      e instanceof ResponseError &&
      e.message === 'document_missing_exception'
    ) {
      console.log('page has been deleted', id)
      return false
    }
    console.error('failed to update a page in elastic', e)
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
      e instanceof ResponseError &&
      e.message === 'document_missing_exception'
    ) {
      console.log('page has been deleted', id)
      return false
    }
    console.error('failed to delete a page in elastic', e)
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
    })

    if (body.hits.total.value === 0) {
      return undefined
    }

    return {
      ...body.hits.hits[0]._source,
      id: body.hits.hits[0]._id,
    } as Page
  } catch (e) {
    console.error('failed to get page by param in elastic', e)
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
    if (e instanceof ResponseError && e.statusCode === 404) {
      console.log('page has been deleted', id)
      return undefined
    }
    console.error('failed to get page by id in elastic', e)
    return undefined
  }
}

export const searchPages = async (
  args: PageSearchArgs,
  userId: string
): Promise<[Page[], number] | undefined> => {
  try {
    const {
      from = 0,
      size = 10,
      sort,
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
      includeContent,
      noFilters,
      siteName,
    } = args
    // default order is descending
    const sortOrder = sort?.order || SortOrder.DESCENDING
    // default sort by saved_at
    const sortField = sort?.by || SortBy.SAVED
    const includeLabels = labelFilters?.filter(
      (filter) => filter.type === LabelFilterType.INCLUDE
    )
    const excludeLabels = labelFilters?.filter(
      (filter) => filter.type === LabelFilterType.EXCLUDE
    )
    // start building the query
    let builder = esBuilder()
      .query('term', { userId })
      .sort(sortField, sortOrder)
      .from(from)
      .size(size)
      .rawOption('_source', {
        excludes: includeContent ? [] : ['originalHtml', 'content'],
      })
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
    if (!args.includeDeleted) {
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
    // build the query
    const body = builder.build()

    console.debug('searching pages in elastic', JSON.stringify(body))
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
    if (e instanceof ResponseError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('failed to search pages in elastic', e.meta.body.error)
      return undefined
    }
    console.error('failed to search pages in elastic', e)
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
    console.error('failed to count pages in elastic', e)
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
    console.error('failed to delete pages by param in elastic', e)
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
    console.error('failed to search as you type in elastic', e)

    return []
  }
}

export const updatePagesAsync = async (
  userId: string,
  action: BulkActionType
): Promise<string | null> => {
  // default action is archive
  let must_not = [
    {
      exists: {
        field: 'archivedAt',
      },
    },
  ]
  let params: Record<string, unknown> = { archivedAt: new Date() }
  if (action === BulkActionType.Delete) {
    must_not = []
    params = { state: ArticleSavingRequestStatus.Deleted }
  }
  // get update field
  const field = Object.keys(params)[0]

  try {
    const { body } = await client.updateByQuery({
      index: INDEX_ALIAS,
      conflicts: 'proceed',
      wait_for_completion: false,
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
                terms: {
                  state: [
                    ArticleSavingRequestStatus.Succeeded,
                    ArticleSavingRequestStatus.Failed,
                    ArticleSavingRequestStatus.Processing,
                  ],
                },
              },
            ],
            must_not,
          },
        },
        script: {
          source: `ctx._source.${field} = params.${field}`,
          lang: 'painless',
          params,
        },
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (body.failures?.length > 0) {
      console.log('failed to update pages in elastic', body.failures)
      return null
    }

    console.log('update pages task started', body.task)
    return body.task as string
  } catch (e) {
    console.log('failed to update pages in elastic', e)
    return null
  }
}
