import { Storage } from '@google-cloud/storage'
import { Readability } from '@omnivore/readability'
import { RedisDataSource } from '@omnivore/utils'
import * as Sentry from '@sentry/serverless'
import axios from 'axios'
import 'dotenv/config'
import * as jwt from 'jsonwebtoken'
import { Stream } from 'node:stream'
import * as path from 'path'
import { promisify } from 'util'
import { v4 as uuid } from 'uuid'
import { importCsv } from './csv'
import { enqueueFetchContentJob, queueEmailJob } from './job'
import { importMatterArchive } from './matterHistory'
import { ImportStatus, updateMetrics } from './metrics'

export enum ArticleSavingRequestStatus {
  Failed = 'FAILED',
  Processing = 'PROCESSING',
  Succeeded = 'SUCCEEDED',
  Deleted = 'DELETED',

  Archived = 'ARCHIVED',
}

Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

const signToken = promisify(jwt.sign)

const storage = new Storage()

const CONTENT_TYPES = ['text/csv', 'application/zip']

export type UrlHandler = (
  ctx: ImportContext,
  url: URL,
  state?: ArticleSavingRequestStatus,
  labels?: string[],
  savedAt?: Date,
  publishedAt?: Date
) => Promise<void>
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
  redisDataSource: RedisDataSource
  taskId: string
  source: string
}

type importHandlerFunc = (ctx: ImportContext, stream: Stream) => Promise<void>

interface UpdateMetricsRequest {
  taskId: string
  status: ImportStatus
}

function isUpdateMetricsRequest(body: any): body is UpdateMetricsRequest {
  return 'taskId' in body && 'status' in body
}

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
  redisDataSource: RedisDataSource,
  userId: string,
  url: URL,
  source: string,
  taskId: string,
  state?: ArticleSavingRequestStatus,
  labels?: string[],
  savedAt?: Date,
  publishedAt?: Date
): Promise<string | undefined> => {
  return enqueueFetchContentJob(redisDataSource, {
    url: url.toString(),
    users: [{ id: userId, libraryItemId: '' }],
    source,
    taskId,
    state,
    labels: labels?.map((l) => {
      return { name: l }
    }),
    savedAt: savedAt?.toISOString(),
    publishedAt: publishedAt?.toISOString(),
  })
}

const sendImportFailedEmail = async (
  redisDataSource: RedisDataSource,
  userId: string
) => {
  return queueEmailJob(redisDataSource, {
    userId,
    subject: 'Your Omnivore import failed.',
    html: `There was an error importing your file. Please ensure you uploaded the correct file type, if you need help, please email feedback@omnivore.app`,
  })
}

export const sendImportStartedEmail = async (
  redisDataSource: RedisDataSource,
  userId: string,
  urlsEnqueued: number,
  urlsFailed: number
) => {
  return queueEmailJob(redisDataSource, {
    userId,
    subject: 'Your Omnivore import has started',
    html: `We have started processing ${urlsEnqueued} URLs. ${urlsFailed} URLs are invalid.`,
  })
}

export const sendImportCompletedEmail = async (
  redisDataSource: RedisDataSource,
  userId: string,
  urlsImported: number,
  urlsFailed: number
) => {
  return queueEmailJob(redisDataSource, {
    userId,
    subject: 'Your Omnivore import has finished',
    html: `We have finished processing ${
      urlsImported + urlsFailed
    } URLs. ${urlsImported} URLs have been added to your library. ${urlsFailed} URLs failed to be parsed.`,
  })
}

const handlerForFile = (name: string): importHandlerFunc | undefined => {
  const fileName = path.parse(name).name
  if (fileName.startsWith('MATTER')) {
    return importMatterArchive
  } else if (fileName.startsWith('URL_LIST') || fileName.startsWith('POCKET')) {
    return importCsv
  }

  return undefined
}

const importSource = (name: string): string => {
  const fileName = path.parse(name).name
  if (fileName.startsWith('MATTER')) {
    return 'matter-history'
  }
  if (fileName.startsWith('URL_LIST')) {
    return 'csv-importer'
  }
  if (fileName.startsWith('POCKET')) {
    return 'pocket'
  }

  return 'unknown'
}

