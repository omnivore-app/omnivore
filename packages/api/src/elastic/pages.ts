import {
  ArticleSavingRequestStatus,
  Page,
  PageContext,
  PageType,
  ParamSet,
  SearchBody,
  SearchResponse,
} from './types'
import {
  DateRangeFilter,
  HasFilter,
  InFilter,
  LabelFilter,
  LabelFilterType,
  ReadFilter,
  SortBy,
  SortOrder,
  SortParams,
  SubscriptionFilter,
} from '../utils/search'
import { client, INDEX_ALIAS } from './index'
import { EntityType } from '../datalayer/pubsub'

const appendQuery = (body: SearchBody, query: string): void => {
  body.query.bool.should.push({
    multi_match: {
      query,
      fields: ['title', 'content', 'author', 'description', 'siteName'],
      operator: 'and',
      type: 'cross_fields',
    },
  })
  body.query.bool.minimum_should_match = 1
}

const appendTypeFilter = (body: SearchBody, filter: PageType): void => {
  body.query.bool.filter.push({
    term: {
      pageType: filter,
    },
  })
}

const appendReadFilter = (body: SearchBody, filter: ReadFilter): void => {
  switch (filter) {
    case ReadFilter.UNREAD:
      body.query.bool.filter.push({
        range: {
          readingProgress: {
            gte: 98,
          },
        },
      })
      break
    case ReadFilter.READ:
      body.query.bool.filter.push({
        range: {
          readingProgress: {
            lt: 98,
          },
        },
      })
  }
}

const appendInFilter = (body: SearchBody, filter: InFilter): void => {
  switch (filter) {
    case InFilter.ARCHIVE:
      body.query.bool.filter.push({
        exists: {
          field: 'archivedAt',
        },
      })
      break
    case InFilter.INBOX:
      body.query.bool.must_not.push({
        exists: {
          field: 'archivedAt',
        },
      })
  }
}

const appendHasFilters = (body: SearchBody, filters: HasFilter[]): void => {
  filters.forEach((filter) => {
    switch (filter) {
      case HasFilter.HIGHLIGHTS:
        body.query.bool.filter.push({
          nested: {
            path: 'highlights',
            query: {
              exists: {
                field: 'highlights',
              },
            },
          },
        })
        break
      case HasFilter.SHARED_AT:
        body.query.bool.filter.push({
          exists: {
            field: 'sharedAt',
          },
        })
        break
    }
  })
}

const appendExcludeLabelFilter = (
  body: SearchBody,
  filters: LabelFilter[]
): void => {
  body.query.bool.must_not.push({
    nested: {
      path: 'labels',
      query: filters.map((filter) => {
        return {
          terms: {
            'labels.name': filter.labels,
          },
        }
      }),
    },
  })
}

const appendIncludeLabelFilter = (
  body: SearchBody,
  filters: LabelFilter[]
): void => {
  filters.forEach((filter) => {
    body.query.bool.filter.push({
      nested: {
        path: 'labels',
        query: {
          terms: {
            'labels.name': filter.labels,
          },
        },
      },
    })
  })
}

const appendSavedDateFilter = (
  body: SearchBody,
  filter: DateRangeFilter
): void => {
  body.query.bool.filter.push({
    range: {
      savedAt: {
        gt: filter.startDate,
        lt: filter.endDate,
      },
    },
  })
}

const appendPublishedDateFilter = (
  body: SearchBody,
  filter: DateRangeFilter
): void => {
  body.query.bool.filter.push({
    range: {
      publishedAt: {
        gt: filter.startDate,
        lt: filter.endDate,
      },
    },
  })
}

const appendSubscriptionFilter = (
  body: SearchBody,
  filter: SubscriptionFilter
): void => {
  body.query.bool.filter.push({
    term: {
      subscription: filter.name,
    },
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
      },
      refresh: ctx.refresh,
    })

    await ctx.pubsub.entityCreated<Page>(EntityType.PAGE, page, ctx.uid)

    return body._id as string
  } catch (e) {
    console.error('failed to create a page in elastic', e)
    return undefined
  }
}

