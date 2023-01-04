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

import axios, { AxiosResponse } from 'axios'
import { promisify } from 'util'
import * as jwt from 'jsonwebtoken'

const signToken = promisify(jwt.sign)

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

const importCompletedTask = async (userId: string, urlsEnqueued: number) => {
  if (!process.env.JWT_SECRET) {
    throw 'Envrionment not setup correctly'
  }

  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 1 day
  const authToken = await signToken(
    { uid: userId, exp },
    process.env.JWT_SECRET
  )
  const headers = {
    Authorization: `auth=${authToken}`,
  }

  createCloudTask(
    {
      userId,
      subject: 'Your Omnivore import has completed processing',
      body: `${urlsEnqueued} URLs have been pcoessed and should be available in your library.`,
    },
    headers
  )
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

    const regex = new RegExp('imports/(.*?)/')
    const groups = regex.exec(data.name)
    if (!groups || groups.length < 2) {
      console.log('could not match file pattern: ', data.name)
      return
    }
    const userId = [...groups][1]
    if (!userId) {
      console.log('could not extract userId from file name')
      return
    }

    let countImported = 0
    await handler(stream, async (url): Promise<void> => {
      try {
        // Imports are stored in the format imports/<user id>/<type>-<uuid>.csv
        const result = await importURL(userId, url, 'csv-importer')
        console.log('import url result', result)
        countImported = countImported + 1
      } catch (err) {
        console.log('error importing url', err)
      }
    })

    await importCompletedTask(userId, countImported)
  }
}
