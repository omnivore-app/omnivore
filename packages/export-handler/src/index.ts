import { File, Storage } from '@google-cloud/storage'
import { Highlight, Omnivore } from '@omnivore-app/api'
import { RedisDataSource } from '@omnivore/utils'
import * as Sentry from '@sentry/serverless'
import archiver from 'archiver'
import * as dotenv from 'dotenv'
import * as jwt from 'jsonwebtoken'
import { PassThrough } from 'stream'
import { v4 as uuidv4 } from 'uuid'
import { queueEmailJob } from './job'

dotenv.config()

Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

interface Claims {
  uid: string
  token: string
}

const storage = new Storage()
const GCS_BUCKET = process.env.GCS_UPLOAD_BUCKET || 'omnivore-export'

const createGCSFile = (bucket: string, filename: string): File => {
  return storage.bucket(bucket).file(filename)
}

const createSignedUrl = async (file: File): Promise<string> => {
  const signedUrl = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  })
  return signedUrl[0]
}

const sendExportCompletedEmail = async (
  redisDataSource: RedisDataSource,
  userId: string,
  urlToDownload: string
) => {
  return queueEmailJob(redisDataSource, {
    userId,
    subject: 'Your Omnivore export is ready',
    html: `<p>Your export is ready. You can download it from the following link: <a href="${urlToDownload}">${urlToDownload}</a></p>`,
  })
}

const formatHighlightQuote = (quote: string): string => {
  // replace all empty lines with blockquote '>' to preserve paragraphs
  return quote.replace(/^(?=\n)$|^\s*?\n/gm, '> ')
}

const highlightToMarkdown = (highlight: Highlight): string => {
  if (highlight.type === 'HIGHLIGHT' && highlight.quote) {
    const quote = formatHighlightQuote(highlight.quote)
    const labels = highlight.labels?.map((label) => `#${label.name}`).join(' ')
    const note = highlight.annotation
    return `> ${quote} ${labels ? `\n\n${labels}` : ''}${
      note ? `\n\n${note}` : ''
    }`
  }

  return ''
}

export const exporter = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    console.log('start to export')

    const JWT_SECRET = process.env.JWT_SECRET
    if (!JWT_SECRET) {
      return res.status(500).send({ errorCode: 'ENV_NOT_CONFIGURED' })
    }

    const token = req.get('Omnivore-Authorization')
    if (!token) {
      return res.status(401).send({ errorCode: 'INVALID_TOKEN' })
    }

    let claims: Claims
    try {
      claims = jwt.verify(token, JWT_SECRET) as Claims
    } catch (e) {
      console.error(e)
      return res.status(401).send({ errorCode: 'INVALID_TOKEN' })
    }

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
      // export data as a zip file:
      // exports/{userId}/{date}/{uuid}.zip
      //  - metadata.json
      //  - /content
      //    - {slug}.html
      //  - /highlights
      //    - {slug}.md
      const dateStr = new Date().toISOString()
      const fileUuid = uuidv4()
      const fullPath = `exports/${claims.uid}/${dateStr}/${fileUuid}.zip`

      const file = createGCSFile(GCS_BUCKET, fullPath)

      // Create a PassThrough stream
      const passthroughStream = new PassThrough()

      // Pipe the PassThrough stream to the GCS file write stream
      const writeStream = file.createWriteStream({
        metadata: {
          contentType: 'application/zip',
        },
      })

      passthroughStream.pipe(writeStream)

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
        throw err
      })

      // Pipe the archiver output to the PassThrough stream
      archive.pipe(passthroughStream)

      // fetch data from the database
      const omnivore = new Omnivore({
        apiKey: claims.token,
      })

      const batchSize = 20
      let cursor = 0
      let hasNext = false
      do {
        const response = await omnivore.items.search({
          first: batchSize,
          after: cursor,
          includeContent: true,
          query: 'in:all',
        })

        const items = response.edges.map((edge) => edge.node)

        const size = items.length
        // write data to the csv file
        if (size > 0) {
          // Add the metadata.json file to the root of the zip
          const metadata = items.map((item) => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            description: item.description,
            author: item.author,
            url: item.originalArticleUrl,
            state: item.isArchived ? 'archived' : 'active',
            readingProgress: item.readingProgressPercent,
            thumbnail: item.image,
            labels: item.labels?.map((label) => label.name),
            savedAt: item.savedAt,
            updatedAt: item.updatedAt,
            publishedAt: item.publishedAt,
          }))

          archive.append(JSON.stringify(metadata, null, 2), {
            name: `metadata_${cursor}_to_${cursor + size}.json`,
          })

          // Loop through the items and add files to /content and /highlights directories
          items.forEach((item) => {
            const slug = item.slug
            const content = item.content
            const highlights = item.highlights
            if (content) {
              // Add content files to /content
              archive.append(content, {
                name: `content/${slug}.html`,
              })
            }

            if (highlights?.length) {
              const markdown = highlights.map(highlightToMarkdown).join('\n\n')

              // Add highlight files to /highlights
              archive.append(markdown, {
                name: `highlights/${slug}.md`,
              })
            }
          })

          cursor = response.pageInfo.endCursor
            ? parseInt(response.pageInfo.endCursor)
            : 0
          hasNext = response.pageInfo.hasNextPage
        }
      } while (hasNext)

      // Finalize the archive
      await archive.finalize()

      // Wait until the zip file is completely written
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve)
        writeStream.on('error', reject)
      })

      // generate a temporary signed url for the csv file
      const signedUrl = await createSignedUrl(file)
      console.log('signed url', signedUrl)

      await sendExportCompletedEmail(redisDataSource, claims.uid, signedUrl)

      console.log('done')
    } catch (err) {
      console.error('export failed', err)

      return res.status(500).send({ errorCode: 'INTERNAL_SERVER_ERROR' })
    } finally {
      await redisDataSource.shutdown()
    }

    res.sendStatus(200)
  }
)
