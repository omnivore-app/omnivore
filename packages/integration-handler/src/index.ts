import { File, Storage } from '@google-cloud/storage'
import * as Sentry from '@sentry/serverless'
import { stringify } from 'csv-stringify'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import * as jwt from 'jsonwebtoken'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { getIntegrationClient, updateIntegration } from './integrations'
import { State } from './integrations/integration'
import { search } from './item'

interface IntegrationRequest {
  integrationId: string
  syncAt: number // unix timestamp in milliseconds
  integrationName: string
  state?: State
}

interface Claims {
  uid: string
  token: string
}

dotenv.config()

Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

const storage = new Storage()

export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function isIntegrationRequest(body: any): body is IntegrationRequest {
  return (
    'integrationId' in body && 'syncAt' in body && 'integrationName' in body
  )
}

const createGCSFile = (bucket: string, filename: string): File => {
  return storage.bucket(bucket).file(filename)
}

export const exporter = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    console.log('start to export to integration')

    const JWT_SECRET = process.env.JWT_SECRET
    const REST_BACKEND_ENDPOINT = process.env.REST_BACKEND_ENDPOINT

    if (!JWT_SECRET || !REST_BACKEND_ENDPOINT) {
      return res.status(500).send('Environment not configured correctly')
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
      return res.status(401).send('UNAUTHORIZED')
    }

    try {
      if (!isIntegrationRequest(req.body)) {
        console.error('Invalid message')
        return res.status(200).send('Bad Request')
      }

      const { integrationId, syncAt, integrationName } = req.body
      const client = getIntegrationClient(integrationName)

      // get paginated items from the backend
      let hasMore = true
      let after = '0'
      while (hasMore) {
        console.log('searching for items...')
        const response = await search(
          REST_BACKEND_ENDPOINT,
          token,
          client.highlightOnly,
          new Date(syncAt),
          '50',
          after
        )

        if (!response) {
          console.error('failed to search for items', {
            integrationId,
          })
          return res.status(400).send('Failed to search')
        }

        hasMore = response.data.search.pageInfo.hasNextPage
        after = response.data.search.pageInfo.endCursor
        const items = response.data.search.edges.map((edge) => edge.node)
        if (items.length === 0) {
          break
        }

        console.log('exporting items...')
        const synced = await client.export(claims.token, items)
        if (!synced) {
          console.error('failed to export item', {
            integrationId,
          })
          return res.status(400).send('Failed to sync')
        }

        console.log('updating integration...')
        // update integration syncedAt if successful
        const updated = await updateIntegration(
          REST_BACKEND_ENDPOINT,
          integrationId,
          items[items.length - 1].updatedAt,
          integrationName,
          claims.token,
          token,
          'EXPORT'
        )

        if (!updated) {
          console.error('failed to update integration', {
            integrationId,
          })
          return res.status(400).send('Failed to update integration')
        }

        // avoid rate limiting
        await wait(500)
      }

      console.log('done')
    } catch (err) {
      console.error('export with integration failed', err)
      return res.status(500).send(err)
    }

    res.sendStatus(200)
  }
)

export const importer = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    console.log('start to import from integration')

    const JWT_SECRET = process.env.JWT_SECRET
    const REST_BACKEND_ENDPOINT = process.env.REST_BACKEND_ENDPOINT
    const GCS_BUCKET = process.env.GCS_UPLOAD_BUCKET

    if (!JWT_SECRET || !REST_BACKEND_ENDPOINT || !GCS_BUCKET) {
      return res.status(500).send('Environment not configured correctly')
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
      return res.status(401).send('UNAUTHORIZED')
    }

    if (!isIntegrationRequest(req.body)) {
      console.error('Invalid message')
      return res.status(200).send('Bad Request')
    }

    let writeStream: NodeJS.WritableStream | undefined
    try {
      const userId = claims.uid
      const integrationClient = getIntegrationClient(req.body.integrationName)

      let offset = 0
      let syncedAt = req.body.syncAt
      const since = syncedAt
      const state = req.body.state || State.UNARCHIVED // default to unarchived

      console.log('importing pages from integration...', {
        userId,
        state,
        since,
      })
      // get pages from integration
      const retrieved = await integrationClient.retrieve({
        token: claims.token,
        since,
        offset,
        state,
      })
      syncedAt = retrieved.since || Date.now()
      let retrievedData = retrieved.data

      console.log('retrieved data', {
        userId,
        total: offset,
        size: retrievedData.length,
      })

      // if there are pages to import
      if (retrievedData.length > 0) {
        // write the list of urls to a csv file and upload it to gcs
        // path style: imports/<uid>/<date>/<type>-<uuid>.csv
        const dateStr = DateTime.now().toISODate()
        const fileUuid = uuidv4()
        const fullPath = `imports/${userId}/${dateStr}/${integrationClient.name}-${fileUuid}.csv`
        // open a write_stream to the file
        const file = createGCSFile(GCS_BUCKET, fullPath)
        writeStream = file.createWriteStream({
          contentType: 'text/csv',
        })
        // stringify the data and pipe it to the write_stream
        const stringifier = stringify({
          header: true,
          columns: ['url', 'state', 'labels'],
        })
        stringifier.pipe(writeStream)

        // paginate api calls to the integration
        do {
          // write the list of urls, state and labels to the stream
          retrievedData.forEach((row) => stringifier.write(row))

          // get next pages from the integration
          offset += retrievedData.length

          const retrieved = await integrationClient.retrieve({
            token: claims.token,
            since,
            offset,
            state,
          })
          syncedAt = retrieved.since || Date.now()
          retrievedData = retrieved.data

          console.log('retrieved data', {
            userId,
            total: offset,
            size: retrievedData.length,
          })

          console.log('updating integration...', {
            userId,
            integrationId: req.body.integrationId,
            syncedAt,
          })
          // update the integration's syncedAt and remove taskName
          const result = await updateIntegration(
            REST_BACKEND_ENDPOINT,
            req.body.integrationId,
            new Date(syncedAt),
            req.body.integrationName,
            claims.token,
            token,
            'IMPORT',
            null
          )
          if (!result) {
            console.error('failed to update integration', {
              userId,
              integrationId: req.body.integrationId,
            })
            return res.status(400).send('Failed to update integration')
          }
        } while (retrievedData.length > 0 && offset < 20000) // limit to 20k pages
      }

      console.log('done')
    } catch (err) {
      console.error('import pages from integration failed', {
        userId: claims.uid,
        err,
      })
      return res.status(500).send(err)
    } finally {
      console.log('closing write stream')
      writeStream?.end()
    }

    res.sendStatus(200)
  }
)
