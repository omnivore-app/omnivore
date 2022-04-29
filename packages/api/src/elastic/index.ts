import { env } from '../env'
import { Client } from '@elastic/elasticsearch'

export const INDEX_NAME = 'pages'
export const INDEX_ALIAS = 'pages_alias'
export const client = new Client({
  node: env.elastic.url,
  maxRetries: 3,
  requestTimeout: 50000,
  auth: {
    username: env.elastic.username,
    password: env.elastic.password,
  },
})

export const initElasticsearch = async (): Promise<void> => {
  try {
    const response = await client.info()
    console.log('elastic info: ', response)

    // check if index exists
    const { body: indexExists } = await client.indices.exists({
      index: INDEX_ALIAS,
    })
    if (!indexExists) {
      throw new Error('elastic index does not exist')
    }
    console.log('elastic client is ready')
  } catch (e) {
    console.error('failed to init elasticsearch', e)
    throw e
  }
}
