import * as Sentry from '@sentry/serverless'
import * as jwt from 'jsonwebtoken'
import { getIntegrationClient, updateIntegration } from './integrations'
import { search } from './item'
import { stringify } from 'csv-stringify'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { File, Storage } from '@google-cloud/storage'

interface IntegrationRequest {
  integrationId: string
  syncAt: number // unix timestamp in milliseconds
  integrationName: string
}

interface Claims {
  uid: string
  token: string
}

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
    const JWT_SECRET = process.env.JWT_SECRET
    const REST_BACKEND_ENDPOINT = process.env.REST_BACKEND_ENDPOINT

    if (!JWT_SECRET || !REST_BACKEND_ENDPOINT) {
      return res.status(500).send('Environment not configured correctly')
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const token = (req.cookies?.token || req.headers.authorization) as string
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
        const response = await search(
          REST_BACKEND_ENDPOINT,
          claims.token,
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

        const synced = await client.export(claims.token, items)
        if (!synced) {
          console.error('failed to export item', {
            integrationId,
          })
          return res.status(400).send('Failed to sync')
        }

        // update integration syncedAt if successful
        const updated = await updateIntegration(
          REST_BACKEND_ENDPOINT,
          integrationId,
          items[items.length - 1].updatedAt,
          integrationName,
          claims.token,
          token
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
    } catch (err) {
      console.error('export with integration failed', err)
      return res.status(500).send(err)
    }

    res.sendStatus(200)
  }
)

export const importer = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    const JWT_SECRET = process.env.JWT_SECRET
    const REST_BACKEND_ENDPOINT = process.env.REST_BACKEND_ENDPOINT
    const GCS_BUCKET = process.env.GCS_BUCKET

    if (!JWT_SECRET || !REST_BACKEND_ENDPOINT || !GCS_BUCKET) {
      return res.status(500).send('Environment not configured correctly')
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const token = (req.cookies?.token || req.headers.authorization) as string
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

      // get pages from integration
      const retrieved = await integrationClient.retrieve({
        token: claims.token,
        since,
        offset,
      })
      syncedAt = retrieved.since || Date.now()

      let retrievedData = retrieved.data
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
          })
          syncedAt = retrieved.since || Date.now()
          retrievedData = retrieved.data

          console.log('retrieved data', {
            total: offset,
            size: retrievedData.length,
          })

          // update the integration's syncedAt and remove taskName
          const result = await updateIntegration(
            REST_BACKEND_ENDPOINT,
            req.body.integrationId,
            new Date(syncedAt),
            req.body.integrationName,
            claims.token,
            token
          )
          if (!result) {
            console.error('failed to update integration', {
              integrationId: req.body.integrationId,
            })
            return res.status(400).send('Failed to update integration')
          }
        } while (retrievedData.length > 0 && offset < 20000) // limit to 20k pages
      }
    } catch (err) {
      console.error('import pages from integration failed', err)
      return res.status(500).send(err)
    } finally {
      writeStream?.end()
    }

    res.sendStatus(200)
  }
)
