import archiver, { Archiver } from 'archiver'
import { v4 as uuidv4 } from 'uuid'
import { LibraryItem } from '../entity/library_item'
import { findHighlightsByLibraryItemId } from '../services/highlights'
import { searchLibraryItems } from '../services/library_item'
import { sendExportCompletedEmail } from '../services/send_emails'
import { findActiveUser } from '../services/user'
import { logger } from '../utils/logger'
import { highlightToMarkdown } from '../utils/parser'
import { createGCSFile, generateDownloadSignedUrl } from '../utils/uploads'

export interface ExportJobData {
  userId: string
}

export const EXPORT_JOB_NAME = 'export'
const GCS_BUCKET = 'omnivore-export'

const uploadToBucket = async (
  userId: string,
  items: Array<LibraryItem>,
  cursor: number,
  size: number,
  archive: Archiver
): Promise<number> => {
  // Add the metadata.json file to the root of the zip
  const metadata = items.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.description,
    author: item.author,
    url: item.originalUrl,
    state: item.state,
    readingProgress: item.readingProgressBottomPercent,
    thumbnail: item.thumbnail,
    labels: item.labelNames,
    savedAt: item.savedAt,
    updatedAt: item.updatedAt,
    publishedAt: item.publishedAt,
  }))

  const endCursor = cursor + size
  archive.append(JSON.stringify(metadata, null, 2), {
    name: `metadata_${cursor}_to_${endCursor}.json`,
  })

  // Loop through the items and add files to /content and /highlights directories
  for (const item of items) {
    const slug = item.slug
    // Add content files to /content
    archive.append(item.readableContent, {
      name: `content/${slug}.html`,
    })

    if (item.highlightAnnotations?.length) {
      const highlights = await findHighlightsByLibraryItemId(item.id, userId)
      const markdown = highlights.map(highlightToMarkdown).join('\n\n')

      // Add highlight files to /highlights
      archive.append(markdown, {
        name: `highlights/${slug}.md`,
      })
    }
  }

  return endCursor
}

export const exportJob = async (jobData: ExportJobData) => {
  const { userId } = jobData
  const user = await findActiveUser(userId)
  if (!user) {
    logger.error('user not found', {
      userId,
    })
    return
  }

  logger.info('exporting all items...', {
    userId,
  })

  // export data as a zip file:
  // exports/{userId}/{date}/{uuid}.zip
  //  - metadata.json
  //  - /content
  //    - {slug}.html
  //  - /highlights
  //    - {slug}.md
  const dateStr = new Date().toISOString()
  const fileUuid = uuidv4()
  const fullPath = `exports/${userId}/${dateStr}/${fileUuid}.zip`

  const file = createGCSFile(GCS_BUCKET, fullPath)

  // Create a write stream
  const writeStream = file.createWriteStream({
    metadata: {
      contentType: 'application/zip',
    },
  })

  // Handle any errors in the streams
  writeStream.on('error', (err) => {
    console.error('Error writing to GCS:', err)
  })

  writeStream.on('finish', () => {
    console.log('File successfully written to GCS')
  })

  // Initialize archiver for zipping files
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Compression level
  })

  // Handle any archiver errors
  archive.on('error', (err) => {
    console.error('Error zipping files:', err)
    throw err
  })

  // Pipe the archiver output to the write stream
  archive.pipe(writeStream)

  try {
    // fetch data from the database
    const batchSize = 20
    let cursor = 0
    let hasNext = false
    do {
      const items = await searchLibraryItems(
        {
          from: cursor,
          size: batchSize,
          query: 'in:all',
          includeContent: false,
          includeDeleted: false,
          includePending: false,
        },
        userId
      )

      const size = items.length
      // write data to the csv file
      if (size > 0) {
        cursor = await uploadToBucket(userId, items, cursor, size, archive)

        hasNext = size === batchSize
      }
    } while (hasNext)
  } catch (err) {
    console.error('Error exporting data:', err)
  } finally {
    // Finalize the archive
    await archive.finalize()
  }

  // generate a temporary signed url for the zip file
  const signedUrl = await generateDownloadSignedUrl(fullPath, {
    expires: 60 * 60 * 24, // 24 hours
    bucketName: GCS_BUCKET,
  })

  const job = await sendExportCompletedEmail(userId, signedUrl)
  if (!job) {
    logger.error('failed to send export completed email', {
      userId,
      signedUrl,
    })

    throw new Error('failed to send export completed email')
  }
}
