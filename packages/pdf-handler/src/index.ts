import {
  EventFunction,
  CloudFunctionsContext,
} from '@google-cloud/functions-framework/build/src/functions'
import { Storage } from '@google-cloud/storage'
import { PubSub } from '@google-cloud/pubsub'
import { parsePdf } from './pdf'

const pubsub = new PubSub()
const storage = new Storage()
const CONTENT_UPDATE_TOPIC = 'updatePageContent'

interface StorageEventData {
  bucket: string
  name: string
  contentType: string
}

// Ensure this is a finalize event and that it is stored in the `u/` directory and is a PDF
const shouldHandle = (data: StorageEventData, ctx: CloudFunctionsContext) => {
  if (ctx.eventType !== 'google.storage.object.finalize') {
    return false
  }
  if (
    !data.name.startsWith('u/') ||
    data.contentType.toLowerCase() != 'application/pdf'
  ) {
    return false
  }
  return true
}

const getDocumentUrl = (data: StorageEventData): URL | undefined => {
  try {
    const bucket = storage.bucket(data.bucket)
    const file = bucket.file(data.name)
    return new URL(file.publicUrl())
  } catch (e) {
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

export const pdfHandler: EventFunction = async (event, context) => {
  const data = event as StorageEventData
  const ctx = context as CloudFunctionsContext

  if (shouldHandle(data, ctx)) {
    console.log('handling pdf data', data)

    const url = getDocumentUrl(data)
    if (!url) {
      console.log('Could not fetch PDF', data.bucket, data.name)
      return
    }

    const parsed = await parsePdf(url)
    const res = await updatePageContent(
      data.name,
      parsed.content,
      parsed.title,
      parsed.author,
      parsed.description
    )
    console.log('publish result', res)
  } else {
    console.log('not handling pdf data', data)
  }
}
