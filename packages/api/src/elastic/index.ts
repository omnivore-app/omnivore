import { Client } from '@elastic/elasticsearch'
import { readFileSync } from 'fs'
import { env } from '../env'
import { buildLogger } from '../utils/logger'

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
const INDEX_NAME = 'pages'
export const logger = buildLogger('elasticsearch')

const createIndex = async (): Promise<void> => {
  // read index settings from file
  const indexSettings = readFileSync(
    __dirname + '/../../../db/elastic_migrations/index_settings.json',
    'utf8'
  )

  // create index
  await client.indices.create({
    index: INDEX_NAME,
    body: indexSettings,
  })
}

export const initElasticsearch = async (): Promise<void> => {
  try {
    const response = await client.info()
    logger.info('elastic info: ', response)

    // check if index exists
    const { body: indexExists } = await client.indices.exists({
      index: INDEX_ALIAS,
    })
    if (!indexExists) {
      logger.info('creating index...')
      await createIndex()

      logger.info('refreshing index...')
      await refreshIndex()
    }
    logger.info('elastic client is ready')
  } catch (e) {
    logger.error('failed to init elasticsearch', e)
    throw e
  }
}

export const refreshIndex = async (): Promise<void> => {
  try {
    const { body } = await client.indices.refresh({
      index: INDEX_ALIAS,
    })
    logger.info('elastic refresh: ', body)
  } catch (e) {
    logger.error('failed to refresh elastic index', e)
    throw e
  }
}
