import {
  EventFunction,
  CloudFunctionsContext,
} from '@google-cloud/functions-framework/build/src/functions'
import { Storage } from '@google-cloud/storage'
import { importCsv, UrlHandler } from './csv'
import * as path from 'path'
import { importMatterHistory } from './matterHistory'
import { Stream } from 'node:stream'
import { v4 as uuid } from 'uuid'
import { createCloudTask } from './task'

const storage = new Storage()

interface StorageEventData {
  bucket: string
  name: string
  contentType: string
}

type importHandlerFunc = (
  stream: Stream,
  handler: UrlHandler
) => Promise<number>

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
  return createCloudTask({
    userId,
    source,
    url: url.toString(),
    saveRequestId: uuid(),
  })
}

const handlerForFile = (name: string): importHandlerFunc | undefined => {
  const fileName = path.parse(name).name
  if (fileName.startsWith('MATTER')) {
    return importMatterHistory
  } else if (fileName.startsWith('URL_LIST')) {
    return importCsv
  }

  return undefined
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

    const handler = handlerForFile(data.name)
    if (!handler) {
      console.log('no handler for file:', data.name)
      return
    }

    await handler(stream, async (url): Promise<void> => {
      try {
        // Imports are stored in the format imports/<user id>/<type>-<uuid>.csv
        const regex = new RegExp('imports/(.*?)/')
        const groups = regex.exec(data.name)
        if (!groups || groups.length < 2) {
          console.log('could not match file pattern: ', data.name)
          return
        }
        const userId = [...groups][1]
        const result = await importURL(userId, url, 'csv-importer')
        console.log('import url result', result)
      } catch (err) {
        console.log('error importing url', err)
      }
    })
  }
}
