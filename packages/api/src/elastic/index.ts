/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { env } from '../env'
import { Client } from '@elastic/elasticsearch'
import { Label, PageType, SortOrder, SortParams } from '../generated/graphql'
import {
  InFilter,
  LabelFilter,
  LabelFilterType,
  ReadFilter,
} from '../utils/search'

export type Page = {
  id?: string
  userId: string
  title: string
  author?: string
  description?: string
  content: string
  url?: string
  hash: string
  uploadFileId?: string | null
  image?: string
  pageType: PageType
  originalHtml?: string | null
  slug: string
  labels?: Label[]
  readingProgress?: number
  readingProgressAnchorIndex?: number
  createdAt: Date
  updatedAt?: Date
  publishedAt?: Date
  savedAt?: Date
  sharedAt?: Date
  archivedAt?: Date
}

const INDEX_NAME = 'pages'
const client = new Client({
  node: env.elastic.url,
  auth: {
    username: env.elastic.username,
    password: env.elastic.password,
  },
})

const ingest = async (): Promise<void> => {
  await client.indices.create({
    index: INDEX_NAME,
    body: {
      settings: {
        analysis: {
          analyzer: {
            my_custom_analyzer: {
              tokenizer: 'standard',
              filter: ['lowercase'],
              char_filter: ['html_strip'],
            },
          },
        },
      },
      mappings: {
        properties: {
          userId: {
            type: 'keyword',
          },
          title: {
            type: 'text',
          },
          author: {
            type: 'text',
          },
          description: {
            type: 'text',
          },
          content: {
            type: 'text',
            analyzer: 'my_custom_analyzer',
          },
          url: {
            type: 'keyword',
          },
          uploadFileId: {
            type: 'keyword',
          },
          pageType: {
            type: 'keyword',
          },
          slug: {
            type: 'text',
          },
          labels: {
            type: 'nested',
            properties: {
              name: {
                type: 'keyword',
              },
            },
          },
          readingProgress: {
            type: 'float',
          },
          readingProgressAnchorIndex: {
            type: 'integer',
          },
          createdAt: {
            type: 'date',
          },
          savedAt: {
            type: 'date',
          },
          archivedAt: {
            type: 'date',
          },
        },
      },
    },
  })
}

export const createPage = async (data: Page): Promise<string | undefined> => {
  try {
    const { body } = await client.index({
      id: data.id,
      index: INDEX_NAME,
      body: data,
      refresh: true,
    })

    return body._id as string
  } catch (e) {
    console.error('failed to create a page in elastic', e)
    return undefined
  }
}

export const updatePage = async (id: string, data: Page): Promise<void> => {
  try {
    await client.update({
      index: INDEX_NAME,
      id,
      body: {
        doc: data,
      },
      refresh: true,
    })
  } catch (e) {
    console.error('failed to update a page in elastic', e)
  }
}

export const deletePage = async (id: string): Promise<void> => {
  try {
    await client.delete({
      index: INDEX_NAME,
      id,
      refresh: true,
    })
  } catch (e) {
    console.error('failed to delete a page in elastic', e)
  }
}

export const getPageByUrl = async (url: string): Promise<Page | undefined> => {
  try {
    const { body } = await client.search({
      index: INDEX_NAME,
      body: {
        query: {
          term: {
            url,
          },
        },
      },
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
    const { body } = await client.search({
      index: INDEX_NAME,
      body: {
        query: {
          ids: {
            values: [id],
          },
        },
      },
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

export const searchPages = async (
  args: {
    from: number
    size: number
    sort?: SortParams
    query?: string
    inFilter: InFilter
    readFilter: ReadFilter
    typeFilter: PageType | undefined
    labelFilters: LabelFilter[]
  },
  userId: string,
  notNullField: string | null = null
): Promise<[Page[], number] | undefined> => {
  try {
    const {
      from,
      size,
      sort,
      query,
      readFilter,
      typeFilter,
      labelFilters,
      inFilter,
    } = args
    const sortOrder = sort?.order === SortOrder.Ascending ? 'asc' : 'desc'

    const { body } = await client.search({
      index: INDEX_NAME,
      body: {
        sort: [
          {
            savedAt: {
              order: sortOrder,
              format: 'strict_date_optional_time_nanos',
            },
          },
          {
            createdAt: {
              order: sortOrder,
              format: 'strict_date_optional_time_nanos',
            },
          },
          {
            _id: sortOrder,
          },
          '_score',
        ],
        query: {
          bool: {
            filter: [
              {
                term: {
                  userId,
                },
              },
              typeFilter && {
                term: {
                  pageType: typeFilter,
                },
              },
              inFilter !== InFilter.ALL && inFilterQuery(inFilter),
              readFilter !== ReadFilter.ALL && {
                range: {
                  readingProgress: readFilterRange(readFilter),
                },
              },
              labelFilters.length > 0 && labelFiltersQuery(labelFilters),
              {
                exists: {
                  field: notNullField,
                },
              },
            ],
            should: {
              multi_match: {
                query,
                fields: [
                  'title',
                  'content',
                  'author',
                  'description',
                  'slug',
                  'url',
                ],
              },
            },
          },
        },
        from,
        size,
      },
    })

    if (body.hits.total.value === 0) {
      return [[], 0]
    }

    return [
      body.hits.hits.map(
        (hit: { _source: Page; _id: string }) =>
          ({
            ...hit._source,
            id: hit._id,
          } as Page)
      ) as Page[],
      body.hits.total.value,
    ]
  } catch (e) {
    console.error('failed to search pages in elastic', e)
    return undefined
  }
}

const readFilterRange = (filter: ReadFilter) => {
  switch (filter) {
    case ReadFilter.UNREAD:
      return { lt: 98 }
    case ReadFilter.READ:
      return { gte: 98 }
  }
}

const inFilterQuery = (filter: InFilter) => {
  switch (filter) {
    case InFilter.ARCHIVE:
      return {
        exists: {
          field: 'archivedAt',
        },
      }
    case InFilter.INBOX:
      return {
        bool: {
          must_not: {
            exists: {
              field: 'archivedAt',
            },
          },
        },
      }
  }
}

const labelFiltersQuery = (filters: LabelFilter[]) => {
  return {
    bool: filters.map((filter) => {
      switch (filter.type) {
        case LabelFilterType.ANY:
          return {
            must: {
              match: {
                'labels.name': filter.labels,
              },
            },
          }
        case LabelFilterType.NONE:
          return {
            must_not: {
              match: {
                'labels.name': filter.labels,
              },
            },
          }
      }
    }),
  }
}

export const initElasticsearch = async (): Promise<void> => {
  try {
    const response = await client.info()
    console.log('elastic info: ', response)

    // check if index exists
    const { body: indexExists } = await client.indices.exists({
      index: INDEX_NAME,
    })
    if (!indexExists) {
      console.log('ingesting index...')
      await ingest()
    }

    await client.indices.refresh({ index: INDEX_NAME })
    console.log('elastic client is ready')
  } catch (e) {
    console.error('failed to init elasticsearch', e)
    throw e
  }
}
