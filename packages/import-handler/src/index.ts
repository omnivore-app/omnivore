import { Storage } from '@google-cloud/storage'
import { importCsv } from './csv'
import * as path from 'path'
import { importMatterArchive, importMatterHistoryCsv } from './matterHistory'
import { Stream } from 'node:stream'
import { v4 as uuid } from 'uuid'
import { CONTENT_FETCH_URL, createCloudTask, emailUserUrl } from './task'

import axios from 'axios'
import { promisify } from 'util'
import * as jwt from 'jsonwebtoken'
import { Readability } from '@omnivore/readability'

import * as Sentry from '@sentry/serverless'

Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

const signToken = promisify(jwt.sign)

const storage = new Storage()

const CONTENT_TYPES = ['text/csv', 'application/zip']

export type UrlHandler = (ctx: ImportContext, url: URL) => Promise<void>
export type ContentHandler = (
  ctx: ImportContext,
  url: URL,
  title: string,
  originalContent: string,
  parseResult: Readability.ParseResult
) => Promise<void>

export type ImportContext = {
  userId: string
  countImported: number
  countFailed: number
  urlHandler: UrlHandler
  contentHandler: ContentHandler
}

type importHandlerFunc = (ctx: ImportContext, stream: Stream) => Promise<void>

interface StorageEvent {
  name: string
  bucket: string
  contentType: string
}

function isStorageEvent(event: any): event is StorageEvent {
  return 'name' in event && 'bucket' in event && 'contentType' in event
}

const shouldHandle = (data: StorageEvent) => {
  if (
    !data.name.startsWith('imports/') ||
    CONTENT_TYPES.indexOf(data.contentType.toLocaleLowerCase()) == -1
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
  return createCloudTask(CONTENT_FETCH_URL, {
    userId,
    source,
    url: url.toString(),
    saveRequestId: uuid(),
  })
}

const createEmailCloudTask = async (userId: string, payload: unknown) => {
  if (!process.env.JWT_SECRET) {
    throw 'Envrionment not setup correctly'
  }

  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 1 day
  const authToken = (await signToken(
    { uid: userId, exp },
    process.env.JWT_SECRET
  )) as string
  const headers = {
    Cookie: `auth=${authToken}`,
  }

  return createCloudTask(emailUserUrl(), payload, headers)
}

const sendImportFailedEmail = async (userId: string) => {
  return createEmailCloudTask(userId, {
    subject: 'Your Omnivore import failed.',
    body: `There was an error importing your file. Please ensure you uploaded the correct file type, if you need help, please email feedback@omnivore.app`,
  })
}

const sendImportCompletedEmail = async (
  userId: string,
  urlsEnqueued: number,
  urlsFailed: number
) => {
  return createEmailCloudTask(userId, {
    subject: 'Your Omnivore import has completed processing',
    body: `${urlsEnqueued} URLs have been processed and should be available in your library. ${urlsFailed} URLs failed to be parsed.`,
  })
}

const handlerForFile = (name: string): importHandlerFunc | undefined => {
  const fileName = path.parse(name).name
  if (fileName.startsWith('MATTER')) {
    return importMatterArchive
  } else if (fileName.startsWith('URL_LIST')) {
    return importCsv
  }

  return undefined
}

const urlHandler = async (ctx: ImportContext, url: URL): Promise<void> => {
  try {
    // Imports are stored in the format imports/<user id>/<type>-<uuid>.csv
    const result = await importURL(ctx.userId, url, 'csv-importer')
    if (result) {
      ctx.countImported += 1
    }
  } catch (err) {
    console.log('error importing url', err)
  }
}

const sendSavePageMutation = async (userId: string, input: unknown) => {
  const JWT_SECRET = process.env.JWT_SECRET
  const REST_BACKEND_ENDPOINT = process.env.REST_BACKEND_ENDPOINT

  if (!JWT_SECRET || !REST_BACKEND_ENDPOINT) {
    throw 'Environment not configured correctly'
  }

  const data = JSON.stringify({
    query: `mutation SavePage ($input: SavePageInput!){
          savePage(input:$input){
            ... on SaveSuccess{
              url
              clientRequestId
            }
            ... on SaveError{
                errorCodes
            }
          }
    }`,
    variables: {
      input: Object.assign({}, input, { source: 'puppeteer-parse' }),
    },
  })

  const auth = (await signToken({ uid: userId }, JWT_SECRET)) as string
  const response = await axios.post(`${REST_BACKEND_ENDPOINT}/graphql`, data, {
    headers: {
      Cookie: `auth=${auth};`,
      'Content-Type': 'application/json',
    },
  })
  console.log('save page response: ', response)

  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  return !!response.data.data.savePage
}

const contentHandler = async (
  ctx: ImportContext,
  url: URL,
  title: string,
  originalContent: string,
  parseResult: Readability.ParseResult
): Promise<void> => {
  const requestId = uuid()
  const apiResponse = await sendSavePageMutation(ctx.userId, {
    url,
    clientRequestId: requestId,
    title,
    originalContent,
    parseResult,
  })
  if (!apiResponse) {
    return Promise.reject()
  }
  return Promise.resolve()
}

const handleEvent = async (data: StorageEvent) => {
  if (shouldHandle(data)) {
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

    const ctx = {
      userId,
      countImported: 0,
      countFailed: 0,
      urlHandler,
      contentHandler,
    }

    await handler(ctx, stream)

    if (ctx.countImported > 0) {
      await sendImportCompletedEmail(userId, ctx.countImported, ctx.countFailed)
    } else {
      await sendImportFailedEmail(userId)
    }
  }
}

export const importHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    if ('message' in req.body && 'data' in req.body.message) {
      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      const pubSubMessage = req.body.message.data as string
      const str = Buffer.from(pubSubMessage, 'base64').toString().trim()
      const obj = JSON.parse(str) as unknown
      if (isStorageEvent(obj)) {
        await handleEvent(obj)
      }
    } else {
      console.log('no pubsub message')
    }
    res.send('ok')
  }
)
