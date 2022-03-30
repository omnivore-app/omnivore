import { env } from '../env'
import { Client } from '@elastic/elasticsearch'
import { readFileSync } from 'fs'
import { join } from 'path'

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

const ingest = async (): Promise<void> => {
  // read index settings from file
  const indexSettings = readFileSync(
    join(__dirname, '..', '..', 'index_settings.json'),
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
    console.log('elastic info: ', response)

    // check if index exists
    const { body: indexExists } = await client.indices.exists({
      index: INDEX_ALIAS,
    })
    if (!indexExists) {
      console.log('ingesting index...')
      await ingest()

      await client.indices.refresh({ index: INDEX_ALIAS })
    }
    console.log('elastic client is ready')
  } catch (e) {
    console.error('failed to init elasticsearch', e)
    throw e
  }
}
