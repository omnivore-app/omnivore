import { Highlight, Page, PageContext, SearchResponse } from './types'
import { ResponseError } from '@elastic/elasticsearch/lib/errors'
import { client, INDEX_ALIAS } from './index'
import { SortBy, SortOrder, SortParams } from '../generated/graphql'

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
                  }`,
          lang: 'painless',
          params: {
            highlight: highlight,
          },
        },
      },
      refresh: ctx.refresh,
      retry_on_conflict: 3,
    })

    return body.result === 'updated'
  } catch (e) {
    if (
      e instanceof ResponseError &&
      e.message === 'document_missing_exception'
    ) {
      console.log('page has been deleted', id)
      return false
    }
    console.error('failed to add highlight to a page in elastic', e)
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
              match: {
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
    console.error('failed to get highlight from a page in elastic', e)
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
          source:
            'ctx._source.highlights.removeIf(h -> h.id == params.highlightId)',
          lang: 'painless',
          params: {
            highlightId: highlightId,
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

    return body.result === 'updated'
  } catch (e) {
    console.error('failed to delete a highlight in elastic', e)

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
): Promise<[any[], number] | undefined> => {
  try {
    const { from = 0, size = 10, sort, query } = args
    const sortOrder = sort?.order === SortOrder.Ascending ? 'asc' : 'desc'
    // default sort by updatedAt
    const sortField = sort?.by === SortBy.Score ? '_score' : 'updatedAt'

    const searchBody = {
      query: {
        nested: {
          path: 'highlights',
          query: {
            bool: {
              filter: [
                {
                  term: {
                    userId,
                  },
                },
              ],
              should: [
                {
                  multi_match: {
                    query,
                    fields: ['quote', 'annotation'],
                    operator: 'and',
                    type: 'cross_fields',
                  },
                },
              ],
              minimum_should_match: 1,
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
          inner_hits: {},
        },
      },
      _source: ['highlights', 'title', 'slug', 'url', 'createdAt'],
    }

    console.log('searching highlights in elastic', JSON.stringify(searchBody))

    const response = await client.search<SearchResponse<Page>>({
      index: INDEX_ALIAS,
      body: searchBody,
    })

    if (response.body.hits.total.value === 0) {
      return [[], 0]
    }

    const results: any[] = []
    response.body.hits.hits.forEach((hit) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      hit.inner_hits.highlights.hits.hits.forEach(
        (innerHit: { _source: Highlight }) => {
          results.push({
            ...hit._source,
            ...innerHit._source,
          })
        }
      )
    })

    return [
      results,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      response.body.hits.total.value,
    ]
  } catch (e) {
    console.error('failed to search highlights in elastic', e)
    return undefined
  }
}
