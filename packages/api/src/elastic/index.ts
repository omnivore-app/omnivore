/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { env } from '../env'
import { Client } from '@elastic/elasticsearch'
import { Label, PageType } from '../generated/graphql'

export type Page = {
  id?: string
  userId: string
  title: string
  author?: string
  description?: string
  content: string
  url?: string
  hash: string
  uploadFileId?: string
  image?: string
  pageType: PageType
  originalHtml?: string
  slug: string
  labels?: Label[]
  readingProgress: number
  readingProgressAnchorIndex: number
  createdAt: Date
  updatedAt: Date
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
          },
          url: {
            type: 'keyword',
          },
          hash: {
            type: 'text',
          },
          uploadFileId: {
            type: 'keyword',
          },
          image: {
            type: 'text',
          },
          pageType: {
            type: 'keyword',
          },
          originalHtml: {
            type: 'text',
          },
          slug: {
            type: 'text',
          },
          labels: {
            type: 'nested',
            properties: {
              id: {
                type: 'keyword',
              },
              name: {
                type: 'text',
              },
              color: {
                type: 'text',
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
          updatedAt: {
            type: 'date',
          },
          publishedAt: {
            type: 'date',
          },
          savedAt: {
            type: 'date',
          },
          sharedAt: {
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
    })
  } catch (e) {
    console.error('failed to update a page in elastic', e)
  }
}

export const deletePage = async (id: string): Promise<void> => {
  await client.delete({
    index: INDEX_NAME,
    id,
  })
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
          term: {
            _id: id,
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

export const initElasticsearch = async (): Promise<void> => {
  const response = await client.info()
  console.log('elastic info: ', response)

  // check if index exists
  const indexExists = await client.indices.exists({
    index: INDEX_NAME,
  })
  if (!indexExists.body) {
    console.log('ingesting index...')
    await ingest()
  }

  await client.indices.refresh({ index: INDEX_NAME })
  console.log('elastic client is ready')
}
