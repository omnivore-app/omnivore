import { errors } from '@elastic/elasticsearch'
import { EntityType } from '../pubsub'
import { SortBy, SortOrder, SortParams } from '../utils/search'
import { client, INDEX_ALIAS, logger } from './index'
import {
  Highlight,
  Page,
  PageContext,
  PageType,
  SearchItem,
  SearchResponse,
} from './types'

export const addHighlightToPage = async (
  id: string,
  highlight: Highlight,
  ctx: PageContext
): Promise<boolean> => {
  try {
    const { body } = await client.update({
      index: INDEX_ALIAS,
      id,
      body: {
        script: {
          source: `if (ctx._source.highlights == null) { 
                    ctx._source.highlights = [params.highlight]
                  } else {
                    ctx._source.highlights.add(params.highlight) 
                  }
                  ctx._source.updatedAt = params.highlight.updatedAt`,
          lang: 'painless',
          params: {
            highlight,
          },
        },
      },
      refresh: ctx.refresh,
      retry_on_conflict: 3,
    })

    if (body.result !== 'updated') return false

    await ctx.pubsub.entityCreated<Highlight>(
      EntityType.HIGHLIGHT,
      highlight,
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
    logger.error('failed to add highlight to a page in elastic', e)
    return false
  }
}

export const getHighlightById = async (
  id: string
): Promise<Highlight | undefined> => {
  try {
    const { body } = await client.search({
      index: INDEX_ALIAS,
      body: {
        query: {
          nested: {
            path: 'highlights',
            query: {
              term: {
                'highlights.id': id,
              },
            },
            inner_hits: {},
          },
        },
        _source: false,
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (body.hits.total.value === 0) {
      return undefined
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
    return body.hits.hits[0].inner_hits.highlights.hits.hits[0]._source
  } catch (e) {
    logger.error('failed to get highlight from a page in elastic', e)
    return undefined
  }
}

export const deleteHighlight = async (
  highlightId: string,
  ctx: PageContext
): Promise<boolean> => {
  try {
    const { body } = await client.updateByQuery({
      index: INDEX_ALIAS,
      body: {
        script: {
          source: `ctx._source.highlights.removeIf(h -> h.id == params.highlightId);
                   ctx._source.updatedAt = params.updatedAt`,
          lang: 'painless',
          params: {
            highlightId: highlightId,
            updatedAt: new Date(),
          },
        },
        query: {
          bool: {
            filter: [
              {
                term: {
                  userId: ctx.uid,
                },
              },
              {
                nested: {
                  path: 'highlights',
                  query: {
                    term: {
                      'highlights.id': highlightId,
                    },
                  },
                },
              },
            ],
          },
        },
      },
      refresh: ctx.refresh,
    })

    body.updated > 0 &&
      (await ctx.pubsub.entityDeleted(
        EntityType.HIGHLIGHT,
        highlightId,
        ctx.uid
      ))

    return true
  } catch (e) {
    logger.error('failed to delete a highlight in elastic', e)

    return false
  }
}

export const searchHighlights = async (
  args: {
    from?: number
    size?: number
    sort?: SortParams
    query?: string
  },
  userId: string
): Promise<[SearchItem[], number] | undefined> => {
  try {
    const { from = 0, size = 10, sort, query } = args
    const sortOrder = sort?.order || SortOrder.DESCENDING
    // default sort by updatedAt
    const sortField =
      sort?.by === SortBy.SCORE ? SortBy.SCORE : 'highlights.updatedAt'

    const searchBody = {
      query: {
        bool: {
          filter: [
            {
              nested: {
                path: 'highlights',
                query: {
                  term: {
                    'highlights.userId': userId,
                  },
                },
              },
            },
          ],
          should: [
            {
              multi_match: {
                query: query || '',
                fields: [
                  'highlights.quote^5',
                  'title^3',
                  'description^2',
                  'content',
                ],
              },
            },
          ],
          minimum_should_match: query ? 1 : 0,
        },
      },
      sort: [
        '_score',
        {
          [sortField]: {
            order: sortOrder,
            nested: {
              path: 'highlights',
            },
          },
        },
      ],
      from,
      size,
      _source: [
        'title',
        'slug',
        'url',
        'savedAt',
        'highlights',
        'readingProgressPercent',
        'readingProgressAnchorIndex',
      ],
    }

    logger.info('searching highlights in elastic', searchBody)

    const response = await client.search<SearchResponse<Page>>({
      index: INDEX_ALIAS,
      body: searchBody,
    })

    if (response.body.hits.total.value === 0) {
      return [[], 0]
    }

    const results: SearchItem[] = []
    response.body.hits.hits.forEach((hit) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      hit._source.highlights?.forEach((highlight) => {
        results.push({
          ...highlight,
          ...hit._source,
          pageId: hit._id,
          pageType: PageType.Highlights,
        })
      })
    })

    return [results, response.body.hits.total.value]
  } catch (e) {
    logger.error('failed to search highlights in elastic', e)
    return undefined
  }
}

export const updateHighlight = async (
  highlight: Highlight,
  ctx: PageContext
): Promise<boolean> => {
  try {
    const { body } = await client.updateByQuery({
      index: INDEX_ALIAS,
      body: {
        script: {
          source: `ctx._source.highlights.removeIf(h -> h.id == params.highlight.id);
                   ctx._source.highlights.add(params.highlight);
                   ctx._source.updatedAt = params.highlight.updatedAt`,
          lang: 'painless',
          params: {
            highlight,
          },
        },
        query: {
          bool: {
            filter: [
              {
                term: {
                  userId: ctx.uid,
                },
              },
              {
                nested: {
                  path: 'highlights',
                  query: {
                    term: {
                      'highlights.id': highlight.id,
                    },
                  },
                },
              },
            ],
          },
        },
      },
      refresh: ctx.refresh,
      conflicts: 'proceed',
    })

    body.updated > 0 &&
      (await ctx.pubsub.entityUpdated<Highlight>(
        EntityType.HIGHLIGHT,
        highlight,
        ctx.uid
      ))

    return true
  } catch (e) {
    logger.error('failed to update highlight in elastic', e)
    return false
  }
}
