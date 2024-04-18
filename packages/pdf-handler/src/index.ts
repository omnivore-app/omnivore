import { GetSignedUrlConfig, Storage } from '@google-cloud/storage'
import * as Sentry from '@sentry/serverless'
import { parsePdf } from './pdf'
import { queueUpdatePageJob, State } from './job'

Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

const storage = new Storage()

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

export const updatePageContent = async (
  fileId: string,
  content?: string,
  title?: string,
  author?: string,
  description?: string,
  state?: State
): Promise<string | undefined> => {
  const job = await queueUpdatePageJob({
    fileId,
    content,
    title,
    author,
    description,
    state,
  })
  return job.id
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
      if (!data) {
        console.log('no data found in pubsub message')
        return res.send('ok')
      }

      if (!shouldHandle(data)) {
        console.log('not handling pdf data', data)
        return res.send('ok')
      }

      console.log('handling pdf data', data)

      let content,
        title,
        author,
        description,
        state: State = 'SUCCEEDED' // Default to succeeded even if we fail to parse

      try {
        const url = await getDocumentUrl(data)
        console.log('PDF url: ', url)
        if (!url) {
          console.log('Could not fetch PDF', data.bucket, data.name)
          // If we can't fetch the PDF, mark it as failed
          state = 'FAILED'

          return res.status(404).send('Could not fetch PDF')
        }

        // Parse the PDF to update the content and metadata
        const parsed = await parsePdf(url)
        content = parsed.content
        title = parsed.title
        author = parsed.author
        description = parsed.description
      } catch (err) {
        console.log('error parsing pdf', { err, data })

        return res.status(500).send('Error parsing pdf')
      } finally {
        // Always update the state, even if we fail to parse
        const result = await updatePageContent(
          data.name,
          content,
          title,
          author,
          description,
          state
        )
        console.log(
          'publish result',
          result,
          'title',
          title,
          'author',
          author,
          'state',
          state
        )
      }
    }

    res.send('ok')
  }
)
