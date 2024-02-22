/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import express from 'express'
import { Integration, IntegrationType } from '../../entity/integration'
import { readPushSubscription } from '../../pubsub'
import { getRepository } from '../../repository'
import { enqueueExportAllItems } from '../../utils/createTask'
import { logger } from '../../utils/logger'
import { createIntegrationToken } from '../auth/jwt_helpers'

export function integrationsServiceRouter() {
  const router = express.Router()

  router.post('/export', async (req, res) => {
    logger.info('start to sync with integration')

    try {
      const { message: msgStr, expired } = readPushSubscription(req)
      if (!msgStr) {
        return res.status(200).send('Bad Request')
      }

      if (expired) {
        logger.info('discarding expired message')
        return res.status(200).send('Expired')
      }

      // find all active integrations
      const integrations = await getRepository(Integration).find({
        where: {
          enabled: true,
          type: IntegrationType.Export,
        },
        relations: ['user'],
      })

      // create a task to sync with each integration
      await Promise.all(
        integrations.map(async (integration) => {
          const authToken = await createIntegrationToken({
            uid: integration.user.id,
            token: integration.token,
          })

          if (!authToken) {
            logger.error('failed to create auth token', {
              integrationId: integration.id,
            })
            return
          }

          return enqueueExportAllItems(integration.id, integration.user.id)
        })
      )
    } catch (err) {
      logger.error('sync with integrations failed', err)
      return res.status(500).send(err)
    }

    res.status(200).send('OK')
  })

  return router
}
