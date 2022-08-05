/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import express from 'express'
import { EntityType, readPushSubscription } from '../../datalayer/pubsub'
import { getRepository } from '../../entity/utils'
import { Integration, IntegrationType } from '../../entity/integration'
import { buildLogger } from '../../utils/logger'
import { syncWithIntegration } from '../../services/integrations'
import { getPageById, searchPages } from '../../elastic/pages'
import { Page } from '../../elastic/types'
import { DateFilter } from '../../utils/search'

interface Message {
  type?: EntityType
  data?: any
  userId: string
}

const logger = buildLogger('app.dispatch')

export function integrationsServiceRouter() {
  const router = express.Router()

  router.post('/:integrationType/:action', async (req, res) => {
    logger.info(
      req.params.action,
      'with integration',
      req.params.integrationType
    )
    const { message: msgStr, expired } = readPushSubscription(req)

    if (!msgStr) {
      res.status(400).send('Bad Request')
      return
    }

    if (expired) {
      logger.info('discarding expired message')
      res.status(200).send('Expired')
      return
    }

    try {
      const { userId, type, data }: Message = JSON.parse(msgStr)
      if (!userId) {
        console.log('No userId found in message')
        res.status(400).send('Bad Request')
        return
      }

      const integration = await getRepository(Integration).findOneBy({
        user: { id: userId },
        type: req.params.integrationType.toUpperCase() as IntegrationType,
        enabled: true,
      })
      if (!integration) {
        logger.info('No active integration found for user', userId)
        res.status(200).send('No integration found')
        return
      }

      const action = req.params.action.toUpperCase()
      if (action === 'SYNC_UPDATED') {
        // get updated page by id
        let id = ''
        switch (type) {
          case EntityType.PAGE:
            id = data.id
            break
          case EntityType.HIGHLIGHT:
            id = data.articleId
            break
          case EntityType.LABEL:
            id = data.pageId
            break
        }
        const page = await getPageById(id)
        if (!page) {
          logger.info('No page found for id', id)
          res.status(200).send('No page found')
          return
        }
        // sync updated page with integration
        logger.info('syncing page', page.id, 'with integration', integration.id)

        const synced = await syncWithIntegration(integration, [page])
        if (!synced) {
          logger.info(
            'failed to sync page',
            page.id,
            'with integration',
            integration.id
          )
          res.status(400).send('Failed to sync')
          return
        }
      } else if (action === 'SYNC_ALL') {
        // sync all pages of the user
        const size = 50

        for (
          let hasNextPage = true, count = 0, after = 0, pages: Page[] = [];
          hasNextPage;
          after += size, hasNextPage = count > after
        ) {
          const syncedAt = integration.syncedAt
          // only sync pages that were updated after syncedAt
          const dateFilters: DateFilter[] = []
          syncedAt &&
            dateFilters.push({ field: 'updatedAt', startDate: syncedAt })
          ;[pages, count] = (await searchPages(
            { from: after, size, dateFilters },
            userId
          ))!
          const pageIds = pages.map((p) => p.id)

          logger.info('syncing pages', pageIds)

          const synced = await syncWithIntegration(integration, pages)
          if (!synced) {
            logger.info(
              'failed to sync pages',
              pageIds,
              'with integration',
              integration.id
            )
            res.status(400).send('Failed to sync')
            return
          }
        }
      } else {
        logger.info('unknown action', action)
        res.status(200).send('Unknown action')
        return
      }

      res.status(200).send('OK')
    } catch (err) {
      logger.error('sync with integrations failed', err)
      res.status(500).send(err)
    }
  })

  return router
}
