import { PubSub } from '@google-cloud/pubsub'
import { GetSignedUrlConfig, Storage } from '@google-cloud/storage'
import * as Sentry from '@sentry/serverless'
import { parsePdf } from './pdf'

Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

const pubsub = new PubSub()
const storage = new Storage()
const CONTENT_UPDATE_TOPIC = 'updatePageContent'

interface StorageEventData {
  bucket: string
  name: string
  contentType: string
}

function isStorageEventData(event: any): event is StorageEventData {
  return 'name' in event && 'bucket' in event && 'contentType' in event
}

// Ensure this is a finalize event and that it is stored in the `u/` directory and is a PDF
const shouldHandle = (data: StorageEventData) => {
  return (
    data.name.startsWith('u/') &&
    data.contentType.toLowerCase() === 'application/pdf'
  )
}

const getDocumentUrl = async (
  data: StorageEventData
): Promise<URL | undefined> => {
  const options: GetSignedUrlConfig = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 240 * 60 * 1000,
  }

  try {
    const bucket = storage.bucket(data.bucket)
    const file = bucket.file(data.name)
    const [url] = await file.getSignedUrl(options)
    return new URL(url)
  } catch (e) {
    console.debug('error getting signed url', e)
    return undefined
  }
}

export const updatePageContent = (
  fileId: string,
  content: string,
  title?: string,
  author?: string,
  description?: string
): Promise<string | undefined> => {
  return pubsub
    .topic(CONTENT_UPDATE_TOPIC)
    .publish(
      Buffer.from(
        JSON.stringify({ fileId, content, title, author, description })
      )
    )
    .catch((err) => {
      console.error('error publishing conentUpdate:', err)
      return undefined
    })
}

const getStorageEventData = (
  pubSubMessage: string
): StorageEventData | undefined => {
  try {
    const str = Buffer.from(pubSubMessage, 'base64').toString().trim()
    const obj = JSON.parse(str) as unknown
    if (isStorageEventData(obj)) {
      return obj
    }
  } catch (err) {
    console.log('error deserializing event: ', { pubSubMessage, err })
  }
  return undefined
}

export const pdfHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    if ('message' in req.body && 'data' in req.body.message) {
      const pubSubMessage = req.body.message.data as string
      const data = getStorageEventData(pubSubMessage)
      if (data) {
        try {
          if (shouldHandle(data)) {
            console.log('handling pdf data', data)

            const url = await getDocumentUrl(data)
            console.log('PDF url: ', url)
            if (!url) {
              console.log('Could not fetch PDF', data.bucket, data.name)
              return res.status(404).send('Could not fetch PDF')
            }

            const parsed = await parsePdf(url)
            const result = await updatePageContent(
              data.name,
              parsed.content,
              parsed.title,
              parsed.author,
              parsed.description
            )
            console.log(
              'publish result',
              result,
              'title',
              parsed.title,
              'author',
              parsed.author
            )
          } else {
            console.log('not handling pdf data', data)
          }
        } catch (err) {
          console.log('error handling event', { err, data })
          return res.status(500).send('Error handling event')
        }
      }
    } else {
      console.log('no pubsub message')
    }
    res.send('ok')
  }
)
