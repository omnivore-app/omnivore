import {
  ArticleSavingRequestStatus,
  Page,
  PageContext,
  PageSearchArgs,
  PageType,
  ParamSet,
  SearchBody,
  SearchResponse,
} from './types'
import {
  DateFilter,
  FieldFilter,
  HasFilter,
  InFilter,
  LabelFilter,
  LabelFilterType,
  ReadFilter,
  SortBy,
  SortOrder,
} from '../utils/search'
import { client, INDEX_ALIAS } from './index'
import { EntityType } from '../datalayer/pubsub'
import { ResponseError } from '@elastic/elasticsearch/lib/errors'
import { wordsCount } from '../utils/helpers'

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
  body.query.bool.must.push({
    term: {
      pageType: filter,
    },
  })
}

const appendReadFilter = (body: SearchBody, filter: ReadFilter): void => {
  switch (filter) {
    case ReadFilter.UNREAD:
      body.query.bool.must.push({
        range: {
          readingProgressPercent: {
            lt: 98,
          },
        },
      })
      break
    case ReadFilter.READ:
      body.query.bool.must.push({
        range: {
          readingProgressPercent: {
            gte: 98,
          },
        },
      })
  }
}

const appendInFilter = (body: SearchBody, filter: InFilter): void => {
  switch (filter) {
    case InFilter.ARCHIVE:
      body.query.bool.must.push({
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
        body.query.bool.must.push({
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
        body.query.bool.must.push({
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
    body.query.bool.must.push({
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

const appendDateFilters = (body: SearchBody, filters: DateFilter[]): void => {
  filters.forEach((filter) => {
    body.query.bool.must.push({
      range: {
        [filter.field]: {
          gt: filter.startDate,
          lt: filter.endDate,
        },
      },
    })
  })
}

const appendTermFilters = (body: SearchBody, filters: FieldFilter[]): void => {
  filters.forEach((filter) => {
    body.query.bool.must.push({
      term: {
        [filter.field]: filter.value,
      },
    })
  })
}

const appendMatchFilters = (body: SearchBody, filters: FieldFilter[]): void => {
  filters.forEach((filter) => {
    body.query.bool.must.push({
      match: {
        [filter.field]: filter.value,
      },
    })
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
        wordsCount: wordsCount(page.content),
      },
      refresh: ctx.refresh,
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
  param: Record<K, ParamSet[K]>,
  includeOriginalHtml = false
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
        excludes: includeOriginalHtml ? [] : ['originalHtml'],
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

    const body: SearchBody = {
      query: {
        bool: {
          must: [
            {
              term: {
                userId,
              },
            },
          ],
          should: [],
          must_not: [],
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
        excludes: ['originalHtml', 'content'],
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
    if (hasFilters && hasFilters.length > 0) {
      appendHasFilters(body, hasFilters)
    }
    if (includeLabels && includeLabels.length > 0) {
      appendIncludeLabelFilter(body, includeLabels)
    }
    if (excludeLabels && excludeLabels.length > 0) {
      appendExcludeLabelFilter(body, excludeLabels)
    }
    if (dateFilters && dateFilters.length > 0) {
      appendDateFilters(body, dateFilters)
    }
    if (termFilters) {
      appendTermFilters(body, termFilters)
    }
    if (matchFilters) {
      appendMatchFilters(body, matchFilters)
    }

    if (!args.includePending) {
      body.query.bool.must_not.push({
        term: {
          state: ArticleSavingRequestStatus.Processing,
        },
      })
    }

    if (!args.includeDeleted) {
      body.query.bool.must_not.push({
        term: {
          state: ArticleSavingRequestStatus.Deleted,
        },
      })
    }

    console.log('searching pages in elastic', JSON.stringify(body))

    const response = await client.search<SearchResponse<Page>, SearchBody>({
      index: INDEX_ALIAS,
      body,
    })

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
        _source: ['title', 'slug', 'siteName'],
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
