import { File, Storage } from '@google-cloud/storage'
import * as Sentry from '@sentry/serverless'
import { stringify } from 'csv-stringify'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import * as jwt from 'jsonwebtoken'
import { DateTime } from 'luxon'
import { promisify } from 'util'
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
const signToken = promisify(jwt.sign)

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

const createSystemToken = async (
  claims: Claims,
  secret: string
): Promise<string> => {
  return signToken(
    {
      ...claims,
      system: true,
    },
    secret
  ) as Promise<string>
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

      const systemToken = await createSystemToken(claims, JWT_SECRET)

      const { integrationId, syncAt, integrationName } = req.body
      const client = getIntegrationClient(integrationName)

      // get paginated items from the backend
      const first = 50
      let hasMore = true
      let after = '0'
      while (hasMore) {
        const updatedSince = new Date(syncAt)
        console.log('searching for items...', {
          userId: claims.uid,
          first,
          after,
          updatedSince,
        })
        const response = await search(
          REST_BACKEND_ENDPOINT,
          systemToken,
          client.highlightOnly,
          updatedSince,
          first,
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
        const size = items.length
        console.log('exporting items...', {
          userId: claims.uid,
          size,
          hasMore,
        })

        if (size === 0) {
          break
        }
        const synced = await client.export(claims.token, items)
        if (!synced) {
          console.error('failed to export item', {
            integrationId,
          })
          return res.status(400).send('Failed to sync')
        }

        const lastItemUpdatedAt = items[size - 1].updatedAt
        console.log('updating integration...', {
          userId: claims.uid,
          integrationId,
          syncedAt: lastItemUpdatedAt,
        })
        // update integration syncedAt if successful
        const updated = await updateIntegration(
          REST_BACKEND_ENDPOINT,
          integrationId,
          lastItemUpdatedAt,
          integrationName,
          claims.token,
          systemToken,
          'EXPORT'
        )

        if (!updated) {
          console.error('failed to update integration', {
            integrationId,
          })
          return res.status(400).send('Failed to update integration')
        }
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

    const systemToken = await createSystemToken(claims, JWT_SECRET)

    let writeStream: NodeJS.WritableStream | undefined
    try {
      const userId = claims.uid
      const integrationClient = getIntegrationClient(req.body.integrationName)

      let offset = 0
      let syncedAt = req.body.syncAt
      const since = syncedAt
      const stateToImport = req.body.state || State.UNARCHIVED // default to unarchived

      console.log('importing pages from integration...', {
        userId,
        stateToImport,
        since,
      })
      // get pages from integration
      const retrieved = await integrationClient.retrieve({
        token: claims.token,
        since,
        offset,
        state: stateToImport,
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
          retrievedData
            .filter((row) => {
              // filter out items that are deleted
              if (row.state === State.DELETED) {
                return false
              }

              // filter out items that archived if the stateToImport is unarchived
              return (
                stateToImport !== State.UNARCHIVED ||
                row.state !== State.ARCHIVED
              )
            })
            .forEach((row) => stringifier.write(row))

          // get next pages from the integration
          offset += retrievedData.length

          const retrieved = await integrationClient.retrieve({
            token: claims.token,
            since,
            offset,
            state: stateToImport,
          })
          syncedAt = retrieved.since || Date.now()
          retrievedData = retrieved.data

          console.log('retrieved data', {
            userId,
            total: offset,
            size: retrievedData.length,
          })
        } while (retrievedData.length > 0 && offset < 20000) // limit to 20k pages
      }

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
        systemToken,
        'IMPORT',
        null
      )
      if (!result) {
        console.error('failed to update integration', {
          userId,
          integrationId: req.body.integrationId,
        })
        return res.status(500).send('Failed to update integration')
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
