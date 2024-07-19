import { File, Storage } from '@google-cloud/storage'
import { Omnivore } from '@omnivore-app/api'
import { RedisDataSource } from '@omnivore/utils'
import * as Sentry from '@sentry/serverless'
import { stringify } from 'csv-stringify'
import * as dotenv from 'dotenv'
import * as jwt from 'jsonwebtoken'
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

export const sendExportCompletedEmail = async (
  redisDataSource: RedisDataSource,
  emailAddress: string,
  urlToDownload: string
) => {
  return queueEmailJob(redisDataSource, {
    to: emailAddress,
    subject: 'Your Omnivore export is ready',
    html: `<p>Your export is ready. You can download it from the following link: <a href="${urlToDownload}">${urlToDownload}</a></p>`,
  })
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
      // write the list of urls to a csv file and upload it to gcs
      // path style: exports/<uid>/<date>/<uuid>.csv
      const dateStr = new Date().toISOString()
      const fileUuid = uuidv4()
      const fullPath = `exports/${claims.uid}/${dateStr}/${fileUuid}.csv`
      // open a write_stream to the file
      const file = createGCSFile(GCS_BUCKET, fullPath)
      const writeStream = file.createWriteStream({
        contentType: 'text/csv',
      })
      // stringify the data and pipe it to the write_stream
      const stringifier = stringify({
        header: true,
        columns: ['url', 'state', 'labels'],
      })
      stringifier.pipe(writeStream)

      // fetch data from the database
      const omnivore = new Omnivore({
        apiKey: claims.token,
      })

      let cursor = 0
      do {
        const response = await omnivore.items.search({
          first: 50,
          after: cursor,
        })

        const items = response.edges.map((edge) => edge.node)
        cursor = response.pageInfo.endCursor
          ? parseInt(response.pageInfo.endCursor)
          : 0

        // write data to the csv file
        if (items.length > 0) {
          // write the list of urls, state and labels to the stream
          items.forEach((row) => stringifier.write(row))
        }
      } while (cursor)

      writeStream.end()

      // generate a temporary signed url for the csv file
      const signedUrl = await createSignedUrl(file)
      console.log('signed url', signedUrl)

      // TODO: get the user's email from the database
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
