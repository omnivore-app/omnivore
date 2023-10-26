import * as Sentry from '@sentry/serverless'
import * as jwt from 'jsonwebtoken'
import { getIntegrationClient, updateIntegration } from './integrations'
import { search } from './item'

interface ExportRequest {
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

export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function isExportRequest(body: any): body is ExportRequest {
  return (
    'integrationId' in body && 'syncAt' in body && 'integrationName' in body
  )
}

export const exporter = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    const JWT_SECRET = process.env.JWT_SECRET
    const REST_BACKEND_ENDPOINT = process.env.REST_BACKEND_ENDPOINT

    if (!JWT_SECRET || !REST_BACKEND_ENDPOINT) {
      return res.status(500).send('Environment not configured correctly')
    }

    const token = (req.query.token || req.headers.authorization) as string
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
      if (!isExportRequest(req.body)) {
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
