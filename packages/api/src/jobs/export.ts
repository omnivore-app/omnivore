import archiver, { Archiver } from 'archiver'
import { v4 as uuidv4 } from 'uuid'
import { LibraryItem, LibraryItemState } from '../entity/library_item'
import { TaskState } from '../generated/graphql'
import { findExportById, saveExport } from '../services/export'
import { findHighlightsByLibraryItemId } from '../services/highlights'
import {
  countLibraryItems,
  findLibraryItemById,
  searchLibraryItems,
} from '../services/library_item'
import { sendExportJobEmail } from '../services/send_emails'
import { findActiveUser } from '../services/user'
import { logger } from '../utils/logger'
import { highlightToMarkdown } from '../utils/parser'
import { env } from '../env'
import { storage } from '../repository/storage/storage'
import { File } from '../repository/storage/StorageClient'
import { Readable } from 'stream'
import { contentFilePath, generateUploadFilePathName } from '../utils/uploads'
import { getRepository } from '../repository'
import { UploadFile } from '../entity/upload_file'

export interface ExportJobData {
  userId: string
  exportId: string
}

const bucketName = env.fileUpload.gcsUploadBucket

const createGCSFile = (filename: string): File => {
  return storage.createFile(bucketName, filename)
}

export const EXPORT_JOB_NAME = 'export'

const itemStateMappping = (state: LibraryItemState) => {
  switch (state) {
    case LibraryItemState.Archived:
      return 'Archived'
    case LibraryItemState.ContentNotFetched:
    case LibraryItemState.Succeeded:
      return 'Active'
    default:
      return 'Unknown'
  }
}

const uploadContent = async (
  userId: string,
  libraryItem: LibraryItem,
  archive: Archiver
) => {
  const filePath = contentFilePath({
    userId,
    libraryItemId: libraryItem.id,
    format: 'readable',
    savedAt: libraryItem.savedAt,
    updatedAt: libraryItem.updatedAt,
  })

  const file = createGCSFile(filePath)

  // check if file is already uploaded
  const exists = await file.exists()
  if (!exists) {
    logger.info(`File not found: ${filePath}`)

    // upload the content to GCS
    const item = await findLibraryItemById(libraryItem.id, userId, {
      select: ['readableContent'],
    })
    if (!item?.readableContent) {
      logger.error('Item not found', {
        userId,
        libraryItemId: libraryItem.id,
      })
      return
    }

    await file.save(item.readableContent, {
      contentType: 'text/html',
      private: true,
    })
    archive.append(Readable.from(item.readableContent), {
      name: `content/${libraryItem.slug}.html`,
    })
  }

  // append the existing file to the archive
  const content = await file.download()
  archive.append(Readable.from(content.toString()), {
    name: `content/${libraryItem.slug}.html`,
  })
}

const uploadPdfContent = async (
  libraryItem: LibraryItem,
  archive: Archiver
) => {
  const upload = await getRepository(UploadFile).findOneBy({
    id: libraryItem.uploadFileId,
  })
  if (!upload || !upload.fileName) {
    console.log(
      `upload does not have a filename: ${upload?.fileName ?? 'empty'}`
    )
    return
  }

  const filePath = generateUploadFilePathName(upload.id, upload.fileName)
  const file = createGCSFile(filePath)
  const exists = await file.exists()
  if (exists) {
    console.log(`adding PDF file: ${filePath}`)
    // append the existing file to the archive
    archive.append(await file.download(), {
      name: `content/${libraryItem.slug}.pdf`,
    })
  }
}

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
    state: itemStateMappping(item.state),
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
    // Add content files to /content
    if (item.uploadFileId) {
      await uploadPdfContent(item, archive)
    } else {
      await uploadContent(userId, item, archive)
    }

    if (item.highlightAnnotations?.length) {
      const highlights = await findHighlightsByLibraryItemId(item.id, userId)
      const markdown = highlights.map(highlightToMarkdown).join('\n\n')

      // Add highlight files to /highlights
      archive.append(markdown, {
        name: `highlights/${item.slug}.md`,
      })
    }
  }

  return endCursor
}

export const exportJob = async (jobData: ExportJobData) => {
  const { userId, exportId } = jobData
  logger.info('starting export job', {
    userId,
    exportId,
  })

  try {
    const user = await findActiveUser(userId)
    if (!user) {
      logger.error('user not found', {
        userId,
      })
      return
    }

    const exportTask = await findExportById(exportId, userId)
    if (!exportTask) {
      logger.error('export task not found', {
        userId,
        exportId,
      })
      return
    }

    await saveExport(userId, {
      id: exportId,
      state: TaskState.Running,
    })

    const emailJob = await sendExportJobEmail(userId, 'started')
    if (!emailJob) {
      logger.error('Failed to send export job email', {
        userId,
      })
      return
    }

    const itemCount = await countLibraryItems(
      {
        query: 'in:all',
        includeContent: false,
        includeDeleted: false,
        includePending: false,
      },
      userId
    )

    await saveExport(userId, {
      id: exportId,
      state: TaskState.Running,
      totalItems: itemCount,
    })

    logger.info(`exporting ${itemCount} items...`, {
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

    const file = createGCSFile(fullPath)

    // Create a write stream
    const writeStream = file.createWriteStream({
      contentType: 'application/zip',
    })

    const finishedPromise = new Promise<void>((resolve, reject) => {
      if (writeStream.closed) {
        resolve()
      }
      writeStream.on('finish', () => {
        logger.info('File successfully written to GCS')
        resolve()
      })
      writeStream.on('error', reject)
    })

    // Handle any errors in the streams
    writeStream.on('error', (err) => {
      logger.error('Error writing to GCS:', err)
    })

    // Initialize archiver for zipping files
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Compression level
    })

    // Handle any archiver errors
    archive.on('error', (err) => {
      throw err
    })

    // Pipe the archiver output to the write stream
    archive.pipe(writeStream)
    let cursor = 0
    try {
      // fetch data from the database
      const batchSize = 20
      for (cursor = 0; cursor < itemCount; cursor += batchSize) {
        logger.info(`export extracting ${cursor} of ${itemCount}`, {
          userId,
          exportId,
        })

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
          await uploadToBucket(userId, items, cursor, size, archive)
          await saveExport(userId, {
            id: exportId,
            processedItems: cursor,
          })
        } else {
          break
        }
      }
    } finally {
      // Finalize the archive
      await archive.finalize()
    }

    // Ensure that the writeStream has finished
    await finishedPromise

    logger.info(`export completed, exported ${cursor} items`, {
      userId,
    })

    // generate a temporary signed url for the zip file
    const signedUrl = await storage.signedUrl(bucketName, fullPath, {
      action: 'read',
      expires: Date.now() + 168 * 60 * 60 * 1000, // one week
    })

    logger.info('signed url for export:', {
      userId,
      signedUrl,
    })

    await saveExport(userId, {
      id: exportId,
      state: TaskState.Succeeded,
      signedUrl,
      processedItems: itemCount,
    })

    const job = await sendExportJobEmail(userId, 'completed', signedUrl)
    if (!job) {
      logger.error('failed to send export completed email', {
        userId,
        signedUrl,
      })
    }
  } catch (error) {
    logger.error('export failed', error)

    await saveExport(userId, {
      id: exportId,
      state: TaskState.Failed,
    })

    const job = await sendExportJobEmail(userId, 'failed')
    if (!job) {
      logger.error('failed to send export failed email', {
        userId,
      })
    }
  }
}
