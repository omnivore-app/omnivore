import {
  EventFunction,
  CloudFunctionsContext,
} from '@google-cloud/functions-framework/build/src/functions'
import { Storage } from '@google-cloud/storage'
import { PubSub } from '@google-cloud/pubsub'
import { importCsv } from './csv'
import * as path from 'path'

const pubsub = new PubSub()
const storage = new Storage()
const IMPORT_URL_UPDATE_TOPIC = 'importURL'

interface StorageEventData {
  bucket: string
  name: string
  contentType: string
}

const shouldHandle = (data: StorageEventData, ctx: CloudFunctionsContext) => {
  console.log('deciding to handle', ctx, data)
  if (ctx.eventType !== 'google.storage.object.finalize') {
    return false
  }
  if (
    !data.name.startsWith('imports/') ||
    data.contentType.toLowerCase() != 'text/csv'
  ) {
    return false
  }
  return true
}

const importURL = async (
  userId: string,
  url: URL,
  source: string
): Promise<string | undefined> => {
  return pubsub
    .topic(IMPORT_URL_UPDATE_TOPIC)
    .publish(Buffer.from(JSON.stringify({ userId, url, source })))
    .catch((err) => {
      console.error('error publishing url:', err)
      return undefined
    })
}

export const importHandler: EventFunction = async (event, context) => {
  const data = event as StorageEventData
  const ctx = context as CloudFunctionsContext

  if (shouldHandle(data, ctx)) {
    console.log('handling csv data', data)

    const stream = storage
      .bucket(data.bucket)
      .file(data.name)
      .createReadStream()

    await importCsv(stream, async (url): Promise<void> => {
      try {
        // Imports are stored in the format imports/<import id>/<user id>.extension
        const userId = path.parse(data.name).name
        const result = await importURL(userId, url, 'csv-importer')
        console.log('import url result', result)
      } catch (err) {
        console.log('error importing url', err)
      }
    })
  }
}
