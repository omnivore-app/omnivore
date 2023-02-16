/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import express from 'express'
import { EntityType, readPushSubscription } from '../../datalayer/pubsub'
import { getPageById, searchPages } from '../../elastic/pages'
import { Page } from '../../elastic/types'
import { Integration, IntegrationType } from '../../entity/integration'
import { getRepository } from '../../entity/utils'
import { syncWithIntegration } from '../../services/integrations'
import { buildLogger } from '../../utils/logger'
import { DateFilter } from '../../utils/search'

export interface Message {
  type?: EntityType
  id?: string
  userId: string
  pageId?: string
  articleId?: string
}

const logger = buildLogger('app.dispatch')

export function integrationsServiceRouter() {
  const router = express.Router()

  router.post('/:integrationName/:action', async (req, res) => {
    logger.info('start to sync with integration', {
      action: req.params.action,
      integrationName: req.params.integrationName,
    })
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
      const data: Message = JSON.parse(msgStr)
      const userId = data.userId
      const type = data.type
      if (!userId) {
        logger.info('No userId found in message')
        res.status(400).send('Bad Request')
        return
      }

      const integration = await getRepository(Integration).findOneBy({
        user: { id: userId },
        name: req.params.integrationName.toUpperCase(),
        type: IntegrationType.Export,
        enabled: true,
      })
      if (!integration) {
        logger.info('No active integration found for user', { userId })
        res.status(200).send('No integration found')
        return
      }

      const action = req.params.action.toUpperCase()
      const integrationService = getIntegrationService(integration.name)
      if (action === 'SYNC_UPDATED') {
        // get updated page by id
        let id: string | undefined
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
        if (!id) {
          logger.info('No id found in message')
          res.status(400).send('Bad Request')
          return
        }
        const page = await getPageById(id)
        if (!page) {
          logger.info('No page found for id', { id })
          res.status(200).send('No page found')
          return
        }
        if (page.userId !== userId) {
          logger.info('Page does not belong to user', { id, userId })
          return res.status(200).send('Page does not belong to user')
        }
        // sync updated page with integration
        logger.info('syncing updated page with integration', {
          integrationId: integration.id,
          pageId: page.id,
        })

        const synced = await integrationService.export(integration, [page])
        if (!synced) {
          logger.info('failed to sync page', {
            integrationId: integration.id,
            pageId: page.id,
          })
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
          )) as [Page[], number]
          const pageIds = pages.map((p) => p.id)

          logger.info('syncing pages', { pageIds })

          const synced = await integrationService.export(integration, pages)
          if (!synced) {
            logger.info('failed to sync pages', {
              pageIds,
              integrationId: integration.id,
            })
            res.status(400).send('Failed to sync')
            return
          }
        }
        // delete task name if completed
        await getRepository(Integration).update(integration.id, {
          taskName: null,
        })
      } else {
        logger.info('unknown action', { action })
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