export const updatePage = async (
  id: string,
  page: Partial<Page>,
  ctx: PageContext
): Promise<boolean> => {
  try {
    const { body } = await client.update({
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

    if (body.result !== 'updated') return false

    await ctx.pubsub.entityUpdated<Partial<Page>>(
      EntityType.PAGE,
      { ...page, id },
      ctx.uid
    )

    return true
  } catch (e) {
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

    if (body.deleted === 0) return false

    await ctx.pubsub.entityDeleted(EntityType.PAGE, id, ctx.uid)

    return true
  } catch (e) {
    console.error('failed to delete a page in elastic', e)
    return false
  }
}

export const getPageByParam = async <K extends keyof ParamSet>(
  param: Record<K, Page[K]>
): Promise<Page | undefined> => {
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
      size: 1,
      _source: {
        excludes: ['originalHtml'],
      },
    }

    const { body } = await client.search<SearchResponse<Page>>({
      index: INDEX_ALIAS,
      body: params,
    })

    if (body.hits.total.value === 0) {
      return undefined
    }

    return {
      ...body.hits.hits[0]._source,
      id: body.hits.hits[0]._id,
    } as Page
  } catch (e) {
    console.error('failed to search pages in elastic', e)
    return undefined
  }
}

export const getPageById = async (id: string): Promise<Page | undefined> => {
  try {
    const { body } = await client.get({
      index: INDEX_ALIAS,
      id,
    })

    return {
      ...body._source,
      id: body._id as string,
    } as Page
  } catch (e) {
    console.error('failed to search pages in elastic', e)
    return undefined
  }
}

export const searchPages = async (
  args: {
    from?: number
    size?: number
    sort?: SortParams
    query?: string
    inFilter?: InFilter
    readFilter?: ReadFilter
    typeFilter?: PageType
    labelFilters?: LabelFilter[]
    hasFilters?: HasFilter[]
    savedDateFilter?: DateRangeFilter
    publishedDateFilter?: DateRangeFilter
    subscriptionFilter?: SubscriptionFilter
    includePending?: boolean | null
  },
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
      labelFilters = [],
      inFilter = InFilter.ALL,
      hasFilters = [],
      savedDateFilter,
      publishedDateFilter,
      subscriptionFilter,
    } = args
    // default order is descending
    const sortOrder = sort?.order || SortOrder.DESCENDING
    // default sort by saved_at
    const sortField = sort?.by || SortBy.SAVED
    const includeLabels = labelFilters.filter(
      (filter) => filter.type === LabelFilterType.INCLUDE
    )
    const excludeLabels = labelFilters.filter(
      (filter) => filter.type === LabelFilterType.EXCLUDE
    )

    const body: SearchBody = {
      query: {
        bool: {
          filter: [
            {
              term: {
                userId,
              },
            },
          ],
          should: [],
          must_not: [
            {
              term: {
                state: ArticleSavingRequestStatus.Failed,
              },
            },
          ],
        },
      },
      sort: [
        {
          [sortField]: {
            order: sortOrder,
          },
        },
      ],
      from,
      size,
      _source: {
        excludes: ['originalHtml', 'content', 'highlights'],
      },
    }

    // append filters
    if (query) {
      appendQuery(body, query)
    }
    if (typeFilter) {
      appendTypeFilter(body, typeFilter)
    }
    if (inFilter !== InFilter.ALL) {
      appendInFilter(body, inFilter)
    }
    if (readFilter !== ReadFilter.ALL) {
      appendReadFilter(body, readFilter)
    }
    if (hasFilters.length > 0) {
      appendHasFilters(body, hasFilters)
    }
    if (includeLabels.length > 0) {
      appendIncludeLabelFilter(body, includeLabels)
    }
    if (excludeLabels.length > 0) {
      appendExcludeLabelFilter(body, excludeLabels)
    }
    if (savedDateFilter) {
      appendSavedDateFilter(body, savedDateFilter)
    }
    if (publishedDateFilter) {
      appendPublishedDateFilter(body, publishedDateFilter)
    }
    if (subscriptionFilter) {
      appendSubscriptionFilter(body, subscriptionFilter)
    }

    if (!args.includePending) {
      body.query.bool.must_not.push({
        term: {
          state: ArticleSavingRequestStatus.Processing,
        },
      })
    }

    console.log('searching pages in elastic', JSON.stringify(body))

    const response = await client.search<SearchResponse<Page>, SearchBody>({
      index: INDEX_ALIAS,
      body,
    })

    console.log('resopnse', response)

    if (response.body.hits.total.value === 0) {
      return [[], 0]
    }

    return [
      response.body.hits.hits.map((hit: { _source: Page; _id: string }) => ({
        ...hit._source,
        content: '',
        id: hit._id,
      })),
      response.body.hits.total.value,
    ]
  } catch (e) {
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