const urlHandler = async (
  ctx: ImportContext,
  url: URL,
  state?: ArticleSavingRequestStatus,
  labels?: string[],
  savedAt?: Date,
  publishedAt?: Date
): Promise<void> => {
  try {
    // Imports are stored in the format imports/<user id>/<type>-<uuid>.csv
    const result = await importURL(
      ctx.redisDataSource,
      ctx.userId,
      url,
      ctx.source,
      ctx.taskId,
      state,
      labels && labels.length > 0 ? labels : undefined,
      savedAt,
      publishedAt
    )
    if (!result) {
      return Promise.reject('Failed to import url')
    }
  } catch (err) {
    console.log('error importing url', err)
    throw err
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
  try {
    const response = await axios.post(
      `${REST_BACKEND_ENDPOINT}/graphql`,
      data,
      {
        headers: {
          Cookie: `auth=${auth};`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30s
      }
    )

    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    return !!response.data.data.savePage
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('save page mutation error', error.message)
    } else {
      console.error(error)
    }
    return false
  }
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

const handleEvent = async (
  data: StorageEvent,
  redisDataSource: RedisDataSource
) => {
  if (shouldHandle(data)) {
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

    const stream = storage
      .bucket(data.bucket)
      .file(data.name)
      .createReadStream()

    const ctx: ImportContext = {
      userId,
      countImported: 0,
      countFailed: 0,
      urlHandler,
      contentHandler,
      redisDataSource,
      taskId: data.name,
      source: importSource(data.name),
    }

    await handler(ctx, stream)

    if (ctx.countImported > 0) {
      await sendImportStartedEmail(
        ctx.redisDataSource,
        userId,
        ctx.countImported,
        ctx.countFailed
      )
    } else {
      await sendImportFailedEmail(ctx.redisDataSource, userId)
    }
  }
}

const getStorageEvent = (pubSubMessage: string): StorageEvent | undefined => {
  try {
    const str = Buffer.from(pubSubMessage, 'base64').toString().trim()
    const obj = JSON.parse(str) as unknown
    if (isStorageEvent(obj)) {
      return obj
    }
  } catch (err) {
    console.log('error deserializing event: ', { pubSubMessage, err })
  }
  return undefined
}

export const importHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    if ('message' in req.body && 'data' in req.body.message) {
      const pubSubMessage = req.body.message.data as string
      const obj = getStorageEvent(pubSubMessage)
      if (obj) {
        // create redis source
        const redisDataSource = new RedisDataSource({
          cache: {
            url: process.env.REDIS_URL,
            cert: process.env.REDIS_CERT,
          },
          mq: {
            url: process.env.MQ_REDIS_URL,
            cert: process.env.MQ_REDIS_CERT,
          },
        })

        try {
          await handleEvent(obj, redisDataSource)
        } catch (err) {
          console.log('error handling event', { err, obj })
          throw err
        } finally {
          // close redis client
          await redisDataSource.shutdown()
        }
      }
    } else {
      console.log('no pubsub message')
    }
    res.send('ok')
  }
)

export const importMetricsCollector = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not exists')
      return res.status(500).send({ errorCodes: 'JWT_SECRET_NOT_EXISTS' })
    }
    const token = req.headers.authorization
    if (!token) {
      return res.status(401).send({ errorCode: 'INVALID_TOKEN' })
    }

    let userId: string

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        uid: string
      }
      userId = decoded.uid
    } catch (e) {
      console.error('Authentication error:', e)
      return res.status(401).send({ errorCode: 'UNAUTHENTICATED' })
    }

    if (!isUpdateMetricsRequest(req.body)) {
      console.log('Invalid request body')
      return res.status(400).send('Bad Request')
    }

    // create redis source
    const redisDataSource = new RedisDataSource({
      cache: {
        url: process.env.REDIS_URL,
        cert: process.env.REDIS_CERT,
      },
      mq: {
        url: process.env.MQ_REDIS_URL,
        cert: process.env.MQ_REDIS_CERT,
      },
    })

    try {
      // update metrics
      await updateMetrics(
        redisDataSource,
        userId,
        req.body.taskId,
        req.body.status
      )
    } catch (error) {
      console.error('Error updating metrics', error)
      return res.status(500).send('Error updating metrics')
    } finally {
      await redisDataSource.shutdown()
    }

    res.send('ok')
  }
)
